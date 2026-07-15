# 웹 헤더·공유 기능 이식 가이드 (다른 이벤트 페이지)

이 문서는 **헤더 UI(반응형 포함)**, **공유하기(데스크톑 버튼 + 모달 SNS)**, **모바일/태블릿 플로팅(공유 + TOP)**, **복사 토스트**, **메타/Open Graph/Twitter**, **카카오 SDK 공유**를 다른 HTML 페이지에 동일하게 심기 위한 이식 명세입니다.

디자인은 **아래 목록의 PNG/SVG만 그대로** 사용한다고 가정합니다(실제 파일명·해상도 유지).

### 고정(이벤트별로 바꾸지 않음): `.cb-header__notice` 및 헤더 CSS

- **`p.cb-header__notice` 안의 문장·`<a href="…">` 링크 구성**은 **원본과 동일하게 유지**합니다(교체하지 않음).
- **`.cb-header` 및 `.cb-header__notice` 계열 CSS** — 첫·세 번째 스타일 블록에 포함된 규칙 **전부 그대로** 이식합니다(반응형 1024/768 포함).

이벤트마다 바꾸는 것은 아래 **메타·`SHARE_CONFIG`·URL 등**이며, 헤더 안내 문구는 위 정책에 따라 **복붙 고정**으로 둡니다.

---

## 1. 정적 자산 — 복사해 둘 이미지 (경로 예시)

다른 프로젝트에서 **`assets`** 폴더(예: `프로젝트루트/assets/`) 아래로 넣었다고 할 때 HTML에서 쓸 **상대 경로 예시**:

| 역할 | 경로 예 (`프로젝트루트/assets/` 기준 · HTML·JS 통일) |
|------|------------------------------------------------------|
| 공유 버튼 아이콘 (SVG) | `assets/share_icon.svg` |
| PC방 토글 OFF (PNG) | `assets/off=off.png` |
| PC방 토글 ON (PNG) | `assets/off=on.png` |

- JS에서 토글 시 `assets/off=on.png` / `assets/off=off.png`처럼 **문자열로 경로 교체**하므로, 이식 후에는 HTML·JS에서 **`assets/...`** 로 통일해 맞출 것.
- 파일명 **`off=off.png`** 는 `=` 가 포함되어 있음(그대로 사용).

**공유 모달의 SNS 아이콘**은 HTML에 인라인 SVG로 들어 있어 **별도 PNG/SVG 파일 없음**.

---

## 2. 이벤트마다 사용자가 직접 작성·교체하는 항목

아래 값들은 **이벤트마다 다르므로 하드코딩 대신 페이지 제작 시마다 채움**.

| 항목 | 설명 | HTML/설정 어디에 쓰이는지 |
|------|------|---------------------------|
| **Site Name** | 사이트/브랜드명 (OG 등) | `meta property="og:site_name"` |
| **Title** | 브라우저 탭 제목·SNS 카드 타이틀 | `<title>`, `og:title`, `twitter:title`, (선택) `SHARE_CONFIG.title` 카카오 공유 제목과 맞춤 |
| **Description** | 검색/SNS 미리보기 설명문 | `<meta name="description">`, `og:description`, `twitter:description`, `SHARE_CONFIG.description` 권장 일치 |
| **해당 프로젝트 URL** | 이 이벤트 페이지의 **실제 배포 Canonical URL** (https) | `og:url`, `twitter:url`, 링크 공유 시 기준이 되는 주소 |
| **이미지 경로** | 썸네일·카드 미리보기 이미지 | **항상 크롤러 호환 위해 `https://` 절대 URL 권장** — `og:image`, `twitter:image`, `meta property="og:image:alt"`, `SHARE_CONFIG.ogImage` (카카오 피드 `imageUrl`) |

**추가로 이벤트마다 바꿀 가능성이 큰 값 (권장 정리)**

- `theme-color`
- 페이지 `<title>` 과 공유 문구 세트 통일
- `SHARE_CONFIG.kakaoKey` — 카카오 개발자 콘솔의 **JavaScript 키** (이벤트/도메인 정책에 따라 교체 가능)

