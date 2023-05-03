---
external: false
title: "[CSS] Flex"
description: "CSS Flex에 대해 공부하고 정리한 내용입니다."
date: 2023-05-03
---

## Flex란?

Flex란 웹사이트의 DOM Element들을 정렬하기 위한 속성이다. Flex를 이용하면 디바이스의 너비에 따른 반응형 UI를 구현하기 용이하며, DOM Element 정렬에 많이 사용하는 `float`보다 추가로 필요한 작업이나 부작용이 적기 때문에 더 장점이 많은 정렬 방법이다. 이외에도 대부분의 브라우저에서 지원하기 때문에 크로스 브라우징 측면에서도 안정적인 방법이다.

## Flex 적용하기

item들을 정렬하기 위해서는 먼저 부모 요소에 flex 속성을 적용해야한다. 아래와 같은 html코드를 예로 들면 `parent` 클래스를 가진 요소에 적용하면 된다.

```html
<div class="parent">
  <div class="child">AAAAAAAAAAAAAAA</div>
  <div class="child">BBB</div>
  <div class="child">CCCCCC</div>
</div>
```

아래와 같이 정의를 해보자.

```css
.parent {
  display: flex;
}
```

|                  Flex 적용 전                  |                 Flex 적용 후                 |
| :--------------------------------------------: | :------------------------------------------: |
| ![before-flex](../images/tech/before-flex.png) | ![after-flex](../images/tech/after-flex.png) |

flex를 적용하기 전에는 div태그의 default display 속성값이 block이기 때문에 각 item마다 하나의 열(column)을 차지했다. flex를 적용한 후에는 각 자식 요소들의 내용물 만큼의 공간을 차지하게 된다. 따라서 하나의 열에 세 요소 모두 위치하게 된다.

> 참고자료
> [1분코딩 CSS Flex와 Grid 제대로 익히기](https://www.inflearn.com/course/css-flex-grid-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%9D%B5%ED%9E%88%EA%B8%B0/dashboard)
