---
author: 유대상
pubDatetime: 2025-06-01T23:48:48.688Z
title: "모달에서 focus trap 챙기기"
slug: focus-trap
featured: false
draft: false
type: tech
tags:
  - focus-trap
  - accessibility
description: 모달에서 focus trap 적용하기
---

# Focus Trap

모달을 만들 때 가장 중요한 접근성 요소 중 하나는 **포커스 트랩(Focus Trap)** 이다.
모달이 열렸을 때, 키보드 포커스가 모달 안에만 머물도록 만들어야 한다.
그렇지 않으면 사용자가 Tab 키로 페이지 바깥 요소까지 이동할 수 있게 된다. 이는 좋지 않은 UX 문제가 된다.

### 1단계: 기본 Modal 컴포넌트 구조 만들기

먼저 `Modal.tsx`라는 컴포넌트를 간단하게 작성했다.

```tsx
// components/Modal.tsx

type ModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="modal">
      <div className="modal-content">
        <button onClick={() => setIsOpen(false)}>닫기</button>
        <a href="https://example.com">링크</a>
        <input type="text" placeholder="이름 입력" />
        <button>확인</button>
      </div>
    </div>
  );
};
```

### 2단계: 포커스할 요소들을 추적하기 위한 ref 설정

포커스를 제어하기 위해 useRef로 모달 DOM을 참조한다.

```tsx
const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // focus trap 로직
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="modal" ref={modalRef}>
      <div className="modal-content">
        <button onClick={() => setIsOpen(false)}>닫기</button>
        <a href="https://example.com">링크</a>
        <input type="text" placeholder="이름 입력" />
        <button>확인</button>
      </div>
    </div>
  );
};
```

### 3단계: 모달 안의 포커스 가능한 요소 찾기

DOM을 탐색하여 포커스가 가능한 요소들을 수집한다.

```ts
const focusableSelectors = ["button", "[href]", "input", "select", "textarea", '[tabindex]:not([tabindex="-1"])'];
```

```tsx
useEffect(() => {
  if (!isOpen || !modalRef.current) return;

  const modal = modalRef.current;

  const focusableSelectors = [
    "button",
    "[href]",
    "input",
    "select",
    "textarea",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // 이벤트 핸들러 부착
}, [isOpen]);
```

### 4단계: Tab 키로 포커스를 순환시키기

이제 Tab 키를 눌렀을 때 포커스가 모달 안에서만 순환되도록 막아야 한다. 즉, 첫 번째 요소에서 Shift+Tab을 누르면 마지막 요소로, 마지막 요소에서 Tab을 누르면 첫 번째 요소로 돌아가게 만든다.

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key !== "Tab") return;

  if (document.activeElement === firstElement && e.shiftKey) {
    e.preventDefault();
    lastElement.focus();
  } else if (document.activeElement === lastElement && !e.shiftKey) {
    e.preventDefault();
    firstElement.focus();
  }
};
```

이 로직이 없으면 사용자가 모달을 넘어 페이지의 다른 요소로 포커스를 이동시킬 수 있다.

### 5단계: 이벤트 등록 및 정리

```tsx
useEffect(() => {
  if (!isOpen || !modalRef.current) return;

  const modal = modalRef.current;

  const focusableSelectors = [
    "button",
    "[href]",
    "input",
    "select",
    "textarea",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  modal.addEventListener("keydown", handleKeyDown);
  modal.addEventListener("keydown", handleEscape);

  return () => {
    modal.removeEventListener("keydown", handleKeyDown);
    modal.removeEventListener("keydown", handleEscape);
  };
}, [isOpen, setIsOpen]);
```

### 6단계: 가독성과 재사용성이 좋은 컴포넌트로 분리하기

```tsx
// components/FocusTrap.tsx
export const FocusTrap: React.FC<FocusTrapProps> = ({ children, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const focusableElements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }

      if (e.key === "Escape") {
        onEscape?.();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return <div ref={containerRef}>{children}</div>;
};
```

- 사용 코드

```tsx
<FocusTrap onEscape={() => setIsOpen(false)}>
  <Modal onClose={() => setIsOpen(false)} />
</FocusTrap>
```

### 🧠 정리

1. ref를 통해 모달 내부 DOM을 참조
2. focusable 요소 추출
3. Tab과 Shift+Tab 조합을 감지해서 포커스 순환 구현

외부 라이브러리를 쓰면 더 빠르고 간편하게 구현할 수 있다.

### 참고자료

> [Achieving Focus Trapping in a React Modal Component - Ogun Akar](https://medium.com/cstech/achieving-focus-trapping-in-a-react-modal-component-3f28f596f35b)
