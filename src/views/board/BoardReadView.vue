<template>
    <section class="board-read">
        <div class="board-banner">
            <p class="board-eyebrow">BOARD</p>
            <h2>{{ boardStore.getTargetBoard?.menuName ?? '' }}</h2>
        </div>

        <article class="read-container">
            <!-- 버튼 바 -->
            <div class="btn-bar">
                <RouterLink class="btn-back" :to="indexRoute">목록보기</RouterLink>
                <RouterLink v-if="authStore.isLoggedIn" class="btn-edit" :to="editRoute">수정하기</RouterLink>
            </div>

            <!-- 로딩 -->
            <div v-if="loading" class="loading-wrap" aria-live="polite">
                <span class="spinner" aria-label="로딩 중"></span>
            </div>

            <!-- 본문 -->
            <template v-else-if="item">
                <div class="title-bar">
                    <p v-if="item.공지유무" class="notice-badge">공지</p>
                    <h1>{{ item.제목 }}</h1>
                    <div class="post-meta">
                        <span v-if="item.난이도">난이도: {{ item.난이도 }}</span>
                        <span>{{ item.작성시간 }}</span>
                    </div>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="contents-bar" v-html="item.내용"></div>
            </template>

            <!-- 에러 -->
            <p v-else class="error-msg" role="alert">{{ errorMessage || '게시물을 불러올 수 없습니다.' }}</p>
        </article>
    </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'
import { injectBaseUrl } from '@/utils/injectBaseUrl'

export default {
    name: 'BoardReadView',

    components: { RouterLink },

    props: {
        segment1: { type: String, required: true },
        segment2: { type: String, default: null },
    },

    data() {
        return {
            boardStore:   useBoardStore(),
            authStore:    useAuthStore(),
            item:         null,
            loading:      true,
            errorMessage: '',
        }
    },

    computed: {
        no() {
            return this.$route.query.no
        },
        indexRoute() {
            return this.segment2
                ? `/${this.segment1}/${this.segment2}`
                : `/${this.segment1}`
        },
        editRoute() {
            return this.segment2
                ? `/update/${this.segment1}/${this.segment2}?updateId=${this.no}`
                : `/update/${this.segment1}?updateId=${this.no}`
        },
    },

    created() {
        this.loadPost()
    },

    methods: {
        async loadPost() {
            this.loading      = true
            this.errorMessage = ''

            try {
                const { data } = await api.post('/api/board/read', { no: this.no })

                if (data.flag) {
                    // 2026-10-06 by codex (User: user) - 이미지 src 상대 경로에 API 베이스 URL 주입
                    // v-html 렌더링 시 도메인 없는 src는 프론트 서버 기준으로 해석되어 이미지 로드 실패
                    // 응답 수신 시점에 한 번만 치환하여 처리
                    data.items.내용 = injectBaseUrl(data.items.내용)
                    this.item = data.items
                } else {
                    this.errorMessage = data.message ?? '게시물을 불러오지 못했습니다.'
                }
            } catch {
                this.errorMessage = '게시물을 불러오는 중 오류가 발생했습니다.'
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
.board-read { display: flex; flex-direction: column; flex: 1; background: #f7f8f5; }

/* 배너 */
.board-banner { padding: 48px clamp(24px, 7.2vw, 112px) 36px; background: #1e3027; }
.board-eyebrow { margin: 0 0 8px; color: #7ca58a; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; }
.board-banner h2 { margin: 0; color: #fff; font-size: clamp(24px, 3vw, 36px); font-weight: 700; letter-spacing: -.05em; }

/* 컨테이너 */
.read-container { max-width: 860px; width: 100%; margin: 0 auto; padding: 2rem 1.5rem 5rem; overflow-x: hidden; }

/* 버튼 바 */
.btn-bar { display: flex; gap: 8px; margin-bottom: 1.75rem; }
.btn-back, .btn-edit { padding: 7px 16px; border: 1px solid #dce2db; border-radius: 4px; background: #fff; color: #435349; font-size: 12px; font-weight: 600; text-decoration: none; transition: background .15s, border-color .15s; }
.btn-back:hover { background: #edf2ed; border-color: #b0bdb2; }
.btn-edit { background: #1e3027; border-color: #1e3027; color: #fff; }
.btn-edit:hover { background: #2d4a3a; }

/* 로딩 */
.loading-wrap { display: flex; justify-content: center; padding: 5rem 0; }
.spinner { display: inline-block; width: 36px; height: 36px; border: 3px solid #d0d7d3; border-top-color: #1e3027; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 제목 바 */
.title-bar { padding-bottom: 1rem; border-bottom: 1px solid #e0e6e2; margin-bottom: 1.5rem; }
.notice-badge { display: inline-block; margin: 0 0 8px; padding: 2px 8px; border-radius: 3px; background: #1e3027; color: #fff; font-size: 10px; font-weight: 700; }
.title-bar h1 { margin: 0 0 10px; color: #1a3025; font-size: clamp(20px, 3vw, 28px); font-weight: 700; line-height: 1.4; }
.post-meta { display: flex; gap: 16px; color: #8a9a8d; font-size: 12px; }

/* 본문 */
/* 2026-10-06 by codex (User: user) - white-space: pre 인라인 스타일로 인한 모바일 텍스트 가로 잘림 방지 */
.contents-bar { line-height: 1.85; color: #2c3e30; }
.contents-bar :deep(*) { color: revert; white-space: normal !important; }
.contents-bar :deep(img) { max-width: 100%; height: auto; }
.contents-bar :deep(pre) { overflow-x: auto; white-space: pre-wrap !important; }
.contents-bar :deep(table) { border-collapse: collapse; width: 100%; }
.contents-bar :deep(td), .contents-bar :deep(th) { border: 1px solid #d0d7d3; padding: 6px 10px; }

.error-msg { padding: 4rem 0; color: #b23b37; text-align: center; font-size: 13px; }

@media (max-width: 600px) {
    .board-banner { padding: 32px 22px 24px; }
    .read-container { padding: 1.5rem 1rem 4rem; }
}
</style>