> **참고**: `.cb-header__notice` 텍스트·링크·스타일은 **이벤트마다 수정하지 않음** (상단 “고정” 절 참고).

---

## 3. 메타 영역 블록 — 직접 채워야 하는 칸 표시

아래 플레이스홀더를 실제 배포값으로 교체합니다.

```html
<!-- ▼▼ 사용자 작성: 기본 SERP ▼▼ -->
<title>[[TITLE]]</title>
<meta name="description" content="[[DESCRIPTION]]">

<!-- ▼▼ 사용자 작성: Open Graph ▼▼ -->
<meta property="og:site_name" content="[[SITE_NAME]]">
<meta property="og:title" content="[[TITLE 또는 이벤트 전용 카피]]">
<meta property="og:description" content="[[DESCRIPTION]]">
<meta property="og:url" content="[[HTTPS_PAGE_URL]]" />
<meta property="og:image" content="[[HTTPS_ABSOLUTE_IMAGE_URL]]">
<meta property="og:image:alt" content="[[IMAGE_ALT_OR_EVENT_NAME]]">

<!-- ▼▼ 사용자 작성: Twitter / X 카드 ▼▼ -->
<meta name="twitter:title" content="[[TITLE 또는 이벤트 전용 카피]]">
<meta name="twitter:description" content="[[DESCRIPTION]]">
<meta name="twitter:url" content="[[HTTPS_PAGE_URL]]" />
<meta name="twitter:image" content="[[HTTPS_ABSOLUTE_IMAGE_URL_TWITTER]]">
<meta name="twitter:image:alt" content="[[IMAGE_ALT_OR_EVENT_NAME]]">
```

**이미지 URL 메모**

- 카카오/페이스북 등 일부 크롤러는 **절대 URL(https)** 만 인식하는 경우가 많음.
- `og:image`, `twitter:image`는 같은 파일을 가리켜도 되고, 권장 비율(예: 트위터 1200×630 등)별로 두 파일을 쓸 수도 있음.

---

## 4. 카카오 공유 설정 `SHARE_CONFIG` (직접 채우기)

```javascript
var SHARE_CONFIG = {
  title:       '[[TITLE – 카카오 공유 카드 제목]]',
  description: '[[DESCRIPTION – 카카오 공유 카드 요약]]',
  kakaoKey:    '[[KAKAO_JAVASCRIPT_KEY]]',
  ogImage:     '[[HTTPS_ABSOLUTE_IMAGE_URL – 카카오 피드 썸네일 권장 1200×630]]'
};
```

- 카카오 앱 플랫폼에서 **페이지 도메인/리다이렉트 URI** 허용이 배포 URL과 일치해야 함.

---

## 5. HTML로 이식하는 구역(요약)

1. **`</head>` 직전**  
   - 카카오 JS SDK 스크립트:  
     `https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js`

2. **`<body>` 시작 직후**  
   - `<header class="cb-header" id="top">…</header>`  
   - PC방 토글 `id="pcRoomToggle"`, 공지 **`.cb-header__notice`** — **HTML·링크는 원본 그대로 복사**(수정 없음)  
   - 데스크톱 `id="btnShare"` 공유 버튼 (안에 `share_icon.svg`)

3. **페이지 하단 공통 영역 (`</body>` 직전 권장)**  
   - `#shareModal` (공유 모달 전체 마크업)  
   - `#copyToast`  
   - `.mobile-fab` 안 `#btnShareFloating`(공유), `#btnScrollTop`(TOP)

4. **스크립트**  
   - `SHARE_CONFIG`, `initKakao`, 모달 열림/닫힘  
   - `btnShare`, `btnShareFloating` → 공유 모달  
   - `#btnScrollTop` → `window.scrollTo({ top: 0, behavior: … })` (sticky 헤어라 `scrollIntoView` 비권장)  
   - SNS별 `facebook`/`twitter`/…/`copy`/인스타(복사)  
   - `setPcRoomToggleState` 및 토글 이미지 경로 문자열은 사용하는 **`assets`** 경로에 맞게 수정  

