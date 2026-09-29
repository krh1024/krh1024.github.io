# 블로그 마이그레이션 설계

## 디렉토리 구조

```
src/
├── assets/
├── components/          # 공통 재사용 컴포넌트
├── composables/         # 공통 로직 (axios 인스턴스 등)
├── router/
│   └── index.js         # 기존 라우트 매핑 유지
├── stores/
│   ├── auth.js          # 인증 상태 (토큰, 사용자 정보)
│   └── board.js         # 게시판 상태
├── views/
│   ├── HomeView.vue
│   ├── auth/
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ForgotPasswordView.vue
│   │   ├── ResetPasswordView.vue
│   │   ├── VerifyEmailView.vue
│   │   └── ConfirmPasswordView.vue
│   ├── board/
│   │   ├── BoardIndexView.vue
│   │   ├── BoardWriteView.vue
│   │   ├── BoardReadView.vue
│   │   └── BoardUpdateView.vue
│   └── admin/
│       ├── AdminHomeView.vue
│       └── AdminSetMenuView.vue
└── App.vue
```

## 주요 설계 결정

### Vue 컴포넌트 패턴
- **Options API** 를 사용한다. `data()`, `methods`, `computed`, `watch`, 생명주기 훅 순서로 작성한다.
- 파일 순서: `<template>` → `<script>` → `<style>`.

### 라우터 가드
- `router.beforeEach` 에서 `requiresAuth` 메타를 확인하여 미인증 접근을 `/login?redirect=...` 으로 리다이렉트한다.
- `guestOnly` 메타가 있는 라우트는 인증된 사용자를 `/` 로 리다이렉트한다.

### axios 인스턴스
- `src/composables/useApi.js` 에 axios 인스턴스를 정의한다.
- `baseURL` 은 `import.meta.env.VITE_API_BASE_URL` 로 설정한다.
- 요청 인터셉터에서 `Authorization: Bearer <token>` 헤더를 주입한다.
- 응답 인터셉터에서 401 시 토큰을 제거하고 로그인 페이지로 이동한다.

### Pinia 인증 스토어 (`stores/auth.js`)
```js
// 핵심 state
token: null,
user: null,

// 핵심 actions
login(credentials, remember),
logout(),
fetchUser(),
```

### 예외 처리
- API 오류 응답은 `ApiException` 패턴에 맞춰 `message` 필드를 사용자에게 노출한다.
- 페이지 수준 오류는 `PageException` 패턴을 따른다.
