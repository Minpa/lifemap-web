# LifeMap Web App Mark‑Up Spec (v0.1, 2025-10-11)
> 목적: **온디바이스+웹 하이브리드**의 웹 뷰/공유/경량 편집을 위한 **마크업(HTML 구조) 기준**을 정의한다.  
> 범위: 페이지 템플릿, 라우팅, 핵심 컴포넌트 DOM 구조, 접근성(ARIA), 데이터 속성(`data-*`) 규약, 반응형 브레이크포인트, 디자인 토큰.

---

## 0) 가정(프레임워크 중립)
- 프레임워크: React/Next.js 또는 유사 SPA/MPA 프레임워크 가정. (서버 렌더 + 클라이언트 하이드레이션)
- 지도 엔진: Mapbox GL(JS) 또는 CesiumJS (2D/3D 옵션). 본 문서는 **DOM 구조** 중심으로 기술.
- 스타일: CSS 변수 기반 디자인 토큰 + 유틸리티 클래스(선택). 다크 모드 내장.
- 데이터 바인딩: 모든 동적 요소는 `data-component`·`data-prop-*`로 식별하여 JS에서 주입.

---

## 1) 디자인 토큰(CSS Custom Properties)
루트에서 공통 색/타이포/간격/심도 정의. 팔레트는 사용자별로 주입.

```css
:root {
  /* 색상 토큰 */
  --color-bg: #0b0c10;
  --color-surface: #111217;
  --color-text: #e6e6e6;
  --color-muted: #a4a8ad;
  --color-accent: #6ae3ff;        /* 기본 포커스/액션 */
  --color-danger: #ff6a6a;
  --color-ok: #6aff9a;
  /* 팔레트(사용자 커스텀 주입) */
  --palette-0: #7fe3ff;  /* 유년기/새벽/평온 */
  --palette-1: #8af5c2;  /* 청춘/낮/활기 */
  --palette-2: #ffd166;  /* 중년/황혼/회상 */
  --palette-3: #ff7aa2;  /* 설렘/강렬 */
  --palette-4: #9d8cff;  /* 고요/깊이 */
  /* 공간/레이아웃 */
  --radius: 14px;
  --gap-1: 6px; --gap-2: 12px; --gap-3: 20px; --gap-4: 32px;
  --shadow-1: 0 6px 20px rgba(0,0,0,.25);
  /* 타이포 */
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
}
```

---

## 2) 반응형 브레이크포인트
- `--sm: ≥480px`, `--md: ≥768px`, `--lg: ≥1024px`, `--xl: ≥1440px`  
- 모바일 1열, 태블릿 2열(지도+패널), 데스크톱 3열(지도+사이드바+도킹 패널).

---

## 3) 라우팅(초안)
- `/`          : 랜딩(설명/프라이버시/샘플 맵)
- `/app/map`   : **메인 맵**(개인 지도·색칠·타임머신·레이어 토글)
- `/share/:id` : 공유 보기(퍼징 GeoJSON, 읽기 전용, 만료 옵션)
- `/runs`      : 러닝 세션 목록/세부
- `/trip/:id`  : 여행 상세(자동 인식된 여행 카드)
- `/place/:id` : 대표 위치 카드(머문 시간/라이프클록/히트맵)
- `/palette`   : 팔레트/스타일 편집
- `/privacy`   : 프라이버시 대시보드(마스킹/퍼징 레벨, 다운로드/삭제)
- `/settings`  : 환경설정(i18n, 단위, 접근성)

> SEO: `/share/:id`는 Open Graph 메타와 프리렌더 이미지 제공.

---

## 4) 페이지 템플릿: 공통 레이아웃
```html
<body class="theme-dark" data-app="lifemap">
  <header role="banner" class="lm-header" data-component="Header">
    <a class="brand" href="/"><span aria-hidden="true">🌍</span> LifeMap</a>
    <nav aria-label="주요 메뉴">
      <a href="/app/map">내 지도</a>
      <a href="/runs">러닝</a>
      <a href="/palette">팔레트</a>
      <a href="/privacy">프라이버시</a>
      <a href="/settings" aria-label="설정">⚙︎</a>
    </nav>
  </header>
  <main class="lm-shell" role="main">
    <!-- route outlet -->
  </main>
  <div id="portal-root" aria-hidden="true"></div>
  <footer role="contentinfo" class="lm-footer">© LifeMap</footer>
</body>
```

---

