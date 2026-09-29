import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

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
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', meta: { source: 'home' } },
    { path: '/admin', name: 'admin_home', meta: { requiresAuth: true } },
    { path: '/admin/set/menu', name: 'admin_set_menu', meta: { requiresAuth: true, requiresVerified: true } },
    { path: '/isAdmin', name: 'api_is_admin', meta: { source: 'server-endpoint', method: 'POST' } },

    ...boardSegments.flatMap((segment) => [
      boardRoute(`board_index_${segment}`, `/${segment}/:segment2?`),
      boardRoute(`board_write_${segment}`, `/write/${segment}/:segment2?`),
      boardRoute(`board_read_${segment}`, `/read/${segment}/:segment2?`),
      boardRoute(`board_update_${segment}`, `/update/${segment}/:segment2?`),
    ]),

    { path: '/profile', name: 'profile.edit', meta: { requiresAuth: true } },
    { path: '/register', name: 'register', meta: { guestOnly: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'password.request', meta: { guestOnly: true } },
    { path: '/reset-password/:token', name: 'password.reset', props: true, meta: { guestOnly: true } },
    { path: '/verify-email', name: 'verification.notice', meta: { requiresAuth: true } },
    { path: '/verify-email/:id/:hash', name: 'verification.verify', props: true, meta: { requiresAuth: true } },
    { path: '/confirm-password', name: 'password.confirm', meta: { requiresAuth: true } },
  ],
})

export default router
