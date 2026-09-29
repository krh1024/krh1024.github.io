import axios from 'axios'
import router from '@/router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
})

// 요청 인터셉터: 저장된 토큰을 Authorization 헤더에 주입
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 응답 인터셉터: 401 수신 시 토큰 제거 후 로그인 페이지로 이동
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_token')
            router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
        }
        return Promise.reject(error)
    },
)

export default api
