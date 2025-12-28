---
author: 유대상
pubDatetime: 2025-12-27T19:59:53+09:00
title: "정적 페이지에 DB통신 추가하기(feat. Supabase Edge Function)"
slug: edge-function-for-static-page
featured: false
draft: false
type: tech
tags:
  - supabase
  - edge-function
description: 정적 페이지에 Supabase Edge Function을 이용하여 DB통신을 추가한 과정을 공유합니다
---

> 정적 페이지에 Supabase Edge Function을 이용하여 DB 통신을 추가한 과정을 공유합니다.
> 예시 페이지는 [여기](https://writing-buddy.holali-log.me)에서 확인하실 수 있습니다.

## 의사결정 과정

갑자기 떠오른 사이드 프로젝트 아이디어를 검증하기 위한 랜딩페이지를 개발하기로 했다. 해당 페이지에는 제품에 관심이 있는 잠재적 사용자가 개발 과정 및 제품 출시 알림을 전달 받을 이메일을 입력하는 폼을 추가하기로 했다.

인증/인가 등의 서버 기능은 필요하지 않았기 때문에 여러모로 효율적인 정적 페이지로 개발하기로 결정했다. 다만, 이 정적 페이지에 어떻게 이메일 입력폼을 적용할지가 고민이었다. 정적 페이지에서는 환경 변수를 안전하게 보호할 수 없고, DB에 직접 연결하는 것도 불가능하다. 정적 페이지에서 이메일을 수집하려면 결국 어딘가에는 서버 역할을 하는 레이어가 필요하다. 브라우저는 환경 변수를 안전하게 보관할 수 없고, DB에 직접 write 요청을 보내는 것도 보안상 적절하지 않기 때문이다. 전통적인 방식이라면 별도의 API 서버와 DB 서버를 구축해야 했겠지만, 수요 검증 단계에서 이는 과한 선택이었다. 서버를 상시 운영해야 하고, 배포·운영·비용 측면에서 부담이 크다. Supabase는 이러한 전통적인 서버 운영 부담을 크게 줄여준다.

Supabase는 관리형 Postgres DB를 제공할 뿐만 아니라, Edge Function이라는 서버리스 실행 환경을 함께 제공한다. 이 Edge Function은 정적 페이지와 DB 사이에서 API 서버처럼 동작하는 최소 단위의 서버 레이어라고 볼 수 있다. 특히 Supabase Edge Function은 Cloudflare Workers 런타임 위에서 실행된다. 이 덕분에 Cloudflare Pages에 배포된 정적 페이지와 같은 네트워크 상에서 동작하며, 프론트엔드에서 Edge Function으로 요청을 보낼 때 추가적인 네트워크 지연이 거의 없다. 즉, 정적 페이지 + Edge Function 조합은 성능과 구조 측면에서 자연스럽다.

## 전체적인 흐름

지금까지 Supabase Edge Function 도입하기까지의 의사결정 과정을 살펴봤다. Supabase Edge Function을 구축하기 전에 전체적인 흐름을 이해하고자 한다.

![Sequence Diagram](./sequence-diagram.svg)

1. 브라우저(정적 페이지)에서 Edge Function으로 POST 요청을 보낸다.
2. Edge Function은 받은 요청의 CORS를 위반하는지 확인한다.

```ts
// supabase/functions/<edge_function_name>/index.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://example.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
```

3. Edge Function은 service role 권한으로 Supabase DB에 insert 요청을 보낸다.

```sql
create policy "allow insert from edge function"
on <supabase_table>
for insert
to service_role
using (true)
with check (true);
```

4. 이때 DB 내부에서 RLS 정책이 평가되어, service role 요청만 insert를 허용한다.
5. 이후, Edge Function은 결과를 브라우저로 반환한다.

## Supabase Edge Function 추가하기

지금부터는 Supabase Edge Function을 추가하는 방법을 알아보자. 먼저 Supabase를 더 편리하게 다루기 위해, Supabase CLI를 설치한다.

1. Supabase CLI 설치

```sh
brew install supabase
```

2. Supabase에 CLI를 통해서 로그인 한 후, 프로젝트와 연결한다.

```sh
supabase login
supabase init
supabase link --project-ref <project_id>
# <project_id>는 dashboard > settings > general에서 찾을 수 있다.
```

3. Edge Function 생성

```sh
supabase functions new <edge_function_name>
```

위 명령어를 실행하면 `supabase/functions/` 경로에 관련 파일들을 추가한다.

4. Edge Function 작성

5. JWT 토큰 검증 여부 설정

랜딩 페이지에서 JWT 토큰 검증은 필요없기 때문에 비활성화한다. (기본값: true)

```toml
# supabase/config.toml
[functions.subscribe]
verify_jwt = false
```

6. Edge Function 배포

```sh
supabase functions deploy <edge_function_name>
```

7. RLS policy 설정

[전체적인 흐름](#전체적인-흐름)에서 설명했듯이, Edge Function은 service role만 insert 허용하는 RLS policy를 설정한다.

```sql
create policy "insert via service role only"
on <supabase_table>
for insert
to service_role
using (true)
with check (true);
```

## 정리

이렇게 되면 정적 페이지 → Edge Function → DB의 흐름이 완성된다.
Edge Function에서는 허용한 origin에서 오는 POST, OPTIONS 요청만을 처리하며, DB 접근에 필요한 service role 키는 Edge Function 내부에만 존재한다.

이로 인해 브라우저나 정적 페이지에서는 DB에 직접 접근할 수 없고, service role 키를 보유한 Edge Function을 통해서만 insert 연산이 가능하다.
DB 레벨에서는 이러한 접근을 전제로 RLS policy를 설정하여, 의도하지 않은 경로에서의 write 요청을 방지한다.

## Edge Function 코드

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Payload = {
  email: string;
  product_key: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://example.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  let payload: Payload;

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { email, product_key } = payload;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return new Response("Invalid email", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!product_key || typeof product_key !== "string") {
    return new Response("Invalid product key", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return new Response("Server misconfigured", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { error } = await supabase.from("waitlist").insert({ email, product_key });

    if (error) {
      // unique constraint (email, product_key) 대응
      if (error.code === "23505") {
        return new Response(JSON.stringify({ ok: true }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        });
      }

      throw error;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (err: any) {
    console.error("Insert failed:", err);

    return new Response(JSON.stringify({ message: err?.message ?? "Internal error" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
```
