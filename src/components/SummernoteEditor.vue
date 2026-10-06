<template>
    <div id="summernote"></div>
</template>

<script>
import { useBoardStore } from '@/stores/board'
import api from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'

export default {
    name: 'SummernoteEditor',

    props: {
        updateDesc: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            boardStore: useBoardStore(),
        }
    },

    created() {
        // 새로고침 시 파일 목록 초기화
        this.boardStore.clearFiles()
    },

    mounted() {
        this.initEditor()
    },

    beforeUnmount() {
        if (window.$ && window.$('#summernote').length) {
            window.$('#summernote').summernote('destroy')
        }
    },

    methods: {
        initEditor() {
            const $this = this

            // 2026-10-06 by codex (User: user) - 스크립트 중복 로드 방지 처리
            // 수정 완료 후 재진입 시 script 태그가 이미 존재하면 onload가 발화되지 않아
            // summernote 초기화가 누락되는 문제를 방지하기 위해 로드 여부를 먼저 확인
            const jqueryLoaded     = !!window.jQuery
            const summernoteLoaded = jqueryLoaded && !!window.$.fn?.summernote

            // Summernote CSS — 중복 삽입 방지
            if (!document.querySelector('link[href*="summernote-lite.min.css"]')) {
                const summernoteCss = document.createElement('link')
                summernoteCss.href = 'https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css'
                summernoteCss.rel = 'stylesheet'
                document.head.appendChild(summernoteCss)
            }

            const initSummernote = () => {
                window.$('#summernote').summernote({
                        lang: 'ko-KR',
                        placeholder: '본문을 입력하세요',
                        tabsize: 2,
                        height: 500,
                        toolbar: [
                            ['font',     ['bold', 'underline']],
                            ['fontsize', ['fontsize']],
                            ['color',    ['color']],
                            ['para',     ['ul', 'ol', 'paragraph']],
                            ['table',    ['table']],
                            ['insert',   ['picture', 'video']],
                        ],
                        codeviewFilter:       true,
                        codeviewIframeFilter: true,
                        callbacks: {
                            onInit() {
                                // 수정 시 기존 내용 복원
                                if ($this.updateDesc !== null) {
                                    window.$('#summernote').summernote('code', $this.updateDesc)
                                }
                            },
                            async onImageUpload(files) {
                                const MAX_IMAGES = 20
                                const currentCount = (window.$('#summernote').summernote('code').match(/<img /g) || []).length

                                if (currentCount + files.length > MAX_IMAGES) {
                                    alert(`이미지는 최대 ${MAX_IMAGES}개까지 업로드할 수 있습니다.`)
                                    return
                                }

                                const formData = new FormData()
                                const fileList = $this.boardStore.getFiles

                                for (let i = 0; i < files.length; i++) {
                                    const resized = await $this.resizeImage(files[i], 1920, 1080, 0.8)
                                    formData.append('files[]', resized, resized.name)
                                }

                                try {
                                    const { data } = await api.post('/api/board/api_temp_image_upload', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    })

                                    if (data.flag) {
                                        data.items.forEach((filePath) => {
                                            fileList.push(filePath)
                                            window.$('#summernote').summernote('insertImage', filePath)
                                            // 삽입된 이미지 style 속성 제거
                                            window.$('.note-editable img').each(function () {
                                                if (this.src.indexOf(filePath) > -1) {
                                                    window.$(this).removeAttr('style')
                                                }
                                            })
                                        })
                                        $this.boardStore.setFiles(fileList)
                                    }
                                } catch {
                                    alert('이미지 업로드에 실패했습니다.')
                                }
                            },
                        },
                })
            }

            if (summernoteLoaded) {
                // jQuery·Summernote 모두 이미 로드된 경우 바로 초기화
                initSummernote()
            } else if (jqueryLoaded) {
                // jQuery는 있지만 Summernote가 없는 경우
                const summernoteScript = document.createElement('script')
                summernoteScript.src = 'https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js'
                document.head.appendChild(summernoteScript)
                summernoteScript.onload = initSummernote
            } else {
                // jQuery·Summernote 모두 없는 경우 (최초 진입)
                const jqueryScript = document.createElement('script')
                jqueryScript.src = 'https://code.jquery.com/jquery-3.4.1.min.js'
                document.head.appendChild(jqueryScript)
                jqueryScript.onload = function () {
                    const summernoteScript = document.createElement('script')
                    summernoteScript.src = 'https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js'
                    document.head.appendChild(summernoteScript)
                    summernoteScript.onload = initSummernote
                }
            }
        },

        /**
         * 이미지 리사이즈 (Canvas API 사용)
         * @param {File} file
         * @param {number} maxWidth
         * @param {number} maxHeight
         * @param {number} quality
         * @returns {Promise<File>}
         */
        resizeImage(file, maxWidth, maxHeight, quality) {
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const img = new Image()
                    img.onload = () => {
                        let { width, height } = img

                        if (width > maxWidth || height > maxHeight) {
                            const ratio = Math.min(maxWidth / width, maxHeight / height)
                            width  = Math.round(width * ratio)
                            height = Math.round(height * ratio)
                        }

                        const canvas = document.createElement('canvas')
                        canvas.width  = width
                        canvas.height = height
                        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

                        canvas.toBlob(
                            (blob) => resolve(new File([blob], file.name, { type: file.type })),
                            file.type,
                            quality,
                        )
                    }
                    img.src = e.target.result
                }
                reader.readAsDataURL(file)
            })
        },

        /** 외부에서 호출: 현재 에디터 HTML 내용 반환 */
        getCode() {
            return window.$('#summernote').summernote('code')
        },
    },
}
</script>
