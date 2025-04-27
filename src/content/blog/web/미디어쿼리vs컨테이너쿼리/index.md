---
author: 유대상
pubDatetime: 2025-04-27T15:03:18.764Z
title: "@media와 @container는 뭐가 다를까?"
slug: media-query_vs_container-query
featured: false
draft: false
type: tech
tags:
  - css
description: "미디어 쿼리와 컨테이너 쿼리의 차이점에 대해서 정리한 글입니다."
---

## 개요

CSS에서 반응형 웹을 구현할 때 흔히 사용하는 미디어 쿼리는 브라우저(또는 뷰포트) 전체의 크기를 기준으로 스타일을 적용한다. 이에 비해 최근 등장한 컨테이너 쿼리는 특정 요소(컨테이너)의 크기에 따라 스타일을 다르게 적용할 수 있다. 두 개념은 비슷해 보이지만 실제 사용 목적과 동작 방식이 크게 다르다. 이 글에서는 미디어 쿼리와 컨테이너 쿼리의 차이를 정리하고, 각각의 예제와 함께 실제로 어떻게 활용할 수 있는지 살펴본다.

## 목차

- [개요](#개요)
- [목차](#목차)
- [미디어 쿼리란](#미디어-쿼리란)
- [컨테이너 쿼리란](#컨테이너-쿼리란)
- [미디어 쿼리와 컨테이너 쿼리의 비교](#미디어-쿼리와-컨테이너-쿼리의-비교)
- [실제 예제](#실제-예제)
  - [미디어 쿼리 예제](#미디어-쿼리-예제)
  - [컨테이너 쿼리 예제](#컨테이너-쿼리-예제)
- [정리](#정리)

## 미디어 쿼리란

미디어 쿼리는 브라우저 또는 뷰포트의 크기, 해상도, 방향 등의 미디어 특성(media features)을 기반으로 스타일을 적용하는 방법이다. 주로 웹사이트 전체 레이아웃을 화면 크기에 맞게 반응형으로 변경할 때 사용한다.

```css
/* 기본 스타일 */
.card {
  background-color: white;
  font-size: 16px;
}

/* 화면 너비가 600px 이하일 때 */
@media (max-width: 600px) {
  .card {
    background-color: lightgray;
    font-size: 14px;
  }
}
```

## 컨테이너 쿼리란

컨테이너 쿼리는 특정 요소(컨테이너)의 크기를 기준으로 스타일을 적용하는 방법이다. 즉, 브라우저 전체가 아니라 개별 컴포넌트나 레이아웃 블록의 크기에 따라 스타일을 다르게 만들 수 있다.

컨테이너 쿼리를 사용하기 위해서는 부모 요소에 container-type 속성을 설정해야 한다.

```css
/* 컨테이너 설정 */
.container {
  container-type: inline-size;
}

/* 기본 스타일 */
.card {
  background-color: white;
  font-size: 16px;
}

/* 컨테이너 너비가 400px 이하일 때 */
@container (max-width: 400px) {
  .card {
    background-color: lightblue;
    font-size: 14px;
  }
}
```

## 미디어 쿼리와 컨테이너 쿼리의 비교

| 항목           | 미디어 쿼리               | 컨테이너 쿼리             |
| -------------- | ------------------------- | ------------------------- |
| 기준           | 브라우저/뷰포트 전체 크기 | 특정 요소(컨테이너) 크기  |
| 대상           | 전체 레이아웃 반응형      | 컴포넌트 단위 반응형      |
| 설정 필요 여부 | 별도 설정 없음            | container-type 속성 필요  |
| 주요 사용처    | 사이트 전체 레이아웃 변경 | 컴포넌트 내부 스타일 조정 |

미디어 쿼리는 레이아웃이 브라우저 전체 크기에 맞춰야 할 때 사용하며, 컨테이너 쿼리는 독립적인 컴포넌트를 다양한 환경에서 유연하게 다루고 싶을 때 적합하다.

## 설계 예제

### 미디어 쿼리 예제

```css
/* 기본 스타일 */
.card {
  background-color: white;
  font-size: 16px;
}

/* 브라우저 너비가 600px 이하일 때 */
@media (max-width: 600px) {
  .card {
    background-color: lightgray;
    font-size: 14px;
  }
}
```

### 컨테이너 쿼리 예제

```html
<div class="container">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

```css
/* 컨테이너 설정 */
.container {
  container-type: inline-size;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* 카드 스타일 */
.card {
  background-color: #f0f0f0;
  padding: 1rem;
  text-align: center;
  font-size: 1.2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 컨테이너 너비가 500px 이상일 때 */
@container (min-width: 500px) {
  .container {
    grid-template-columns: 1fr 1fr;
  }
}
```

## 정리

미디어 쿼리와 컨테이너 쿼리는 모두 반응형 웹 개발에 필수적인 기술이다. 그러나 적용 대상과 사용 목적이 다르다. 미디어 쿼리는 브라우저 전체 크기에 맞춰 레이아웃을 변경할 때 사용하고, 컨테이너 쿼리는 개별 컴포넌트의 유연성을 높이기 위해 사용한다. 특히 현대 프론트엔드 개발에서는 컴포넌트 단위로 UI를 구성하는 경우가 많아 컨테이너 쿼리의 중요성이 점점 커지고 있다. 상황에 따라 두 가지를 적절히 조합하여 사용하는 것이 가장 좋은 방법이다.
