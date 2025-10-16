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

### Suspense 이전

```jsx
function App() {
  return <User />;
}

function User() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then((user) => setUser(user));
  }, []);

  if (!user) {
    return <Spinner />;
  }

  return <div>{user.name}</div>;
}
```

위 코드를 살펴보면 다음 순서로 실행된다.

1. `<App />` 렌더링 시작
2. `<User />` (user = null) 렌더링 - _render phase #1_
3. 화면에는 연산의 결과인 `<Spinner />`를 보여준다. - _commit phase #1_
4. useEffect 실행 -> fetchUser 시작
5. fetchUser 완료 -> setUser 완료 -> `<User />` 렌더링 재시작 - _render phase #2_
6. `<Spinner />` 제거 및 `<User />` 렌더링 완료 - _commit phase #2_

이번에는 Suspense를 도입한 경우를 살펴보자.

### Suspense 도입

```jsx
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <User />
    </Suspense>
  );
}

const userResource = createResource(() => fetchUser());
function User() {
  const user = userResource.read();
  return <div>{user.name}</div>;
}
```

1. `<App />` 렌더링 시작
2. `<User />` 렌더링 시작 - _render phase #1_
3. read() 호출 -> throw promise -> `<User />` 렌더링 중단 - _render phase #1_
4. fallback UI `<Spinner />`을 보여준다. - _commit phase #1_
5. 3번에서의 promise가 resolve돼면 `<User />` 렌더링 재시작. - _render phase #2_
6. `<Spinner />` 제거 및 `<User />` 렌더링 완료 - _commit phase #2_

Suspense는 render phase에서 비동기 작업을 시작할 수 있다는 장점이 있다. 이는 [Suspense 도입 이전](/posts/react-suspense#suspense-%EC%9D%B4%EC%A0%84)의 로직과 비교했을 때, 초기 렌더링을 기다리지 않고 바로 시작하기 때문에 병목을 피할 수 있다.

## Suspense를 사용할 때 주의할 점

1. render phase에만 promise를 던져야 한다.

Suspense는 render phase에 발생한 promise만 인식한다. 이 시점에 promise가 던져져야 fallback으로 전환된다. useEffect 혹은, DOM 이벤트 등의 비동기 로직은 render phase 이후의 시점이다. 따라서 인식할 수 없다.

2. 매번 새 promise를 만들면 무한 루프에 빠진다.

위 [Suspense 도입](/posts/react-suspense#suspense-도입)의 5번에서 언급한 것처럼, promise가 끝나면 재시도하도록 예약해둔다. 하지만, 매번 새로운 promise를 만들면 React는 promise가 계속 진행중이라고 판단하여 무한 렌더에 빠진다. 따라서 리렌더링되어도 동일한 promise를 참조하도록 별도 처리가 필요하다.

## Suspense 사용의 의미

- Suspense를 사용하면 비동기 데이터 로딩 시 다음과 같은 장점을 얻을 수 있다.

  1. **로직 단순화**

Suspense 등장 이전에는 비동기 로직을 처리하려면 로딩을 나타내는 상태(isLoading)를 두고, 로딩 UI를 표시했다. Suspense는 그 자체로 내부에 로딩 상태를 추상화한 컴포넌트이기 때문에, 별도의 상태 없이도 fallback UI와 주요 컴포넌트를 구분하여 표시할 수 있다.

2. **관심사의 분리**

읽기 쉬운 선언적인 코드로 UI 상태별 코드를 명확히 구분할 수 있다.

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

## 참고자료

- [React Suspense 공식문서](https://react.dev/reference/react/Suspense)
- [React Suspense 공식문서(번역)](https://ko.react.dev/reference/react/Suspense)
