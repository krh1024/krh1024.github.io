<template>
    <main class="admin-shell">
        <AdminSidebar />
        <div class="admin-content">
            <slot />
        </div>
    </main>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue'

export default {
    name: 'AdminLayout',

    components: { AdminSidebar },
}
</script>

<style scoped>
.admin-shell {
    display: flex;
    min-height: 100vh;
}

.admin-content {
    flex: 1;
    overflow-y: auto;
}
</style>
