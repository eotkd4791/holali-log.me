---
author: 유대상
pubDatetime: 2024-02-15T16:09:42.973Z
title: "사용자가 모바일앱에서 웹페이지로 돌아오는 것 감지하기 (feat. visibilitychange)"
slug: visibility-change
featured: false
draft: false
type: tech
tags:
  - JS
  - DOM
  - visibilitychange
description: visibilitychange event에 대해 공부하고 정리한 글입니다.
---

### 배경

사용자가 외부 모바일앱을 통한 인증을 완료하고 웹페이지로 돌아오면 특정 로직을 실행하도록 해야 하는 상황이 있었다.
여기서 `웹페이지로 돌아오는 것을 어떻게 감지할 것인가?`에 대해서 많은 고민을 했다. 이 과정에서 겪은 시행착오를 글로 남겨두려 한다.

### 첫번째 아이디어

가장 처음으로 떠올린 아이디어는 `focus 이벤트를 감지하여 처리`하는 것이었다. 크롬에서는 예상한 대로 동작했는데, 문제는 사파리에서 발생했다.
사파리에서는 외부 모바일앱으로 이동하기 전에 브라우저 자체에서 `confirm 창`을 띄운다.
이때, 확인 or 취소를 클릭하면 `confirm 창`이 닫히게 되면서 `focus` 이벤트가 발생한다.
인증이 완료되지 않은 상태에서 사후 로직을 처리하기 때문에 에러가 발생했다.

### 두번째 아이디어

다음으로 떠올린 아이디어는 `visibilitychange 이벤트를 감지하여 처리`하는 방법이었다.
`visibilitychange`이벤트는 사용자가 아래와 같은 상황에서 발생한다.

1. 사용자가 새로운 페이지로 이동할 때
2. 탭을 전환할 때
3. 탭을 닫을 때
4. 브라우저를 닫거나, 최소화할 때
5. (모바일) 다른 앱으로 전환하는 경우

이 이벤트 자체만으로는 사용자가 웹페이지를 보고 있는지, 모바일 앱에서 인증을 진행 중인지 알 수 없다.
사용자가 모바일 앱으로 이동하는 경우(5번)와 모바일 앱에서 웹페이지(브라우저 앱)로 이동하는 경우,
이 두 경우 모두 `visibilitychange` 이벤트가 발생하기 때문이다.

따라서 사용자가 웹페이지를 보고 있는지를 알기 위해서는 `visibilityState` 속성을 참고 해야 한다.
이 속성은 `visible`, `hidden` 이렇게 두 가지 상태를 가지며, 아래와 같이 사용할 수 있다.

```js
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // 웹페이지로 돌아오는 경우의 로직 실행
  }
});
```

이처럼 `visibilitychange`와 `visibilityState`를 사용하여 사용자가 웹페이지로 돌아오는 것을 감지할 수 있었다.

### 참고자료

- [MDN - Document: visibilitychange event](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event)
