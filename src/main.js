import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 새로고침 후 토큰이 있으면 사용자 정보 복구
const auth = useAuthStore()
auth.fetchUser()

app.mount('#app')
