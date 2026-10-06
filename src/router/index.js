import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminHomeView from '../views/admin/AdminHomeView.vue'
import AdminSetMenuView from '../views/admin/AdminSetMenuView.vue'
import BoardIndexView from '../views/board/BoardIndexView.vue'
import BoardReadView from '../views/board/BoardReadView.vue'
import BoardWriteView from '../views/board/BoardWriteView.vue'

// Routes mirrored from D:\pi\ras-blog\routes\web.php and routes/auth.php.
// segment1은 최상위 메뉴 engName, segment2는 서브메뉴 engName (optional)

const router = createRouter({
  // Hash routing works on GitHub Pages without server-side route rewrites.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: { template: '<span></span>' }, meta: { source: 'home' } },
    { path: '/admin', name: 'admin_home', component: AdminHomeView, meta: { requiresAuth: true } },
    { path: '/admin/set/menu', name: 'admin_set_menu', component: AdminSetMenuView, meta: { requiresAuth: true } },
    { path: '/isAdmin', name: 'api_is_admin', meta: { source: 'server-endpoint', method: 'POST' } },

    // 게시판 — segment1/segment2 를 동적 파라미터로 처리
    // 고정 라우트보다 아래에 위치해야 우선순위에서 밀리지 않음
    { name: 'board_write',  path: '/write/:segment1/:segment2?',  component: BoardWriteView, props: true, meta: { source: 'board', requiresAuth: true } },
    { name: 'board_read',   path: '/read/:segment1/:segment2?',   component: BoardReadView,  props: true, meta: { source: 'board' } },
    { name: 'board_update', path: '/update/:segment1/:segment2?', component: BoardWriteView, props: true, meta: { source: 'board', requiresAuth: true } },

    { path: '/profile', name: 'profile.edit', meta: { requiresAuth: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'password.request', meta: { guestOnly: true } },
    { path: '/reset-password/:token', name: 'password.reset', props: true, meta: { guestOnly: true } },
    { path: '/verify-email', name: 'verification.notice', meta: { requiresAuth: true } },
    { path: '/verify-email/:id/:hash', name: 'verification.verify', props: true, meta: { requiresAuth: true } },
    { path: '/confirm-password', name: 'password.confirm', meta: { requiresAuth: true } },

    // 게시판 목록 — 가장 마지막에 위치 (범용 와일드카드)
    { name: 'board_index',  path: '/:segment1/:segment2?', component: BoardIndexView, props: true, meta: { source: 'board' } },
  ],
})

export default router

router.beforeEach((to) => {
    const auth = useAuthStore()

    // 인증이 필요한 페이지: 미로그인 시 로그인 페이지로 이동
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    // 로그인 전용 페이지(guestOnly): 이미 로그인된 경우 홈으로 이동
    if (to.meta.guestOnly && auth.isLoggedIn) {
        return { name: 'home' }
    }
})
