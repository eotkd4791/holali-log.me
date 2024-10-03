---
author: 유대상
title: "[클린코드] Chap3. 함수"
slug: clean_code3
featured: false
draft: false
pubDatetime: 2024-02-26T01:38:03.506Z
tags:
  - clean-code
description: 클린코드 3장을 읽고 정리한 내용입니다.
---

## 도입

코드를 이해하기 어렵게 하는 여러 가지 걸림돌이 있다. `추상화 수준`이 일관되지 않거나, `의도를 알기 힘든 코드`가 유독 그렇다.
이 장에서는 함수를 어떻게 작성하면 문제인지, 그리고 좋을지 설명한다.

## 본론

1. **작게 만들기**

- 함수는 작게 만드는 것이 읽기 좋다. 조건문/반복문 내부의 블록은 한줄로 이루어져 있어야한다.
  그 부분에서는 추상화된 함수가 호출되어야 한다. 이런 구조가 아니라면 중첩된 구조라는 의미이다. 함수 내부의 구조가 중첩되면 이해하기가 어려줘진다.

2. **한 가지 일만하는 함수 만들기 (feat. 단일책임원칙 SRP)**

- 지어진 함수 이름을 기준으로 추상화 되어있는지를 확인한다.

```typescript
// 멤버십 등록하는 함수
function registerMembership() {
  const name = user.getName();
  const address = getValue("address");
  submit({ name, address });
}
```

"이름을 가져오고, 주소를 가져오고, 제출한다." 이렇게 세가지 일을 한다고 생각할 수도 있다.
하지만, `registerMembership`라는 이름으로 `추상화 수준`이 하나이다.
따라서 해당 함수는 한 가지의 일만 한다고 볼 수 있다.

위의 예시에서 사용한 `getValue`, `submit`함수는 또다시 세부 단계로 나눠진다.
위에서는 멤버십 등록을 위한 동작 중 하나였다면, getValue는 인자로 전달된 키의 값을 가져오는 단계로 나눠질 것이다.
또, submit함수는 인자로 전달된 객체를 전달하는 단계로 나눠질 것이다.

getValue, submit함수는 각각 다른 함수이지만, 내부에서는 역시 추상화 수준이 하나로 일관되게 되어야 한다.

3. **함수 하나의 추상화 수준은 모두 동일하게 만들기**

- 추상화 수준을 일관되게 만들어야 읽는 사람이 `근본 개념`과 `세부사항` 인지를 명확하게 구분할 수 있다.
- 위에서 아래로 일기 좋게 만들어야한다. 위에서 말한 `registerMembership`를 기준으로 `getValue`, `submit`는 추상화 수준이 한 단계 내려간 함수이다.

4. **Switch문**

```typescript
function displaySummaryInfoByUserStatus(user: User) {
  switch (user.status) {
    case UserStatus.REGISTERED:
      return getRecommendAdditionalVerification(user.phoneNumber);
    case UserStatus.STALE:
      return getInfoForStaleUser(user);
    case UserStatus.ACTIVE:
      return getTotalPaymentList(user.payments);
    default:
      throw new Error("표시할 정보가 없습니다.");
  }
}
```

- 한 가지 일반 수행하지 않아서 `단일 책임 원칙`에 위배된다.
- 함수가 변경될 이유가 여럿이다.
- 유저 상태에 따라 case를 추가해야하기 때문에 `개방 폐쇄 원칙`에 위배된다.
- 태생 자체가 여러가지 일을 하게 태어났다. -> SRP 위반

5. **서술적인 이름을 사용하기**

- 이름이 길어도 잘 설명된 것이 주석을 작성하는 것보다 훨씬 좋다.

6. **함수의 인수 갯수별 동작 구분**

- 인수가 많아질수록 이해하기가 어려워진다.
- 플래그 인수를 넘기는 것 자체가 플래그 상태에 따라 다른 동작을 한다는 의미이다. 이는 SRP에 위배되는 함수이다.

7. **부수 효과 일으키지 않도록 하기**

- 함수가 하는 일과 맥락이 다른 일을 `부수효과`라고 한다. 아래 예시는 토큰이 만료되었는지 여부를 확인하는 함수이다. 토큰이 만료된 경우에는 `true`를 반환하는데, 이때 cookie에 저장된 토큰을 제거하는 동작도 함께한다.
  이 동작이 부수효과라고 볼 수 있다.
- 부수 효과는 예측하기 힘든 동작을 야기한다. 따라서 해당 로직이 꼭 필요하다면 함수명을 부수효과까지 담고 있는 이름으로 변경하는 것이 좋다. 물론 SRP에는 위배된다.

```ts
function checkIfExpired(token: Token) {
  if (token.expireDate > Date.now()) {
    return false;
  }
  cookie.remove("token");
  return true;
}
```

8. **명령과 조회를 분리하기**

- 무언가를 반환해야하는 함수인지, 내부에서 특정 동작을 하는 함수인지를 명확하게 나누어 이름을 지어야한다.

9. **오류 코드 예외를 사용하기**

- 오류 처리는 하나의 일이기 때문에 원래 함수와 분리되어야 한다. 예외를 사용하면 오류를 처리하는 코드를 원래 코드에서 따로 뽑아낼 수 있다.
