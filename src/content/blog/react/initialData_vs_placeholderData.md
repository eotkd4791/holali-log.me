---
author: 유대상
pubDatetime: 2025-06-08T15:14:01Z
title: "initialData와 placeholderData의 차이"
slug: initialData-vs-placeholderData
featured: false
draft: false
type: tech
tags:
  - react
  - react-query
description: initialData와 placeholderData의 차이를 설명하는 블로그 글입니다.
---

React Query에서 데이터를 불러올 때, 로딩 시 보여줄 초기 데이터를 설정하고 싶을 때가 있다. 이때 사용할 수 있는 옵션이 `initialData`와 `placeholderData`다. 둘 다 유사해 보이지만, 실제 동작은 전혀 다르다.

어떤 상황에서 어떤 옵션을 써야 할지 명확히 이해하고 있지 않다면, 의도하지 않은 UI가 나올 수 있다. 그래서 이 둘의 차이를 공부한 내용을 정리하려한다.

## 목차

1. 개념 정리
2. 주요 차이점
3. 예제 코드 비교
4. 용도
5. 정리

## 개념 정리

initialData는 “초기값이지만 믿을 수 있는 실제 데이터”로 간주된다. 캐시에 저장되며, staleTime이 지나기 전까지는 queryFn이 실행되지 않는다.

placeholderData는 “로딩 중 잠깐 보여줄 임시 데이터”다. 캐시에 저장되지 않고, queryFn은 항상 즉시 실행된다. dataUpdatedAt은 0으로 설정되어 stale로 간주된다.

## 주요 차이점

| 항목                 | initialData                      | placeholderData                   |
| -------------------- | -------------------------------- | --------------------------------- |
| 캐시에 저장됨        | ✅                               | ❌                                |
| queryFn 실행 시점    | stale하면 실행                   | 무조건 즉시 실행                  |
| dataUpdatedAt 값     | 현재 시각                        | 0 (항상 stale)                    |
| 실제 데이터로 간주됨 | ✅                               | ❌                                |
| 적합한 상황          | 이전에 받은 데이터를 재활용할 때 | 로딩 중 UI를 자연스럽게 보여줄 때 |

## 예제 코드 비교

- initialData 예시

```ts
useQuery({
  queryKey: ["user", 1],
  queryFn: fetchUserById,
  initialData: () => {
    const users = queryClient.getQueryData(["users"]);
    return users?.find((u) => u.id === 1);
  },
});
```

상위에서 이미 받아온 ['users'] 쿼리 데이터를 활용해서 상세 페이지에선 굳이 다시 요청하지 않는다. staleTime이 지나기 전까지는 queryFn도 호출되지 않는다.

- placeholderData 예시

```ts
useQuery({
  queryKey: ["user", 1],
  queryFn: fetchUserById,
  placeholderData: { id: 1, name: "불러오는 중..." },
});
```

화면에는 바로 "불러오는 중..."이라는 텍스트가 들어간 데이터를 보여준다. 하지만 이건 어디까지나 “임시”다. queryFn은 바로 실행되고, 응답이 도착하면 data는 교체된다.

## 용도

- 리스트 페이지에서 받아온 데이터를 상세 페이지에서 재사용하고 싶다면 initialData가 적절하다. 이미 신뢰할 수 있는 데이터를 받아둔 상태이므로, 굳이 다시 API를 호출할 필요가 없다.

- 응답이 오기 전까지 사용자에게 뭔가 의미 있는 화면을 보여주고 싶다면 placeholderData를 쓰는 게 좋다. skeleton 대신 사용할 수도 있고, 실제 데이터와 비슷한 구조의 임시 데이터를 넣어두면 로딩이 더 자연스럽게 느껴진다.

## 정리

React Query에서 initialData는 `이 데이터는 이미 받아둔 진짜야`라는 선언이고,
placeholderData는 `진짜는 아직 오고 있어, 그동안 이거 잠깐 봐`라는 UI용 임시값이다.

둘은 겉보기엔 비슷해 보여도, 캐시에 저장되는지 여부부터 queryFn 호출 타이밍까지 완전히 다르다.
내가 어떤 목적을 위해 데이터를 보여주고 싶은지를 먼저 생각하고, 그에 맞는 옵션을 선택해야 한다.
