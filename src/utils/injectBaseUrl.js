/**
 * Summernote 등에서 완전한 HTML 문서(<!DOCTYPE><html><body>...)로 저장된 경우
 * 래퍼 태그를 제거하고 <body> 안의 실제 본문만 반환한다.
 * <body>가 없으면 원본을 그대로 반환한다.
 *
 * @param {string} html
 * @returns {string}
 */
function stripHtmlDocument(html) {
    // <body ...> ~ </body> 구간만 추출
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) return bodyMatch[1]
    return html
}

/**
 * img 태그의 src 속성 중 도메인(http:// / https://)이 없는 경우
 * VITE_API_BASE_URL 을 앞에 붙여 반환한다.
 * 완전한 HTML 문서 형태인 경우 <body> 내용만 추출한 뒤 처리한다.
 *
 * @param {string} html - 원본 HTML 문자열
 * @returns {string}    - 정제된 HTML 문자열
 */
export function injectBaseUrl(html) {
    if (!html) return html ?? ''
    // 2026-10-06 by codex (User: user) - 완전한 HTML 문서로 저장된 본문에서 <body> 내용만 추출
    // v-html에 <!DOCTYPE><html><body> 포함 시 브라우저가 레이아웃을 재구성하여 텍스트가 가로로 잘리는 문제 방지
    const content = stripHtmlDocument(html)
    const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
    return content.replace(
        /<img([^>]*?)\ssrc="(?!https?:\/\/)([^"]+)"/gi,
        (_, attrs, path) =>
            `<img${attrs} src="${baseUrl}${path.startsWith('/') ? '' : '/'}${path}"`,
    )
}
