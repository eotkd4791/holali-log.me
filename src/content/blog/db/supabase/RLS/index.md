---
author: 유대상
pubDatetime: 2025-05-11T13:48:48.688Z
title: "Supabase RLS는 뭔가요?"
slug: row-level-security
featured: false
draft: false
type: tech
tags:
  - supabase
  - posgresql
  - row-level security
description: RLS에 대해 공부한 내용을 정리하는 내용입니다.
---

## 개요

Supabase를 본격적으로 쓰면서 가장 먼저 맞닥뜨린 개념 중 하나가 바로 RLS(Row-Level Security)였다.
RLS는 그냥 보안 설정이 아니라, 데이터에 대한 권리와 책임을 설계하는 장치였다.
이 글은 Supabase에서 RLS를 설정하면서 내가 직접 겪은 시행착오와 배운 것들을 정리한 글이다.

## 목차

- [RLS란 무엇일까?](#rls란-무엇일까)
- [RLS 정책 만들기: USING과 WITH CHECK](#rls-정책-만들기-using과-with-check)
- [알아두면 좋은 함수, 예약어들](#알아두면-좋은-함수-예약어들)
  - [함수/예약어 설명](#함수예약어-설명)
- [PERMISSIVE vs RESTRICTIVE](#permissive-vs-restrictive)
- [target roles: anon, authenticated, service_role...](#target-roles-anon-authenticated-service_role)
  - [역할 설명](#역할-설명)
- [실전에서 내가 작성한 RLS 정책들](#실전에서-내가-작성한-rls-정책들)
- [참고자료](#참고자료)

## RLS란 무엇일까?

처음 Supabase에서 RLS를 마주했을 때, SELECT문을 실행해도 데이터를 출력하지 않았다.
이유는 RLS 때문이었다. Supabase는 RLS가 활성화되면 기본적으로 모든 쿼리를 차단한다.
권한이 있든 없든, 일단 막고 시작하고, 그 후에 policy를 통해 열 수 있는 조건을 명시적으로 설정해야 한다.

> Postgres의 Row-Level Security 기능이다. 말 그대로 “Row 단위 보안”이다.
> 즉, 테이블의 행 단위로 접근 조건을 설정할 수 있다.

## RLS 정책 만들기: USING과 WITH CHECK

- USING: “읽거나 조작해도 되는 row인가?”
- WITH CHECK: “입력하거나 수정하려는 row가 조건에 부합하는가?”

```sql
-- 본인만 자신의 데이터를 SELECT할 수 있게 하는 정책
CREATE POLICY "Allow user to select their own data"
ON users
AS PERMISSIVE
FOR SELECT
USING (auth_id = auth.uid()::text);
```

```sql
-- 회원가입 시 본인의 데이터만 insert할 수 있게 하는 정책
CREATE POLICY "Allow user to insert self"
ON users
AS PERMISSIVE
FOR INSERT
WITH CHECK (auth_id = auth.uid()::text);
```

- SELECT: USING만 필요.
- INSERT: WITH CHECK만 필요.
- UPDATE: 둘 다 필요. (`UPDATE는 “기존 row를 내가 수정할 수 있나?”와 “수정하려는 값이 정책에 맞나?” 이 두 가지가 모두 필요하기 때문`)

## 알아두면 좋은 함수, 예약어들

쿼리 안에서 마치 `현재 유저`나 `현재 시간`처럼 쓸 수 있는 내장 함수들이 존재한다.
내가 직접 써본 것들 위주로 정리해본다.

### 함수/예약어 설명

- `auth.uid()`: 현재 로그인한 Supabase 유저의 auth.users.id
- `auth.role()`: 현재 유저의 권한(anon, authenticated 등)
- `now()`: 현재 시각
- `current_user`: DB 세션의 로컬 사용자명 (거의 안 씀)
- `jwt.claims.email`: JWT 토큰에 포함된 email claim

특히 auth.uid()는 거의 모든 RLS에서 중심이 된다. Supabase의 인증 시스템은 UUID 기반이기 때문에,
내가 만든 테이블에 유저를 연결하려면 auth_id 같은 필드를 만들어서 텍스트로 저장하고, 정책에서는 이렇게 비교한다.

```sql
-- auth.uid()는 uuid인데, auth_id는 text이기 때문에 캐스팅 필요
auth_id = auth.uid()::text
```

## PERMISSIVE vs RESTRICTIVE

처음 정책을 여러 개 만들고 나서, 정책이 두 개일 땐 어떻게 동작할지 궁금했다.
Supabase는 정책의 조합을 설정할 수 있다. 기본값은 PERMISSIVE, 즉 **`하나라도 조건을 만족하면 허용`**이다.

하지만 때로는 `모든 조건을 만족해야 한다`, 즉 AND처럼 동작하게 하고 싶을 때가 있다.
그때는 RESTRICTIVE로 바꿔주면 된다.

예를 들어, 아래 두 정책이 있다고 하자.

```sql
-- active_until > now()
-- is_hidden_from_search = false
```

- `PERMISSIVE`라면 둘 중 하나만 만족해도 row를 SELECT할 수 있다.
- `RESTRICTIVE`라면 둘 다 만족해야만 SELECT된다.

## target roles: anon, authenticated, service_role...

처음에는 RLS에 TO authenticated, TO anon 같은 문구가 있어서 이게 뭔지 몰랐다.

target roles는 Supabase가 내부적으로 각 요청자에게 할당하는 역할이다.
정책에서 특정 역할에게만 적용되도록 할 수도 있다.

### 역할 설명

- anon 비로그인 사용자 (토큰 없음)
- authenticated 로그인된 일반 사용자
- service_role Supabase 서버 키 (모든 RLS 무시 가능)
- pgbouncer, authenticator 내부용 (거의 안 씀)

예를 들어, 아래처럼 설정하면 로그인한 사용자만 SELECT 가능하게 만들 수 있다.

```sql
CREATE POLICY "Logged-in users only"
ON payments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth_id = auth.uid()::text);
```

service_role은 Supabase Edge Function이나 서버 측에서 admin 권한으로 호출할 때 사용된다.
이 역할은 RLS를 무시하기 때문에 실제 서비스에서는 조심해야 한다.

## 실전에서 내가 작성한 RLS 정책들

서비스를 만들면서 작성한 대표적인 RLS 정책 예시를 정리해봤다.

```sql
-- 디자이너 프로필: 본인만 수정 가능
CREATE POLICY "Update own profile"
ON designers
AS PERMISSIVE
FOR UPDATE
USING (auth_id = auth.uid()::text)
WITH CHECK (auth_id = auth.uid()::text);
```

```sql
-- 디자이너 검색은 비로그인도 가능, 단 공개된 프로필만
CREATE POLICY "Public can search designers"
ON designers
AS PERMISSIVE
FOR SELECT
USING (active_until > now() AND is_hidden_from_search = false);
```

```sql
-- 결제 내역은 본인만 조회 가능
CREATE POLICY "User can view their own payments"
ON payments
AS PERMISSIVE
FOR SELECT
USING (auth_id = auth.uid()::text);
```

## 참고자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Policy Examples](https://supabase.com/docs/guides/auth/row-level-security#policy-examples)
- [PostgreSQL RLS 설명](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
