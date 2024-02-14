---
author: 유대상
title: 덕타이핑(Duck Typing)이란?
slug: duck-typing
featured: false
draft: false
pubDatetime: 2024-02-14T14:43:03.506Z
tags:
  - typescript
description: 오리처럼 걷고 오리처럼 꽥꽥거리면, 그것은 오리이다.
---

### 배경

자바스크립트는 동적 타입 언어의 한 종류이다. 동적 타입 언어는 런타임 시점에 타입이 정해지고, 정적 타입 언어(예: 자바)는 컴파일 시점에 타입이 정해진다.

타입 스크립트를 사용하는 목적은 동적 언어인 자바스크립트의 단점을 보완하기 위함이다. 자바스크립트를 사용하는 경우에는 런타임 시점에서 마주치는 타입 관련 이슈를 컴파일 시점에 알아 차릴 수 있게 되기 때문에 타입스크립트를 사용하는 것이라고 생각한다.

타입스크립트는 모양(Shape)에 중점을 두고 타입을 체크하며, 이것을 덕 타이핑 또는 구조적 서브 타이핑이라고 부른다고 한다.

덕 타이핑은 객체 자신이 어떠한 타입인지는 신경쓰지 않고, 특정한 메소드나 필드의 존재로 타입을 판단한다. 즉, 특정 타입에 얽매이지 않고 '원하는 행동을 할 수 있는가?'로 타입을 판단한다.
그렇기에 타입에 대한 제약없이 유연한 코드를 작성할 수 있다.

### 정의

> "If it walks like a duck and it quacks like a duck, then it must be a duck
> 오리처럼 걷고 오리처럼 꽥꽥거리면, 그것은 오리이다.

![Duck Typing](@assets/images/duck-typing.jpg)

[이미지 출처](https://devopedia.org/duck-typing)

- 클래스 상속이나 인터페이스로 타입을 구분하는 것 대신, 객체의 변수 및 메소드의 집합이 객체의 타입을 결정하는 동적 타이핑의 한 종류.

### 장점

- 타입에 대해 자유로움.
- 타입에 대해 자유롭기 때문에 유연한 코드를 작성할 수 있다.

### 단점

- 런타임에서 타입 에러가 발생할 수 있다.
- 버그를 찾기 어려울 수 있다.

### 예시

아래 예시를 보면 `Person`클래스와 달리 `Car`클래스는 `Movable` 인터페이스를 구현하지 않았다.

그럼에도 아래의 moveThere함수의 인자로 Person과 Car의 인스턴스를 넘겨주어도 타입 체크에 걸리지 않고 통과된다.

다른 방식으로 구현된 클래스이지만, 내부에 같은 메소드가 구현되어있기 때문에 같은 타입으로 인식한다.

```ts
interface Movable {
  move(): void;
  stop(): void;
}

class Person implements Movable {
  move() {
    console.log("move");
  }
  stop() {
    console.log("stop");
  }
}

class Car {
  // 인터페이스 구현하지 않음
  move() {
    console.log("move");
  }
  stop() {
    console.log("stop");
  }
}

function moveThere(movable: Movable) {
  movable.move();
}

moveThere(new Person());
moveThere(new Car());
```

> 참고자료

[Nesoy blog - 덕타이핑이란?](https://nesoy.github.io/articles/2018-02/Duck-Typing)

[타입스크립트 프로그래밍](http://www.yes24.com/Product/Goods/90265564?OzSrank=2)

[velog - iwaskorean.log](https://velog.io/@iwaskorean/JavaScript-33%EA%B0%80%EC%A7%80-%EA%B0%9C%EB%85%90-3.-Implicit-Explicit-Coercion-and-Duck-Typing%EC%95%94%EC%8B%9C%EC%A0%81-%EB%AA%85%EC%8B%9C%EC%A0%81-%ED%98%95%EB%B3%80%ED%99%98%EA%B3%BC-%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91)

[마이구미의 HelloWorld - Duck Typing이란?](https://mygumi.tistory.com/367)
