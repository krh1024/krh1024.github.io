# 블로그 마이그레이션 작업 목록

## Phase 1 — 기반 설정

- [ ] `src/composables/useApi.js` 생성: axios 인스턴스, 요청·응답 인터셉터
- [ ] `src/stores/auth.js` 생성: 토큰·사용자 상태, login/logout/fetchUser 액션
- [ ] `src/router/index.js` 수정: 라우터 가드(`requiresAuth`, `guestOnly`) 추가

## Phase 2 — 인증 뷰

- [ ] `LoginView.vue` 리팩터링: `fetch` → axios, Options API 전환
- [ ] `RegisterView.vue` 구현
- [ ] `ForgotPasswordView.vue` 구현
- [ ] `ResetPasswordView.vue` 구현
- [ ] `VerifyEmailView.vue` 구현
- [ ] `ConfirmPasswordView.vue` 구현

## Phase 3 — 게시판 뷰

- [ ] `BoardIndexView.vue` 구현 (목록, 페이지네이션)
- [ ] `BoardWriteView.vue` 구현 (글 작성 폼)
- [ ] `BoardReadView.vue` 구현 (상세 페이지)
- [ ] `BoardUpdateView.vue` 구현 (수정 폼)

## Phase 4 — 관리자 뷰

- [ ] `AdminHomeView.vue` 구현
- [ ] `AdminSetMenuView.vue` 구현

## Phase 5 — 마무리

- [ ] 기존 `counter` 스토어 제거 및 실제 도메인 스토어로 교체
- [ ] 전체 라우트 동작 검증 (인증·비인증 흐름)
- [ ] 모바일 반응형 및 접근성(ARIA) 검토
- [ ] 린트·포맷 최종 확인 (`npm run lint`, `npm run format`)