## 5) 메인 맵(/app/map) 마크업
### 5.1 레이아웃
```html
<section class="map-page" data-component="MapPage">
  <aside class="panel panel--left" data-component="TimelinePanel" aria-label="타임라인">
    <div class="timeline-header">
      <h2>타임머신</h2>
      <input type="range" min="2000" max="2025" step="1" aria-label="연도 슬라이더"
             data-prop-key="yearSlider" />
      <div class="chips">
        <button data-action="tm-today">오늘로</button>
        <button data-action="tm-5y">5년 전</button>
        <button data-action="tm-random">랜덤</button>
      </div>
    </div>
    <ul class="memory-list" role="list" aria-label="기억 카드 목록">
      <!-- li[data-component="MemoryCard"]* -->
    </ul>
  </aside>

  <div class="map-canvas" data-component="MapCanvas" role="application" aria-label="LifeMap 지도">
    <div id="map" class="map-container" aria-hidden="true"></div>
    <!-- 레이어 토글 -->
    <div class="layer-toggle" role="group" aria-label="레이어">
      <label><input type="checkbox" checked data-layer="track"> 궤적</label>
      <label><input type="checkbox" checked data-layer="heat"> 누적 영역</label>
      <label><input type="checkbox" data-layer="rings"> 대표 위치 링</label>
      <label><input type="checkbox" data-layer="resonance"> 공명 지도</label>
      <label><input type="checkbox" data-layer="runs"> 러닝</label>
    </div>
    <!-- 범례 -->
    <div class="legend" aria-live="polite" data-component="Legend">
      <div><span class="swatch" style="background:var(--palette-0)"></span> 유년/새벽</div>
      <div><span class="swatch" style="background:var(--palette-2)"></span> 중년/황혼</div>
      <div><span class="line thick"></span> 오래 머문 곳</div>
      <div><span class="glow"></span> 감정의 빛</div>
    </div>
  </div>

  <aside class="panel panel--right" data-component="InspectorPanel" aria-label="상세 패널">
    <!-- 동적: PlaceCard, TripCard, RunCard, PalettePanel -->
  </aside>
</section>
```

### 5.2 대표 위치 카드(PlaceCard)
```html
<section class="card place-card" data-component="PlaceCard" aria-labelledby="place-title">
  <header>
    <h3 id="place-title">단골 카페</h3>
    <div class="badge">대표 위치</div>
    <button data-action="favorite" aria-pressed="false" aria-label="즐겨찾기">★</button>
  </header>
  <div class="stats">
    <div class="life-clock" role="img" aria-label="시간대별 체류 도넛 차트"></div>
    <div class="week-heatmap" role="img" aria-label="요일×시간 히트맵"></div>
  </div>
  <ul class="summary" role="list">
    <li>이번달 <strong data-prop="month_hours">12h</strong></li>
    <li>올해 <strong data-prop="year_hours">48h</strong></li>
    <li>평생 <strong data-prop="lifetime_hours">212h</strong></li>
  </ul>
  <footer class="meta">
    <span>최근 방문: <time data-prop="last_visit">2025-10-08</time></span>
    <span class="privacy">좌표 마스킹 ON</span>
  </footer>
</section>
```

### 5.3 여행 카드(TripCard)
```html
<section class="card trip-card" data-component="TripCard">
  <header>
    <h3>강릉 여행</h3>
    <div class="date-range"><time>2025-05-03</time>–<time>2025-05-05</time></div>
  </header>
  <div class="gallery" aria-label="여행 사진"></div>
  <p class="copy">“바다가 처음 물들던 날.”</p>
  <div class="actions">
    <button data-action="merge">여행 합치기</button>
    <button data-action="edit">메모</button>
    <button data-action="share">공유</button>
  </div>
</section>
```

### 5.4 러닝 카드(RunCard)
```html
<section class="card run-card" data-component="RunCard">
  <header>
    <h3>아침 러닝 5K</h3>
    <div class="date-time"><time>2025-10-11 06:42</time></div>
  </header>
  <ul class="metrics">
    <li>거리 <strong>5.02km</strong></li>
    <li>평균 페이스 <strong>5'20"</strong></li>
    <li>고도 상승 <strong>84m</strong></li>
  </ul>
  <div class="privacy-hint">출발/도착 500m 마스킹</div>
  <div class="actions">
    <button data-action="export-gpx">GPX 내보내기</button>
    <button data-action="share">공유</button>
  </div>
</section>
```

### 5.5 팔레트 패널(PalettePanel)
```html
<section class="card palette-panel" data-component="PalettePanel" aria-label="팔레트">
  <header><h3>나의 팔레트</h3></header>
  <div class="swatches">
    <button class="swatch" data-prop-color="--palette-0" aria-label="팔레트 0"></button>
    <button class="swatch" data-prop-color="--palette-1" aria-label="팔레트 1"></button>
    <button class="swatch" data-prop-color="--palette-2" aria-label="팔레트 2"></button>
    <button class="swatch" data-prop-color="--palette-3" aria-label="팔레트 3"></button>
    <button class="swatch" data-prop-color="--palette-4" aria-label="팔레트 4"></button>
  </div>
  <div class="controls">
    <label>두께 스케일
      <input type="range" min="0" max="100" data-prop="thicknessScale" />
    </label>
    <label>발광 강도
      <input type="range" min="0" max="100" data-prop="glow" />
    </label>
  </div>
</section>
```

