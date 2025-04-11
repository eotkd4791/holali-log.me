---
author: holali
pubDatetime: 2024-11-24T14:48:48.688Z
title: "가독성 높이는 컴포넌트 설계 (feat. 컴파운드 컴포넌트 패턴)"
slug: react-component-design
featured: false
draft: false
tags:
  - react
description: "컴포넌트를 설계하면서 고민한 내용을 공유합니다."
---

![](./thumbnail.webp)

### # 배경

이번 글에서는 각 요구사항을 반영하기 위해 어떻게 컴포넌트 설계를 고민하고 개발했는지에 대한 내용을 다뤄보려고 한다.

_(CSS, 세부 기획 등, 글의 맥락에서 주된 내용이 아닌 것들은 과감하게 생략했다.)_

### # 요구사항

먼저 요구사항부터 살펴보자.

1. 한번에 파일 `여러개`를 업로드할 수 있게 해주세요.
2. `Drag & Drop`으로도 업로드하게 해주세요.
3. `미리보기`를 보여주세요.
4. 미리보기에서 `삭제`가 가능하도록 보여주세요.
5. 업로드 `실패한 파일들의 이름을 모아서` 따로 보여주세요.
6. 파일 `용량`은 각각 1MB, 전체 10MB로 `제한`해주세요.
7. `PDF`와 `이미지 파일만` 업로드 가능하게 해주세요.

...

### # 설계

#### #1 UI

먼저 요구사항을 구현하기에 앞서, 설계를 했다. 아래는 내가 만들고자 하는 UI의 형태를 HTML태그로 나타냈는데, 완성하게 되면 대충 이런 형태가 될꺼라고 가정했다. `form` 태그가 파일 업로드 기능을 하는 태그를 전체적으로 감싸는 형태로 작성했다. 관련된 태그들이 응집돼있어서 복잡해지더라도 form을 기준으로 쉽게 찾을 수 있다고 생각했다. 또한 기획서에 나타난 각 부분을 계층 구조로 보이도록 했고, 각 부분의 역할이 잘 드러나도록 했다.

```tsx
// TO-BE

function MultipleFileUpload() {
  return (
    <form>
      <label>
        <input type="file" multiple />
      </label>
      <ol>
        <li>
          <button type="button">삭제</button>
          <img />
        </li>
        {/* ... */}
      </ol>
      <button type="submit">업로드</button>
    </form>
  );
}
```

처음에는 서버로 전달할 데이터와 관련된 부분만 form으로 감싸는 것도 고민했다. 하지만 업로드를 위한 버튼과 미리보기 또한 이 컴포넌트의 인터페이스라고 생각했고, 더 좋은 캡슐화의 형태라고 판단하여 하나의 form으로 그룹화했다.

> 만약 초안대로 설계를 했다면 어땠을까..?
> 아래와 같이 설계했을 것 같은데..

```tsx
// AS-IS

function MultipleFileUpload() {
  return (
    <>
      <form id="file-upload">
        <label>
          <input type="file" multiple />
        </label>
      </form>
      <ol>
        <li>
          <button type="button">삭제</button>
          <img />
        </li>
      </ol>
      <button type="submit" form="file-upload">
        업로드
      </button>
    </>
  );
}
```

---

그 다음으로는 구조를 `역할 단위`로 쪼개보았다.

```tsx
function MultipleFileUpload() {
  return (
    {/* begin 업로드 루트 */}
    <form>
      {/* begin 업로드 박스 */}
      <label>
        <input type="file" multiple />
      </label>
      {/* end 업로드 박스 */}
      {/* begin 미리보기 */}
      <ol>
        {/* begin 미리보기 아이템 */}
        <li>
          {/* begin 미리보기 아이템 액션 트리거 */}
          <button type="button">삭제</button>
          {/* end 미리보기 아이템 액션 트리거 */}
          <img />
        </li>
        {/* end 미리보기 아이템 */}
      </ol>
      {/* end 미리보기 */}
      {/* begin 업로드 액션 버튼 */}
      <button type="submit">업로드</button>
      {/* end 업로드 액션 버튼 */}
    </form>
    {/* end 업로드 루트 */}
  );
}
```

