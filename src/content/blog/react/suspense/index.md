---
author: holali
pubDatetime: 2025-10-13T01:49:52+09:00
title: "Suspense 동작원리로 이해하기"
slug: react-suspense
featured: false
draft: true
type: tech
tags:
  - react
description: "React Suspense를 공부하고 작성한 글입니다."
---


## React 공식 문서로 본 Suspense

Suspense는 React의 내장 컴포넌트로, 비동기 데이터 로딩이나 컴포넌트 트리의 일부가 아직 준비되지 않았을 때, 로딩 중인 상태를 표시하는 데에 사용한다.

Suspense 등장 이전에는 `Fetch-on-render`나 `Fetch-then-render` 방식으로 비동기 처리와 렌더링 과정을 분리하여 처리했다. 이러한 방식은 UX 측면에서 Waterfall과 리렌더링으로 인한 화면 깜빡임, 렌더링 지연과 같은 많은 문제가 있었다. Suspense가 등장하면서 비동기 작업과 렌더링 과정을 동시에 처리할 수 있게 되었다. 이 방식을 `Render-as-you-fetch`라고 한다.

```tsx
<Suspense fallback={<Loading />}>
  <Children />
</Suspense>
```

위 컴포넌트에서 내부에서 비동기 작업을 처리하는 `Children` 컴포넌트가 있다. 이를 `Suspense`로 감싸면 비동기 작업을 완료하기 전엔 fallback으로 넘겨준 `Loading` 컴포넌트를 보여준다. 비동기 작업을 완료하면 비로소 `Children`를 보여준다.


`Suspense`를 사용하려면 `Suspense`가 어떻게 자식 컴포넌트의 비동기 작업의 완료 여부를 감지하는지를 알아야한다. 위 컴포넌트의 렌더링 순서를 먼저 확인해보자.


## Suspense 동작 과정

1. Suspense 컴포넌트 렌더링 시작
2. Children 컴포넌트의 렌더 단계(render phase)에서 비동기 작업이 진행중이라면 Promise를 throw.
3. 이때 React가 상위로 전파되면서 Children과 가장 가까운 Suspense 컴포넌트가 fallback 렌더링 시작
4. fallback commit 및 Promise then에 retry 예약.
5. Promise가 resolve되면 retry 시도.
6. resolve된 데이터를 읽고 Children 렌더링 (reject 시 ErrorBoundary로 전파)
7. Children commit 및 fallback 제거


## 참고자료
- [React Suspense 공식문서](https://react.dev/reference/react/Suspense)
- [React Suspense 공식문서(번역)](https://ko.react.dev/reference/react/Suspense)
