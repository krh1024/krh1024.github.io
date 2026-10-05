<template>
    <AdminLayout>
        <section class="set-menu">
            <article class="container">
                <h2>메뉴 설정</h2>

                <div class="btn-box">
                    <!-- 폼 열려있을 때 -->
                    <button v-if="menuSetup || updateSetup" @click="resetSetup">
                        리스트로 돌아가기
                    </button>
                    <!-- 목록 상태 -->
                    <template v-if="!menuSetup && !updateSetup">
                        <button @click="openCreateForm">메뉴 생성</button>
                        <button @click="openUpdateForm">메뉴 수정</button>
                        <button class="btn-danger" @click="deleteMenu">메뉴 삭제</button>
                    </template>
                    <!-- 생성 폼 -->
                    <button v-if="menuSetup" :disabled="confirmLoading" @click="confirmMenu">
                        {{ confirmLoading ? '처리 중...' : '메뉴 생성하기' }}
                    </button>
                    <!-- 수정 폼 -->
                    <button v-if="!menuSetup && updateSetup" :disabled="confirmLoading" @click="confirmMenu">
                        {{ confirmLoading ? '처리 중...' : '메뉴 수정하기' }}
                    </button>
                </div>

                <!-- 생성 / 수정 폼 -->
                <div v-if="menuSetup || updateSetup" class="menu-form">
                    <div class="form-row">
                        <label for="depth">메뉴 차수</label>
                        <select id="depth" v-model.number="form.depth">
                            <option :value="1">1차</option>
                            <option :value="2">2차</option>
                        </select>
                    </div>

                    <div v-if="form.depth === 2" class="form-row">
                        <label for="parentDepth">부모 메뉴</label>
                        <select id="parentDepth" v-model.number="form.parentDepth">
                            <option :value="0" disabled>선택하세요</option>
                            <option v-for="id in listIds" :key="id" :value="id">{{ id }}</option>
                        </select>
                    </div>

                    <div class="form-row">
                        <label for="name">노출 메뉴명</label>
                        <input
                            id="name"
                            v-model.trim="form.name"
                            type="text"
                            placeholder="최소 2글자 이상"
                            maxlength="255"
                        />
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>

                    <div class="form-row">
                        <label for="engName">게시판 영문명</label>
                        <input
                            id="engName"
                            v-model.trim="form.engName"
                            type="text"
                            placeholder="최소 2글자 이상"
                            maxlength="255"
                        />
                        <p v-if="formErrors.engName" class="field-error">{{ formErrors.engName }}</p>
                    </div>

                    <div class="form-checks">
                        <label class="check-item">
                            <input v-model="form.galleryFlag" type="checkbox" :true-value="1" :false-value="0" />
                            <span>사진게시판 여부</span>
                        </label>
                        <label class="check-item">
                            <input v-model="form.replyFlag" type="checkbox" :true-value="1" :false-value="0" />
                            <span>댓글 사용여부</span>
                        </label>
                        <label class="check-item">
                            <input v-model="form.starFlag" type="checkbox" :true-value="1" :false-value="0" />
                            <span>게시글 별점 여부</span>
                        </label>
                        <label class="check-item">
                            <input v-model="form.noticeFlag" type="checkbox" :true-value="1" :false-value="0" />
                            <span>공지사항 사용여부</span>
                        </label>
                    </div>
                </div>

                <!-- 메뉴 목록 -->
                <div v-else class="menus">
                    <!-- 로딩 -->
                    <div v-if="menus === null" class="loading-wrap" aria-live="polite">
                        <span class="spinner" aria-label="로딩 중"></span>
                    </div>

                    <!-- 빈 목록 -->
                    <p v-else-if="menus.length === 0" class="empty-msg">등록된 메뉴가 없습니다.</p>

                    <!-- 목록 -->
                    <ul v-else class="menus-wrap">
                        <li
                            v-for="menu in menus"
                            :key="menu.idx"
                            class="menu-item"
                        >
                            <div class="item-row">
                                <label class="check-col">
                                    <input
                                        v-model="selected"
                                        type="checkbox"
                                        :value="menu.idx"
                                        :aria-label="`${menu.menuName} 선택`"
                                    />
                                </label>
                                <span class="col-sm">{{ menu.idx }}</span>
                                <span class="col-sm">{{ menu.menuLevel }}차</span>
                                <span class="col-lg">{{ menu.menuName }} ({{ menu.menuEngName }})</span>
                                <span class="col-md">갤러리: {{ menu.galleryUse ? 'Y' : 'N' }}</span>
                                <span class="col-md">댓글: {{ menu.replyUse ? 'Y' : 'N' }}</span>
                                <span class="col-md">별점: {{ menu.starUse ? 'Y' : 'N' }}</span>
                                <span class="col-md">공지: {{ menu.noticeUse ? 'Y' : 'N' }}</span>
                            </div>

                            <!-- 서브메뉴 -->
                            <ul v-if="menu.submenu && menu.submenu.length" class="submenu-wrap">
                                <li
                                    v-for="sub in menu.submenu"
                                    :key="sub.idx"
                                    class="submenu-item"
                                >
                                    <div class="item-row">
                                        <label class="check-col">
                                            <input
                                                v-model="selected"
                                                type="checkbox"
                                                :value="sub.idx"
                                                :aria-label="`${sub.menuName} 선택`"
                                            />
                                        </label>
                                        <span class="col-sm">{{ sub.idx }}</span>
                                        <span class="col-sm">{{ sub.menuLevel }}차</span>
                                        <span class="col-lg">{{ sub.menuName }} ({{ sub.menuEngName }})</span>
                                        <span class="col-md">갤러리: {{ sub.galleryUse ? 'Y' : 'N' }}</span>
                                        <span class="col-md">댓글: {{ sub.replyUse ? 'Y' : 'N' }}</span>
                                        <span class="col-md">별점: {{ sub.starUse ? 'Y' : 'N' }}</span>
                                        <span class="col-md">공지: {{ sub.noticeUse ? 'Y' : 'N' }}</span>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <!-- 전역 에러 메시지 -->
                <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

                <!-- 완료 메시지 -->
                <p v-if="successMessage" class="form-success" role="status">{{ successMessage }}</p>
            </article>
        </section>
    </AdminLayout>
