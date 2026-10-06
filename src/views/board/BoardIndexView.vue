<template>
    <section class="board-index">
        <div class="board-banner">
            <p class="board-eyebrow">BOARD</p>
            <h2>{{ boardStore.getTargetBoard?.menuName ?? '' }}</h2>
        </div>

        <article class="board-container">
            <!-- 관리자 버튼 -->
            <div v-if="authStore.isLoggedIn" class="admin-bar">
                <button class="btn-danger" :disabled="selected.length === 0" @click="deleteSelected">
                    선택삭제
                </button>
                <RouterLink
                    class="btn-write"
                    :to="writeRoute"
                >
                    글쓰기
                </RouterLink>
            </div>

            <!-- 로딩 -->
            <div v-if="list === null" class="loading-wrap" aria-live="polite">
                <span class="spinner" aria-label="로딩 중"></span>
            </div>

            <!-- 빈 목록 -->
            <p v-else-if="list.length === 0" class="empty-msg">게시글이 없습니다.</p>

            <!-- 목록 -->
            <ul v-else class="post-list">
                <li v-for="item in list" :key="item.글번호" class="post-item">
                    <label v-if="authStore.isLoggedIn" class="check-col">
                        <input
                            v-model="selected"
                            type="checkbox"
                            :value="item.글번호"
                            :aria-label="`${item.제목} 선택`"
                        />
                    </label>
                    <RouterLink class="post-link" :to="readRoute(item.글번호)">
                        <div class="thumb-wrap">
                            <img
                                v-if="item.썸네일경로"
                                :src="thumbUrl(item.썸네일경로)"
                                :alt="item.제목"
                            />
                            <div v-else class="thumb-empty">
                                <span>No Image</span>
                            </div>
                        </div>
                        <div class="post-info">
                            <p v-if="item.공지유무" class="notice-badge">공지</p>
                            <p class="post-title">{{ item.제목 }}</p>
                            <p class="post-meta">{{ item.작성시간 }}</p>
                        </div>
                    </RouterLink>
                </li>
            </ul>

            <!-- 페이지네이션 -->
            <div v-if="meta && meta.last_page > 1" class="pagination">
                <button
                    v-for="page in meta.last_page"
                    :key="page"
                    :class="{ active: page === meta.current_page }"
                    @click="loadList(page)"
                >
                    {{ page }}
                </button>
            </div>

            <!-- 에러 메시지 -->
            <p v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</p>
        </article>
    </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'

