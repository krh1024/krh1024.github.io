<template>
    <section class="board-write">
        <div class="board-banner">
            <p class="board-eyebrow">BOARD</p>
            <h2>{{ updateId ? '게시글 수정' : '게시글 작성' }}</h2>
        </div>

        <article class="write-container">
            <div class="form-wrap">
                <!-- 공지 여부 -->
                <label class="check-item">
                    <input v-model="noticeFlag" type="checkbox" :true-value="1" :false-value="0" />
                    <span>공지사항 글쓰기</span>
                </label>

                <!-- 난이도 -->
                <div class="form-row">
                    <label for="starScore">난이도</label>
                    <select id="starScore" v-model.number="starScore">
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>

                <!-- 제목 -->
                <div class="form-row">
                    <label for="write-title">제목</label>
                    <input
                        id="write-title"
                        v-model.trim="title"
                        type="text"
                        placeholder="제목을 입력하세요"
                        maxlength="255"
                    />
                    <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
                </div>

                <!-- 에디터 -->
                <div class="form-row">
                    <label>본문</label>
                    <SummernoteEditor ref="editor" :updateDesc="updateDesc" />
                    <p v-if="errors.content" class="field-error">{{ errors.content }}</p>
                </div>

                <!-- 에러 / 성공 -->
                <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

                <!-- 버튼 -->
                <div class="btn-bar">
                    <RouterLink class="btn-cancel" :to="indexRoute">취소</RouterLink>
                    <button
                        class="btn-submit"
                        :disabled="submitting"
                        @click="submit"
                    >
                        {{ submitting ? '처리 중...' : (updateId ? '수정 완료' : '등록') }}
                    </button>
                </div>
            </div>
        </article>
    </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import api from '@/composables/useApi'
import { injectBaseUrl } from '@/utils/injectBaseUrl'
import SummernoteEditor from '@/components/SummernoteEditor.vue'

