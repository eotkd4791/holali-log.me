---
external: false
title: "[CSS] 반응형 CSS 단위 총정리 | 홀랄리 디스크"
description: "CSS에서 사용하는 단위에 대해 공부하고 정리한 내용입니다."
date: 2023-05-14
---

## 도입

- 어떤 단위든 브라우저에서는 `px(pixel - 픽셀)`로 변환되어 화면에 표시된다.
- `픽셀`이란 모니터 위에서 화면에 나타낼 수 있는 `가장 작은 단위`를 의미한다.
- 픽셀은 절대적인 값이라 container의 사이즈가 변경되어도 content의 크기는 그대로 유지된다.
  - 브라우저에서 font-size를 변경해도 변경된 크기에 반응하지 않음 -> `고정적`
- 따라서 대부분 `%`를 이용하여 content의 크기가 유동적으로 변할 수 있도록 한다.

## 단위에 대한 설명

### em (Relative to parent element)

- 현재 지정된 `font-size`를 나타내는 단위이다.
- 같은 `font-size`여도 다른 `font-family`를 사용한다면 사용자에게 보여지는 크기가 달라질 수 있다.
- `em`은 선택된 `font-family에 상관없이 항상 고정된 font-size`를 가지고 있다.
- `em`은 부모 요소의 font-size에 따른 상대적인 값이다.

  - HTML에서는 font-size의 `default`를 `16px`로 지정한다.
  - 최상위 요소는 별도의 설정이 없다면 브라우저의 설정인 16px을 1em으로 계산한다.
  - 자식 요소는 부모 요소의 font-size를 1em으로 계산한다.
  - `em`은 부모의 font-size를 곱하는 값이라는 점에서 `%`와 비슷하다.

```css
/* 기본 설정 font-size: 16px */
.parent {
  font-size: 4em;
  /* 
    1em = 16px
    4em = 64px
  */
}

.child {
  font-size: 0.5em;
  /*
    1em = 64px
    0.5em = 32px
  */
}
```

### % (Percent)

아래는 위의 예시와 같은 `font-size`로 계산된다.

```css
/* 기본 설정 font-size: 16px */
.parent {
  font-size: 400%;
  /* 
    100% = 16px
    400% = 64px
  */
}

.child {
  font-size: 50%;
  /*
    100% = 64px
    50% = 32px
  */
}
```

### rem (Relative to root element)

- 부모요소에 따라서 font-size가 결정되는 것이 아니라, root에 지정된 font-size에 따라 크기가 계산된다.

```css
/* 기본 설정 font-size: 16px */
.parent {
  font-size: 4rem;
  /* 
    1rem = 16px 
    4rem = 64px
  */
}

.child {
  font-size: 0.5rem;
  /* 
    1rem = 16px 
    0.5rem = 8px
  */
}
```

아래와 같이 `html`이나 `body`에서 `font-size`가 지정되어 있지 않으면 브라우저의 기본 설정 값인 `16px`을 기본 font-size로 따라간다. 아래처럼 고정값을 사용하면 브라우저에서 font-size를 변경해도 크기가 바뀌지 않는다.

```css
html {
  font-size: 18px;
  /* 기본값: 100% */
}

/* OR */

body {
  font-size: 18px;
  /* 기본값: 100% */
}
```

### vw (Viewport width - viewport related)

- 브라우저 너비에 따른 상대적인 값이다.
- `100vw = 브라우저 너비의 100%만큼의 크기`라는 것을 의미함

### vh (Viewport height - viewport related)

- 브라우저 높이에 따른 상대적인 값이다.
- `100vh = 브라우저 높이의 100%만큼의 크기`라는 것을 의미함

### vmin, vmax

- 브라우저의 높이와 너비 중 작은 or 큰 값
- `50vmin = 높이와 너비중 작은 값의 50%`
- `100vmax = 높이와 너비중 큰 값의 100%`

## 참고자료

> [드림코딩 - 프론트엔드 필수 반응형 CSS 단위 총정리 (EM과 REM) | Responsive CSS Units](https://www.inflearn.com/course/css-flex-grid-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%9D%B5%ED%9E%88%EA%B8%B0/dashboarhttps://www.youtube.com/watch?v=7Z3t1OWOpHod)