export default {
    name: 'BoardIndexView',

    components: { RouterLink },

    props: {
        segment1: { type: String, required: true },
        segment2: { type: String, default: null },
    },

    data() {
        return {
            boardStore:   useBoardStore(),
            authStore:    useAuthStore(),
            list:         null,  // null = 로딩 중
            meta:         null,
            selected:     [],
            errorMessage: '',
        }
    },

    computed: {
        // 현재 게시판의 seg (서브메뉴면 segment2, 아니면 segment1)
        activeSeg() {
            return this.segment2 ?? this.segment1
        },
        writeRoute() {
            return this.segment2
                ? `/write/${this.segment1}/${this.segment2}`
                : `/write/${this.segment1}`
        },
    },

    watch: {
        // 같은 컴포넌트에서 다른 게시판으로 이동할 때 재로드
        '$route'(to) {
            this.init()
        },
    },

    created() {
        this.init()
    },

    methods: {
        async init() {
            this.list         = null
            this.selected     = []
            this.errorMessage = ''

            // targetBoard 설정: API에서 해당 게시판 메뉴 정보 가져오기
            try {
                const { data } = await api.get('/api/get/menu')
                if (data.flag && Array.isArray(data.items)) {
                    let found = null
                    for (const m of data.items) {
                        if (m.menuEngName === this.activeSeg) {
                            found = { ...m, seg1: this.segment1, seg2: this.segment2 }
                            break
                        }
                        if (Array.isArray(m.submenu)) {
                            for (const s of m.submenu) {
                                if (s.menuEngName === this.activeSeg) {
                                    found = { ...s, seg1: this.segment1, seg2: this.segment2 }
                                    break
                                }
                            }
                        }
                        if (found) break
                    }
                    if (found) this.boardStore.setTargetBoard(found)
                }
            } catch {
                // 메뉴 로드 실패 시 무시 — 목록은 계속 로드
            }

            await this.loadList(1)
        },

        async loadList(page = 1) {
            this.errorMessage = ''
            const targetBoard = this.boardStore.getTargetBoard

            if (!targetBoard?.idx) {
                this.list = []
                return
            }

            try {
                const { data } = await api.post('/api/board/', {
                    idx:   targetBoard.idx,
                    limit: 16,
                    page,
                })

                if (data.flag) {
                    this.list = data.items.data
                    this.meta = data.items.meta
                } else {
                    this.errorMessage = data.message ?? '목록을 불러올 수 없습니다.'
                    this.list = []
                }
            } catch {
                this.errorMessage = '목록을 불러오는 중 오류가 발생했습니다.'
                this.list = []
            }
        },

        readRoute(no) {
            return this.segment2
                ? `/read/${this.segment1}/${this.segment2}?no=${no}`
                : `/read/${this.segment1}?no=${no}`
        },

        thumbUrl(path) {
            // 2026-10-06 by codex (User: user) - https?:// 정규식으로 체크 통일 (http 단순 비교 → 정규식)
            const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
            return /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`
        },

        async deleteSelected() {
            if (this.selected.length === 0) return
            if (!window.confirm('선택한 게시물을 정말 삭제하시겠습니까?')) return

            try {
                const { data } = await api.post('/api/board/api_board_delete', {
                    list: this.selected,
                })

                if (data.flag) {
                    this.selected = []
                    await this.loadList(1)
                } else {
                    this.errorMessage = data.message ?? '삭제에 실패했습니다.'
                }
            } catch {
                this.errorMessage = '삭제 중 오류가 발생했습니다.'
            }
        },
    },
}
</script>

<style scoped>
.board-index { display: flex; flex-direction: column; flex: 1; background: #f7f8f5; }

/* 배너 */
.board-banner { padding: 48px clamp(24px, 7.2vw, 112px) 36px; background: #1e3027; }
.board-eyebrow { margin: 0 0 8px; color: #7ca58a; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; }
.board-banner h2 { margin: 0; color: #fff; font-size: clamp(24px, 3vw, 36px); font-weight: 700; letter-spacing: -.05em; }

/* 컨테이너 */
.board-container { max-width: 1100px; width: 100%; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

/* 관리자 바 */
.admin-bar { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 1.25rem; }
.admin-bar button, .btn-write { padding: 7px 16px; border: none; border-radius: 4px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .2s; }
.btn-danger { background: #c0392b; color: #fff; }
.btn-danger:hover:not(:disabled) { background: #e74c3c; }
.btn-danger:disabled { opacity: .5; cursor: default; }
.btn-write { background: #1e3027; color: #fff; text-decoration: none; display: inline-flex; align-items: center; }
.btn-write:hover { background: #2d4a3a; }

/* 로딩 */
.loading-wrap { display: flex; justify-content: center; padding: 5rem 0; }
.spinner { display: inline-block; width: 36px; height: 36px; border: 3px solid #d0d7d3; border-top-color: #1e3027; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-msg { padding: 4rem 0; color: #8a9a8d; text-align: center; font-size: 14px; }

/* 게시글 목록 */
.post-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; list-style: none; margin: 0; padding: 0; }
.post-item { display: flex; align-items: flex-start; gap: 8px; }
.check-col { padding-top: 4px; flex-shrink: 0; }
.post-link { display: flex; flex-direction: column; flex: 1; border: 1px solid #e8ebe5; border-radius: 8px; overflow: hidden; background: #fff; transition: box-shadow .2s, transform .2s; text-decoration: none; color: inherit; }
.post-link:hover { box-shadow: 0 6px 24px rgba(30,48,39,.1); transform: translateY(-2px); }

/* 썸네일 */
.thumb-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; background: #edf2ed; }
.thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
.thumb-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #b0bdb2; font-size: 11px; }

/* 포스트 정보 */
.post-info { padding: 14px 16px 16px; }
.notice-badge { display: inline-block; margin: 0 0 6px; padding: 2px 8px; border-radius: 3px; background: #1e3027; color: #fff; font-size: 10px; font-weight: 700; }
.post-title { margin: 0 0 8px; color: #1a3025; font-size: 14px; font-weight: 600; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.post-meta { margin: 0; color: #8a9a8d; font-size: 11px; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; gap: 6px; margin-top: 2.5rem; flex-wrap: wrap; }
.pagination button { width: 36px; height: 36px; border: 1px solid #dce2db; border-radius: 4px; background: #fff; color: #5a6a5e; font: inherit; font-size: 13px; cursor: pointer; transition: background .15s, border-color .15s; }
.pagination button:hover { background: #edf2ed; border-color: #b0bdb2; }
.pagination button.active { background: #1e3027; border-color: #1e3027; color: #fff; }

.error-msg { margin-top: 1.5rem; color: #b23b37; font-size: 12px; text-align: center; }

@media (max-width: 600px) {
    .post-list { grid-template-columns: 1fr; }
    .board-banner { padding: 32px 22px 24px; }
}
</style>
