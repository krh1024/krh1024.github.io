import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
    state: () => ({
        targetBoard: null, // MenuResource 형태 + seg1, seg2
        files:       [],   // 에디터 임시 업로드 파일 경로 배열
    }),

    getters: {
        getTargetBoard: (state) => state.targetBoard,
        getFiles:       (state) => state.files,
    },

    actions: {
        setTargetBoard(v) {
            this.targetBoard = v
        },
        setFiles(v) {
            this.files = v
        },
        clearFiles() {
            this.files = []
        },
    },
})