export default {
    name: 'BoardWriteView',

    components: { RouterLink, SummernoteEditor },

    props: {
        segment1: { type: String, required: true },
        segment2: { type: String, default: null },
    },

    data() {
        return {
            boardStore:   useBoardStore(),
            noticeFlag:   0,
            starScore:    1,
            title:        '',
            updateDesc:   null,   // 수정 시 에디터 초기값
            errors:       {},
            errorMessage: '',
            submitting:   false,
        }
    },

    computed: {
        updateId() {
            return this.$route.query.updateId ?? null
        },
        indexRoute() {
            return this.segment2
                ? `/${this.segment1}/${this.segment2}`
                : `/${this.segment1}`
        },
    },

    async created() {
        // 수정 모드: 기존 게시물 데이터 로드
        if (this.updateId) {
            await this.loadUpdateItem()
        }
    },

    watch: {
        // 2026-10-06 by codex (User: user) - 같은 컴포넌트 재사용 시 라우트 변경 감지
        // board_write / board_update 가 동일 컴포넌트를 사용하므로
        // 경로 또는 updateId 가 바뀌어도 created()가 재실행되지 않아 폼이 초기화되지 않는 문제 방지
        async $route(to, from) {
            if (to.path !== from.path || to.query.updateId !== from.query.updateId) {
                this.resetForm()
                if (this.updateId) {
                    await this.loadUpdateItem()
                }
            }
        },
    },

    methods: {
        resetForm() {
            this.noticeFlag   = 0
            this.starScore    = 1
            this.title        = ''
            this.updateDesc   = null
            this.errors       = {}
            this.errorMessage = ''
        },

        async loadUpdateItem() {
            try {
                const { data } = await api.post('/api/board/read', { no: this.updateId })
                if (data.flag) {
                    const item       = data.items
                    this.title       = item.제목
                    this.noticeFlag  = item.공지유무
                    this.starScore   = item.난이도 ?? 1
                    // 2026-10-06 by codex (User: user) - 이미지 src 상대 경로에 API 베이스 URL 주입
                    // 에디터 내 이미지가 도메인 없는 경로로 저장된 경우 깨지는 문제 방지
                    this.updateDesc  = injectBaseUrl(item.내용)
                }
            } catch {
                this.errorMessage = '게시물 정보를 불러오지 못했습니다.'
            }
        },

        async submit() {
            this.errors       = {}
            this.errorMessage = ''

            // 클라이언트 유효성 검사
            const content = this.$refs.editor?.getCode() ?? ''
            const isEmpty = !content || content === '<br>' || content === '<p><br></p>'

            if (!this.title) {
                this.errors.title = '제목을 입력하세요.'
            }
            if (isEmpty) {
                this.errors.content = '본문을 입력하세요.'
            }
            if (Object.keys(this.errors).length > 0) return

            this.submitting = true

            try {
                const targetBoard = this.boardStore.getTargetBoard
                const sendData = {
                    noticeFlag:  this.noticeFlag,
                    starScore:   this.starScore,
                    title:       this.title,
                    content,
                    targetBoard: {
                        ...targetBoard,
                        seg1: this.segment1,
                        seg2: this.segment2 ?? null,
                    },
                    fileList: this.boardStore.getFiles,
                }

                if (this.updateId) {
                    sendData.updateId = this.updateId
                }

                const { data } = await api.post('/api/board/confirm', sendData)

                if (data.flag) {
                    this.boardStore.clearFiles()
                    await this.$router.replace(this.indexRoute)
                } else {
                    this.errorMessage = data.message ?? '저장에 실패했습니다.'
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message ?? '저장 중 오류가 발생했습니다.'
            } finally {
                this.submitting = false
            }
        },
    },
}
</script>

<style scoped>
.board-write { display: flex; flex-direction: column; flex: 1; background: #f7f8f5; }

/* 배너 */
.board-banner { padding: 48px clamp(24px, 7.2vw, 112px) 36px; background: #1e3027; }
.board-eyebrow { margin: 0 0 8px; color: #7ca58a; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.5px; }
.board-banner h2 { margin: 0; color: #fff; font-size: clamp(22px, 3vw, 30px); font-weight: 700; letter-spacing: -.05em; }

/* 컨테이너 */
.write-container { max-width: 860px; width: 100%; margin: 0 auto; padding: 2rem 1.5rem 5rem; }
.form-wrap { display: flex; flex-direction: column; gap: 20px; }

/* 공지 체크박스 */
.check-item { display: flex; align-items: center; gap: 8px; color: #435349; font-size: 13px; cursor: pointer; user-select: none; width: fit-content; }

/* 폼 행 */
.form-row { display: flex; flex-direction: column; gap: 7px; }
.form-row label { color: #1a3025; font-size: 12px; font-weight: 700; }

.form-row input[type='text'],
.form-row select { height: 44px; padding: 0 14px; border: 1px solid #dce2db; border-radius: 4px; background: #fafbf9; color: #1a3025; font: inherit; font-size: 13px; outline: none; transition: border-color .2s, box-shadow .2s; }
.form-row input:focus,
.form-row select:focus { border-color: #3a6b4a; box-shadow: 0 0 0 3px rgba(58, 107, 74, .12); }
.form-row select { width: 120px; }

.field-error { margin: 0; color: #b23b37; font-size: 11px; }

/* 버튼 바 */
.btn-bar { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #dce2db; border-radius: 4px; background: #fff; color: #5a6a5e; font-size: 13px; font-weight: 600; text-decoration: none; transition: background .15s; }
.btn-cancel:hover { background: #edf2ed; }
.btn-submit { padding: 10px 24px; border: none; border-radius: 4px; background: #1e3027; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s; }
.btn-submit:hover:not(:disabled) { background: #2d4a3a; }
.btn-submit:disabled { opacity: .6; cursor: wait; }

.form-message { color: #b23b37; font-size: 12px; line-height: 1.6; }

@media (max-width: 600px) {
    .board-banner { padding: 32px 22px 24px; }
    .write-container { padding: 1.5rem 1rem 4rem; }
}
</style>
