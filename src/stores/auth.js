import { defineStore } from 'pinia'
import api from '@/composables/useApi'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token') ?? null,
        user: null,
    }),

    getters: {
        isLoggedIn: (state) => Boolean(state.token),
    },

    actions: {
        /**
         * 로그인: POST /api/auth/login
         * @param {{ email: string, password: string, remember: boolean }} credentials
         */
        async login(credentials) {
            const { data } = await api.post('/api/auth/login', {
                email:    credentials.email.trim(),
                password: credentials.password,
                remember: credentials.remember ?? false,
            })

            this.token = data.token
            this.user  = data.user

            const storage = credentials.remember ? localStorage : sessionStorage
            storage.setItem('auth_token', data.token)

            // 반대쪽 스토리지에 잔류하는 토큰 제거
            if (credentials.remember) {
                sessionStorage.removeItem('auth_token')
            } else {
                localStorage.removeItem('auth_token')
            }
        },

        /**
         * 로그아웃: POST /api/auth/logout (auth:sanctum)
         * API 호출 실패 여부와 무관하게 로컬 상태를 초기화한다.
         */
        async logout() {
            try {
                await api.post('/api/auth/logout')
            } catch {
                // 네트워크 오류 등 예외 상황에도 로컬 상태는 반드시 초기화
            } finally {
                this.token = null
                this.user  = null
                localStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_token')
            }
        },

        /**
         * 인증된 사용자 정보 갱신: GET /api/user
         * 페이지 새로고침 후 user 상태를 복구할 때 사용한다.
         */
        async fetchUser() {
            if (!this.token) return
            try {
                const { data } = await api.get('/api/user')
                this.user = data
            } catch {
                // 401 응답은 useApi 인터셉터에서 처리
            }
        },
    },
})
