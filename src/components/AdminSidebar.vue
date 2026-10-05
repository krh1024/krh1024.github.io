<template>
    <header class="admin-sidebar">
        <div class="sidebar-logo">Dochis 관리페이지</div>

        <nav class="sidebar-nav" aria-label="관리자 메뉴">
            <ul>
                <li>
                    <RouterLink to="/">홈으로</RouterLink>
                </li>
                <li>
                    <RouterLink to="/admin/set/menu">메뉴 설정</RouterLink>
                </li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <button class="logout-btn" :disabled="logoutLoading" @click="logout">
                {{ logoutLoading ? '로그아웃 중...' : '관리자 로그아웃' }}
            </button>
        </div>
    </header>
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
    name: 'AdminSidebar',

    components: { RouterLink },

    data() {
        return {
            logoutLoading: false,
        }
    },

    methods: {
        async logout() {
            this.logoutLoading = true
            try {
                const authStore = useAuthStore()
                await authStore.logout()
                await this.$router.replace('/')
            } finally {
                this.logoutLoading = false
            }
        },
    },
}
</script>

<style scoped>
.admin-sidebar {
    display: flex;
    flex-direction: column;
    width: 250px;
    min-width: 250px;
    min-height: 100vh;
    background-color: #1e3a5f;
}

.sidebar-logo {
    padding: 2.5rem 1rem;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    border-bottom: 1px solid #2a4f82;
}

.sidebar-nav {
    flex: 1;
    padding: 1.25rem;
}

.sidebar-nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.sidebar-nav li a {
    display: block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background-color: #2a4f82;
    color: #fff;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.sidebar-nav li a:hover,
.sidebar-nav li a.router-link-active {
    background-color: #3a6baa;
}

.sidebar-footer {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    border-top: 1px solid #2a4f82;
}

.logout-btn {
    padding: 0.4rem 1.5rem;
    border: 1px solid #fafafa;
    border-radius: 2rem;
    background: transparent;
    color: #fff;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.logout-btn:hover:not(:disabled) {
    background-color: #2a4f82;
}

.logout-btn:disabled {
    opacity: 0.6;
    cursor: wait;
}
</style>