### 5.6 공유 다이얼로그(ShareDialog)
```html
<div class="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title" data-component="ShareDialog">
  <h3 id="share-title">공유</h3>
  <p>퍼징된 GeoJSON으로 생성된 링크입니다. 만료 기간을 선택하세요.</p>
  <label>만료 <select data-prop="expires">
    <option value="72">72시간</option>
    <option value="168" selected>7일</option>
    <option value="720">30일</option>
  </select></label>
  <div class="privacy">집/직장 프라이버시 존 자동 마스킹 • 시간 퍼징 1–3h</div>
  <div class="actions">
    <button data-action="create-share">링크 만들기</button>
    <button data-action="close">닫기</button>
  </div>
</div>
```

---

## 6) `/share/:id` 페이지(읽기 전용)
- 최소 DOM만 유지. 지도 + 범례 + 미니 타임라인(옵션), 편집/삭제 없음.
```html
<main class="share-view" data-component="ShareView">
  <div class="map-canvas read-only">
    <div id="map" class="map-container"></div>
    <div class="legend compact">…</div>
  </div>
  <section class="share-meta">
    <h1>LifeMap 공유 보기</h1>
    <p>퍼징된 데이터 · 만료 <time>2025-10-18</time></p>
  </section>
</main>
```

---

## 7) 프라이버시 대시보드(/privacy)
- 수집 빈도/배터리 영향/삭제·다운로드(내보내기) 버튼, 프라이버시 존 반경 설정.
```html
<section class="privacy-dashboard" data-component="PrivacyDashboard">
  <h2>프라이버시</h2>
  <fieldset>
    <legend>프라이버시 존</legend>
    <label>반경
      <input type="range" min="300" max="1000" step="50" data-prop="privacyRadius" />
    </label>
    <label><input type="checkbox" checked data-prop="maskHome"> 집 마스킹</label>
    <label><input type="checkbox" checked data-prop="maskWork"> 직장 마스킹</label>
  </fieldset>
  <fieldset>
    <legend>공개 레벨</legend>
    <label><input type="radio" name="vis" checked> 비공개</label>
    <label><input type="radio" name="vis"> 제한 공유</label>
    <label><input type="radio" name="vis"> 익명 공개</label>
  </fieldset>
  <div class="actions">
    <button data-action="export">내보내기</button>
    <button data-action="delete">모든 기록 삭제</button>
  </div>
</section>
```

---

## 8) 접근성(필수)
- 지도 컨테이너 `role="application"` + 키보드 이동(패닝/확대) 대체 단축키 제공.
- 모든 카드/패널은 `aria-labelledby`와 설명 라벨 제공, 실시간 갱신은 `aria-live` 사용.
- 대비/색각 이상 모드: **대체 패턴(점선/해치)** 제공, 의미가 색상에만 의존하지 않도록 설계.

---

## 9) 데이터 속성 규약
- `data-component`: JS 컴포넌트 마운트 지점
- `data-layer`: 지도 레이어 토글 키
- `data-prop-*`: 하이드레이션 시 바인딩될 속성
- `data-action`: 이벤트 디스패치 키(버튼/토글)

---

## 10) 퍼포먼스
- 타일/GeoJSON은 **분할 로딩**. H3 레벨/줌 기반 스트리밍.
- 공유 페이지는 **프리렌더 이미지**(OG) + LCP 개선.
- 인터랙션은 `requestIdleCallback`/`IntersectionObserver`로 점진적 마운트.

---

## 11) i18n
- 모든 라벨/문구는 `data-i18n-key`로 식별. 한국어 기본, 영어/일본어 확장.

---

## 12) 보안/프라이버시(웹)
- `/share/:id`만 서버 접근. 원시 좌표 없음. 퍼징/마스킹 적용된 데이터만 주입.
- 링크는 **서명 토큰 + 만료**. 로깅은 집계형(개인 식별 없음).

---

## 13) QA 체크리스트(발췌)
- [ ] 지도에서 프라이버시 존이 가시적으로 표시되고, 공유 보기에서 제거됨
- [ ] 대표 위치 링 두께가 체류시간 변화에 반응
- [ ] 타임머신 슬라이더 조작 시 레이어/범례가 동기화
- [ ] 러닝 카드의 출발/도착 마스킹 문구 노출
- [ ] 키보드만으로 주요 기능에 접근 가능(탭 순서/포커스 트랩)

---

## 14) 부록: 샘플 카드 마크업 스니펫
(상단 섹션 5의 코드 블록 참조)