</template>

<script>
import AdminLayout from '@/layouts/AdminLayout.vue'
import api from '@/composables/useApi'

const defaultForm = () => ({
    boardId:     null,
    depth:       1,
    parentDepth: 0,
    name:        '',
    engName:     '',
    galleryFlag: 0,
    replyFlag:   0,
    starFlag:    0,
    noticeFlag:  0,
})

export default {
    name: 'AdminSetMenuView',

    components: { AdminLayout },

    data() {
        return {
            menus:          null,   // null = 로딩 중
            listIds:        [],     // depth=1 메뉴 ID 목록 (부모 선택용)
            selected:       [],     // 체크박스로 선택된 idx 배열
            menuSetup:      false,  // 생성 폼 표시
            updateSetup:    false,  // 수정 폼 표시
            confirmLoading: false,
            form:           defaultForm(),
            formErrors:     {},
            errorMessage:   '',
            successMessage: '',
        }
    },

    mounted() {
        this.loadMenus()
    },

    methods: {
        // ── 메뉴 목록 로드 ─────────────────────────────────────────
        async loadMenus() {
            this.menus        = null
            this.errorMessage = ''
            try {
                const { data } = await api.get('/api/get/menu')
                if (data.flag) {
                    this.menus   = data.items
                    this.listIds = data.items.map((m) => m.idx)
                } else {
                    this.errorMessage = data.message ?? '메뉴를 불러오지 못했습니다.'
                    this.menus = []
                }
            } catch {
                this.errorMessage = '메뉴를 불러오는 중 오류가 발생했습니다.'
                this.menus = []
            }
        },

        // ── 생성 폼 열기 ───────────────────────────────────────────
        openCreateForm() {
            this.form       = defaultForm()
            this.formErrors = {}
            this.menuSetup  = true
        },

        // ── 수정 폼 열기 ───────────────────────────────────────────
        async openUpdateForm() {
            if (this.selected.length !== 1) {
                this.errorMessage = this.selected.length > 1
                    ? '메뉴를 하나만 선택하세요.'
                    : '수정할 메뉴를 선택해주세요.'
                return
            }
            this.errorMessage = ''
            try {
                const { data } = await api.get('/api/get/oneMenu', {
                    params: { selected: this.selected[0] },
                })
                if (data.flag) {
                    const item = data.items
                    this.form = {
                        boardId:     item.idx,
                        depth:       item.menuLevel,
                        parentDepth: item.parentMenuLevel ?? 0,
                        name:        item.menuName,
                        engName:     item.menuEngName,
                        galleryFlag: item.galleryUse,
                        replyFlag:   item.replyUse,
                        starFlag:    item.starUse,
                        noticeFlag:  item.noticeUse,
                    }
                    this.formErrors  = {}
                    this.updateSetup = true
                }
            } catch {
                this.errorMessage = '메뉴 정보를 불러오는 중 오류가 발생했습니다.'
            }
        },

        // ── 생성 / 수정 확정 ──────────────────────────────────────
        async confirmMenu() {
            this.formErrors   = {}
            this.errorMessage = ''

            // 클라이언트 유효성 검사
            if (!this.form.name || this.form.name.length < 2) {
                this.formErrors.name = '노출 메뉴명을 2글자 이상 입력하세요.'
            }
            if (!this.form.engName || this.form.engName.length < 2) {
                this.formErrors.engName = '게시판 영문명을 2글자 이상 입력하세요.'
            }
            if (Object.keys(this.formErrors).length > 0) return

            this.confirmLoading = true
            try {
                const { data } = await api.post('/api/admin/menu/create', this.form)
                if (data.flag) {
                    this.successMessage = data.message ?? '저장되었습니다.'
                    await this.loadMenus()
                    this.resetSetup()
                } else {
                    this.errorMessage = data.message ?? '저장에 실패했습니다.'
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message ?? '오류가 발생했습니다.'
            } finally {
                this.confirmLoading = false
            }
        },

        // ── 삭제 ──────────────────────────────────────────────────
        async deleteMenu() {
            this.errorMessage  = ''
            this.successMessage = ''

            if (this.selected.length === 0) {
                this.errorMessage = '삭제할 메뉴를 선택해주세요.'
                return
            }

            if (!window.confirm('선택한 메뉴를 정말 삭제하시겠습니까?')) return

            try {
                const { data } = await api.post('/api/admin/menu/delete', {
                    idx: this.selected,
                })
                if (data.flag) {
                    this.successMessage = data.message ?? '삭제되었습니다.'
                    this.selected = []
                    await this.loadMenus()
                } else {
                    this.errorMessage = data.message ?? '삭제에 실패했습니다.'
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message ?? '오류가 발생했습니다.'
            }
        },

        // ── 폼 초기화 (목록으로 돌아가기) ─────────────────────────
        resetSetup() {
            this.menuSetup      = false
            this.updateSetup    = false
            this.form           = defaultForm()
            this.formErrors     = {}
            this.successMessage = ''
            this.errorMessage   = ''
        },
    },
}
</script>

<style scoped>
.set-menu {
    flex: 1;
    background: #f4f6f9;
    min-height: 100vh;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

h2 {
    margin: 0 0 1.5rem;
    color: #1e3a5f;
    font-size: 1.375rem;
    font-weight: 700;
}

/* 버튼 영역 */
.btn-box {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    padding: 0.5rem 1rem;
    margin-bottom: 1.25rem;
    border: 1px solid #d0d7e3;
    border-radius: 4px;
    background: #e8ecf2;
}

.btn-box button {
    padding: 0.375rem 1rem;
    border: none;
    border-radius: 4px;
    background: #2a4f82;
    color: #fff;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-box button:hover:not(:disabled) { background: #3a6baa; }
.btn-box button:disabled { opacity: 0.6; cursor: wait; }
.btn-box .btn-danger { background: #c0392b; }
.btn-box .btn-danger:hover:not(:disabled) { background: #e74c3c; }

/* 생성/수정 폼 */
.menu-form {
    background: #fff;
    border: 1px solid #d0d7e3;
    border-radius: 6px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-row label {
    color: #1e3a5f;
    font-size: 12px;
    font-weight: 700;
}

.form-row input[type='text'],
.form-row select {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #ccd4df;
    border-radius: 4px;
    background: #fafbfc;
    color: #24372b;
    font: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-row input:focus,
.form-row select:focus {
    border-color: #2a4f82;
    box-shadow: 0 0 0 3px rgba(42, 79, 130, 0.12);
}

.field-error {
    margin: 0;
    color: #b23b37;
    font-size: 11px;
}

.form-checks {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.check-item {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #435349;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
}

/* 메뉴 목록 */
.loading-wrap {
    display: flex;
    justify-content: center;
    padding: 4rem 0;
}

.spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid #d0d7e3;
    border-top-color: #2a4f82;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-msg {
    padding: 3rem 0;
    color: #7a8fa6;
    text-align: center;
    font-size: 13px;
}

.menus-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    border: 1px solid #c7d3e5;
    border-radius: 6px;
    background: #edf2fb;
    overflow: hidden;
}

.submenu-wrap {
    list-style: none;
    margin: 0;
    padding: 0;
}

.submenu-item {
    background: #f4f7fc;
    border-top: 1px solid #c7d3e5;
}

.item-row {
    display: flex;
    align-items: stretch;
    min-height: 48px;
}

.item-row > * {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    border-right: 1px solid #c7d3e5;
    font-size: 12px;
    color: #2c3e50;
    text-align: center;
}

.item-row > *:last-child { border-right: none; }

.check-col { width: 40px; min-width: 40px; }
.col-sm    { width: 56px; min-width: 56px; }
.col-md    { flex: 1; }
.col-lg    { flex: 2; }

/* 메시지 */
.form-message {
    margin: 1rem 0 0;
    color: #b23b37;
    font-size: 12px;
    line-height: 1.6;
}

.form-success {
    margin: 1rem 0 0;
    color: #27794a;
    font-size: 12px;
    line-height: 1.6;
}
</style>
