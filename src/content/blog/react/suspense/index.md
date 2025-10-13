---
author: holali
pubDatetime: 2025-10-13T01:49:52+09:00
title: "Suspense 동작원리로 이해하기"
slug: react-suspense
featured: false
draft: false
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

## Suspense를 사용할 때 주의할 점

1. render phase에만 promise를 던져야 한다.

Suspense는 render phase에 발생한 promise만 인식한다. 이 시점에 promise가 던져져야 fallback으로 전환된다. useEffect 혹은, DOM 이벤트 등의 비동기 로직은 render phase 이후의 시점이다. 따라서 인식할 수 없다.

2. 매번 새 promise를 만들면 무한 루프에 빠진다.

위 [Suspense 동작 과정의 5번](/posts/react-suspense#suspense-동작-과정)에서 언급한 것처럼, promise가 끝나면 재시도하도록 예약해둔다. 하지만, 매번 새로운 promise를 만들면 React는 promise가 계속 진행중이라고 판단하여 무한 렌더에 빠진다. 따라서 리렌더링되어도 동일한 promise를 참조하도록 별도 처리가 필요하다.

## Suspense 사용의 의미

- Suspense를 사용하면 비동기 데이터 로딩 시 다음과 같은 구조적 장점을 얻을 수 있다.
  1. **명확한 코드 분기**
    - 기존에는 별도로 로딩 상태를 관리하고, 분기를 통한 렌더링을 했다.
    - Suspense를 사용하여 로직을 단순화 할 수 있다.
    - Suspense를 잘게 쪼개면 Suspense boundary별로 제어할 수 있다. 이를 통해 병렬화를 할 수 있고 Waterfall을 피할 수 있다.

  2. **관심사의 분리**
    - 읽기 쉬운 선언적인 코드로 UI 상태별 코드를 명확히 구분할 수 있다.
      - 로딩 상태는 `Suspense의 fallback`
      - 에러 처리는 `ErrorBoundary`
      - 주요 컨텐츠는 `Main`

  ```tsx
  <ErrorBoundary fallback={<ErrorUI />}>
    <Suspense fallback={<Spinner />}>
      <Main />
    </Suspense>
  </ErrorBoundary>
  ```

  3. **렌더링 최적화**
    - 기존 방식
      - render -> commit -> useEffect -> fetch -> setState -> re-render
    - Suspense 방식
      - render (+ fetch) ->  fetch 완료 후 한번에 commit
      > 단계가 줄어들기 때문에 내부 연산량이 줄어든다.


## 참고자료
- [React Suspense 공식문서](https://react.dev/reference/react/Suspense)
- [React Suspense 공식문서(번역)](https://ko.react.dev/reference/react/Suspense)
