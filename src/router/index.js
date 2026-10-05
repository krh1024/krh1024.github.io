import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminHomeView from '../views/admin/AdminHomeView.vue'
import AdminSetMenuView from '../views/admin/AdminSetMenuView.vue'

// Routes mirrored from D:\pi\ras-blog\routes\web.php and routes/auth.php.
// Page components can be attached as the Vue screens are ported.
const boardSegments = ['serverside', 'clientside', 'tt']

const boardRoute = (name, path) => ({
  name,
  path,
  props: true,
  meta: { source: 'board' },
})

const router = createRouter({
  // Hash routing works on GitHub Pages without server-side route rewrites.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', meta: { source: 'home' } },
    { path: '/admin', name: 'admin_home', component: AdminHomeView, meta: { requiresAuth: true } },
    { path: '/admin/set/menu', name: 'admin_set_menu', component: AdminSetMenuView, meta: { requiresAuth: true } },
    { path: '/isAdmin', name: 'api_is_admin', meta: { source: 'server-endpoint', method: 'POST' } },

    ...boardSegments.flatMap((segment) => [
      boardRoute(`board_index_${segment}`, `/${segment}/:segment2?`),
      boardRoute(`board_write_${segment}`, `/write/${segment}/:segment2?`),
      boardRoute(`board_read_${segment}`, `/read/${segment}/:segment2?`),
      boardRoute(`board_update_${segment}`, `/update/${segment}/:segment2?`),
    ]),

    { path: '/profile', name: 'profile.edit', meta: { requiresAuth: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'password.request', meta: { guestOnly: true } },
    { path: '/reset-password/:token', name: 'password.reset', props: true, meta: { guestOnly: true } },
    { path: '/verify-email', name: 'verification.notice', meta: { requiresAuth: true } },
    { path: '/verify-email/:id/:hash', name: 'verification.verify', props: true, meta: { requiresAuth: true } },
    { path: '/confirm-password', name: 'password.confirm', meta: { requiresAuth: true } },
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