위와 같이 역할을 쪼개니 각 부분의 역할이 명확해져서 읽기도 편하고 추후 수정이 있더라도 유연하게 대응할 수 있을 것 같았다. 위에서 쪼갠대로 `컴포넌트로 추상화`한 후, 그 `컴포넌트들을 합성`하는 식으로 사용하면 `가독성`과 `재사용성`을 향상할 수 있겠다는 생각이 들었다.

```tsx
function FileUpload({
  children,
  ...formAttrs
}: PropsWithChildren<FileUploadProps>) {
  return <form {...formAttrs}>{children}</form>;
}

function FileUploadBox({ ...fileInputAttrs }: FileUploadBoxProps) {
  return (
    <label>
      <input type="file" {...fileInputAttrs} />
    </label>
  );
}

function FileUploadPreview({ children }: PropsWithChildren) {
  return <ol>{children}</ol>;
}

function FileUploadPreviewItem({
  children,
  file,
  w,
  h,
}: PropsWithChildren<FileUploadPreviewItemProps>) {
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <li>
      <img src={imageUrl} alt="" width={w} height={h} />
      {children}
    </li>
  );
}

function FileUploadPreviewTrigger({
  children,
  asChild,
  as,
}: FileUploadPreviewTriggerProps) {
  return asChild ? <button>{children}</button> : <>{as}</>;
}

FileUpload.Box = FileUploadBox;
FileUpload.Preview = FileUploadPreview;
FileUpload.PreviewItem = FileUploadPreviewItem;
FileUpload.PreviewTrigger = FileUploadPreviewTrigger;
```

역할별로 추상화한 컴포넌트들을 `FileUpload`라는 이름으로 그룹화하고, 세부적인 구현이나 동작이 달라야하는 경우에는 외부에서 주입하도록 했다. 또한 계층 구조로 표현하여 UI를 브라우저에서 직접 확인하지 않고도 짐작 가능하게 했다.

해당 컴포넌트를 사용하는 부분은 아래와 같이 작성했다.

```tsx
function MultipleFileUpload() {
  // ...
  return (
    <FileUpload onSubmit={onSubmit}>
      <FileUpload.Box
        multiple
        onChange={onChange}
        onDrop={onDrop}
        accept="image/*, .pdf"
      />
      {files.length > 0 ? (
        <FileUpload.Preview>
          {files.map((file) => (
            <FileUpload.PreviewItem key={file.name} file={file} w={64} h={64}>
              <FileUpload.PreviewTrigger
                as={<DeleteIcon onClick={onDelete(file)} />}
              />
            </FileUpload.PreviewItem>
          ))}
        </FileUpload.Preview>
      ) : null}
      <FileUpload.Action>
        <button>업로드</button>
      </FileUpload.Action>
    </FileUpload>
  );
}
```

#### #2 로직

파일 업로드에서 핵심이 되는 연산은 파일 `추가`와 `삭제`가 있다. 또 `파일 목록`을 의미하는 상태를 배열로 가지고 있다면 다루기 용이할 것 같았다. 구현하면서 보니, file input을 통해 업로드한 파일은 `FileList`라는 유사배열 객체로 존재하기 때문에 이를 배열로 변환해줄 메소드가 필요하다고 생각했다. 파일 업로드 기능에서 핵심이 되는 이 요소들을 커스텀 훅으로 추상화했다. 업로드한 파일은 유사배열 객체이다. 이를 배열로 변환하여 다루기 위해 작성한 `convertListToArray`함수, 파일의 추가와 삭제를 하는 `addFiles`, `deleteFile` 함수를 작성했다. 외부에서 접근이 필요한 함수만을 반환한다.

