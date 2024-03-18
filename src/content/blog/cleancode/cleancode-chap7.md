---
author: 유대상
title: 클린코드 Chap7. 오류 처리
slug: clean_code7
featured: false
draft: false
pubDatetime: 2024-03-11T01:38:03.506Z
tags:
  - clean-code
description: 클린코드 7장을 읽고 정리한 내용입니다.
---

깨끗한 코드와 오류는 밀접한 관련이 있다. 흩어진 오류 처리 코드들이 코드 파악을 어렵게 만든다. 이 장에서는 어떻게 `오류 처리`를 하는지에 대해 소개한다. 

1. **오류 코드보다 예외 사용하기**

- 예외를 이용하면 오류 처리 코드와 로직을 분리할 수 있다. 
- 즉, 성공시의 로직과 실패시의 로직이 서로 섞이지 않아서 코드가 깨끗해진다.

2. **Try-Catch-Finally문 부터 작성하기**

- try문에서 예외가 발생하면 catch 블록으로 넘어가게 된다.
- 1에서 언급한 것과 같이 일반적인 로직과 예외 발생시의 로직을 분리해서 구현할 수가 있다.
- catch 블록은 프로그램 상태를 일관성 있게 유지해야한다.

```java
public void issueCoupon(User user, String code) {
  try {
    couponAddender.issue(user, couponInfo);
    couponInfoManager.increaseIssuedCount(couponInfo.getId());
  } catch(Exception e) {
    couponRedisOperator.rollback(couponRedisVo);
    throw e;
  }
}
```

3. **null을 반환하지 마라**

- 호출자에게 문제를 떠넘긴다.  
- null 검사를 한번이라도 누락한다면 NullPointerException이 발생한다.
- null을 반환하는 대신 Exception을 던지는 방법도 존재한다.

4. **null을 전달하지 마라**

- 3에서와 같이 예외를 만들어서 던지는 것이 효과적이다.
- assert문을 사용하는 것도 방법이다.

```java
public class InquiryAccountV1Api {
  
  @PostMapping("/recipient")
  public Response<InquiryAccountResData> checkInquiryAccount(@RequestBody InquiryAccountReqData req, UserAdapter userAdapter) {
    Assert.notNull(req.getTransferOption(), "req TransferOption must not be null.");
    // ...
  }
  // ...
}
```

### 결론

깨끗한 코드의 필수 조건에는 가독성 뿐만 아니라, 안정성도 있다.
오류 처리 로직을 프로그램 논리와 분리하면 유지보수성도 크게 높아진다.


### 참고자료

- 클린코드 - 로버트 C. 마틴