---

## 6. 스타일(CSS) 포함 범위

원본 페이지(`index.html`) 기준 참고 범위:

- **첫 번째 `<style>` 블록**: `.cb-header` ~ 헤더, `.btn-share`, `.mobile-fab`, `.copy-toast`, **`@media (max-width: 768px)`** 내 헤더 오버라이드 일부  
- 동일 블록: **공유 모달·그리드** (`.share-modal` ~ `.share-item` 등)

- **두 번째/세 번째 스타일 블록**: `:root { --header-h: 80px; }` 및 **반응형** `@media (max-width: 1024px)` `.cb-header*` 규칙, `@media (max-width: 768px)` 헤더+`.mobile-fab{display:flex}` 포함 전체  

이식 시에는 **헤더+공유+토스트+모달** 관련 규칙만 골라도 되며, 변수 `--header-h`는 유지하면 토스트 위치 계산 등이 맞춰짐.  
**`.cb-header__notice`** 및 조상 헤더 관련 선택자 규칙은 **건드리지 말고** 원본 통째 이식을 전제로 함.

---

## 7. 반응형 동작 요약 (현행과 동일하게)

| 뷰포트 | 헤더 |
|--------|------|
| **> 1024px** | 단일 행, 공지 `nowrap` (기본) |
| **≤ 1024px** | 헤더 높이 유연, 공지 줄바꿈, 우측 공유·토글 같은 줄 유지(`flex-wrap: nowrap`) |
| **≤ 768px** | PC방 토글·헤더 공유 버튼 **숨김**, 우하단 플로팅 **공유 + TOP** 표시 |

---

## 8. Claude(또는 구현 에이전트)에게 줄 때 예시 요청 문장

전체를 통째로 맡길 경우 아래처럼 붙여 쓸 수 있음:

> 같은 저장소에서 **헤더(`cb-header`), 공유 버튼·공유 모달, 복사 토스트, 모바일 플로팅(공유+TOP 버튼)**, 포함해 **카카오 SDK 연동·반응형 미디어쿼리(1024/768까지)** 까지 `index.html`과 동일하게 이식해줘.  
> **헤더 쪽 디자인용 이미지**는 디자인 변경 없이 덮어쓸 예정이라, 새 프로젝트에서는 **`assets/`** 아래 다음 파일로 두었다고 보고 경로 맞춰줘: `assets/share_icon.svg`, `assets/off=off.png`, `assets/off=on.png`.  
> **`.cb-header__notice` 안의 텍스트·링크와 해당 CSS는 원본과 똑같이** 가져가고 수정하지 말 것.  
> 메타(Open Graph/Twitter)와 **Site Name, Title, Description, 페이지 HTTPS URL, 썸네일 절대 URL** 은 이벤트마다 바뀌므로 **플레이스홀더**로 두고 `SHARE_CONFIG`와도 같은 문구 계열로 맞출 것.

---

## 9. 체크리스트 (배포 전)

- [ ] `[[SITE_NAME]]`, `[[TITLE]]`, `[[DESCRIPTION]]`, `[[HTTPS_PAGE_URL]]` 반영  
- [ ] `og:image` / `twitter:image` / `SHARE_CONFIG.ogImage` — **실제 업로드된 https 절대 URL**  
- [ ] **`assets/`** 기준으로 `share_icon.svg` 및 `off=off.png` / `off=on.png` 경로가 HTML·JS와 일치  
- [ ] 헤더 공지(`.cb-header__notice`)·헤더 CSS는 원본 그대로였는지 확인(의도적 변경 없음)  
- [ ] Kakao Developers: JavaScript 키 및 사이트 도메인 허용  
- [ ] 768px 이하 플로팅 버튼 2개 동작 및 TOP 스크롤  

---

*본 문서는 프로젝트 `minecraft_html`의 `index.html` 구현을 기준으로 작성됨.*