```ts
function useFileUpload() {
  const [files, _setFiles] = useState<File[]>([]);

  const convertListToArray = useCallback(
    (fileList: FileList) => Array.from(fileList),
    []
  );

  const addFiles = useCallback((files: File[]) => {
    _setFiles((previousFiles) => previousFiles.concat(files));
  }, []);

  const deleteFile = useCallback((file: File) => {
    _setFiles((currentFiles) =>
      currentFiles.filter((f) => f.name !== file.name)
    );
  }, []);

  return {
    files,
    addFiles,
    deleteFile,
    convertListToArray,
  };
}
```

### # 결론

전체 코드는 역할에 따라 나눈 컴포넌트를 합성해 구성했다. 변경 가능성이 적은 파일 추가 및 삭제 메소드는 커스텀 훅으로 추상화해 관리하고, 이벤트 핸들러 내 로직은 기획 변경 등으로 인해 팝업 노출이나 validation 같은 부수 로직이 추가되거나 수정될 가능성이 높아 상대적으로 자주 바뀔 수 있다고 판단했다. 이렇게 "핵심 로직"과 "부수적인 로직"을 분리해 놓으니 코드가 더 직관적이고, 변경에 유연하며 확장성도 높아졌다.

여기서 "핵심"과 "비핵심"의 구분은 곧 "변경 가능성이 낮은 것"과 "변경 가능성이 높은 것"으로 볼 수 있으며, 이는 "추상적인 것"과 "구체적인 것"의 차이로도 이해할 수 있다. 따라서 추상적인 부분은 역할별로 나누고, 구체적인 부분은 상위 컴포넌트에서 주입하는 방식으로 구현하면 코드가 변경에 유연하고 확장 가능하게 만들어진다는 생각이 들었다.

#### # 전체 코드

[🔗 gist 링크](https://gist.github.com/eotkd4791/1faf629e514b6f0dc6b1aeb32582fe50)

```tsx
function MultipleFileUpload() {
  const { files, convertListToArray, addFiles, deleteFile } = useFileUpload();

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const uploadedFiles = convertListToArray(files);
      // file type, size validation 로직
      addFiles(uploadedFiles);
    }
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLInputElement>) => {
    const { files } = event.dataTransfer;
    if (files) {
      const uploadedFiles = convertListToArray(files);
      // file type, size validation 로직
      addFiles(uploadedFiles);
    }
  }, []);

  const onDelete = useCallback(
    (file: File) => () => {
      // confirm 팝업 노출, 삭제 확인 하면 아래 메소드 실행.
      deleteFile(file);
    },
    []
  );

  const onSubmit = useCallback(() => {
    // 업로드 API 호출 로직
  }, []);

  return (
    <FileUpload onSubmit={onSubmit}>
      <FileUpload.Box
        multiple
        onChange={onChange}
        onDrop={onDrop}
        accept="image/*, .pdf"
      />
      {files.length > 0 ? (
        <FileUpload.Preview>
          {files.map((file) => (
            <FileUpload.PreviewItem key={file.name} file={file} w={64} h={64}>
              <FileUpload.PreviewTrigger
                as={<DeleteIcon onClick={onDelete(file)} />}
              />
            </FileUpload.PreviewItem>
          ))}
        </FileUpload.Preview>
      ) : null}
      <FileUpload.Action>
        <button>업로드</button>
      </FileUpload.Action>
    </FileUpload>
  );
}
```

> 피드백과 질문은 댓글로 부탁드립니다.
>
> **읽어주셔서 감사합니다.**

### # 참고자료

- [Ykss - (번역) 헤드리스 컴포넌트: 리액트 UI를 합성하기 위한 패턴](https://ykss.netlify.app/translation/headless_component_a_pattern_for_composing_react_uis/)
- [토스ㅣSLASH 22 - Effective Component 지속 가능한 성장과 컴포넌트](https://youtu.be/fR8tsJ2r7Eg?si=1_VSp1OZs6jsGkCM)
