<template>
    <AdminLayout>
        <section class="admin-home">
            <div class="admin-home-inner">
                <p class="admin-eyebrow">ADMIN DASHBOARD</p>
                <h1>관리페이지</h1>
                <p class="admin-desc">좌측 메뉴에서 관리 항목을 선택하세요.</p>
            </div>
        </section>
    </AdminLayout>
</template>

<script>
import AdminLayout from '@/layouts/AdminLayout.vue'

export default {
    name: 'AdminHomeView',

    components: { AdminLayout },
}
</script>

<style scoped>
.admin-home {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 100vh;
    background: #f4f6f9;
}

.admin-home-inner {
    text-align: center;
}

.admin-eyebrow {
    margin: 0 0 12px;
    color: #7a8fa6;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 1.5px;
}

h1 {
    margin: 0 0 12px;
    color: #1e3a5f;
    font-size: 2rem;
    font-weight: 700;
}

.admin-desc {
    color: #6b7c93;
    font-size: 13px;
}
</style>
