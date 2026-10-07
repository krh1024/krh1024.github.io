/**
 * Summernote 등에서 완전한 HTML 문서(<!DOCTYPE><html><body>...)로 저장된 경우
 * 래퍼 태그를 제거하고 <body> 안의 실제 본문만 반환한다.
 * <body>가 없으면 원본을 그대로 반환한다.
 *
 * @param {string} html
 * @returns {string}
 */
function stripHtmlDocument(html) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) return bodyMatch[1]
    return html
}

/**
 * img 태그의 src 속성 중 도메인(http:// / https://)이 없는 경우
 * VITE_API_BASE_URL 을 앞에 붙여 반환한다.
 * 완전한 HTML 문서 형태인 경우 <body> 내용만 추출한 뒤 처리한다.
 * style 속성 내 white-space: pre 를 제거하여 모바일 가로 넘침을 방지한다.
 *
 * @param {string} html - 원본 HTML 문자열
 * @returns {string}    - 정제된 HTML 문자열
 */
export function injectBaseUrl(html) {
    if (!html) return html ?? ''

    // 2026-10-06 by codex (User: user) - 완전한 HTML 문서 래퍼 제거
    let content = stripHtmlDocument(html)

    // 2026-10-06 by codex (User: user) - style 속성 내 white-space: pre 제거
    // Summernote 코드 블록의 인라인 white-space: pre 가 모바일에서 텍스트를 가로로 넘치게 함
    content = content.replace(/(\sstyle="[^"]*?)white-space\s*:\s*pre\s*;?\s*/gi, '$1')

    // img src 상대 경로에 API 베이스 URL 주입
    const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
    return content.replace(
        /<img([^>]*?)\ssrc="(?!https?:\/\/)([^"]+)"/gi,
        (_, attrs, path) =>
            `<img${attrs} src="${baseUrl}${path.startsWith('/') ? '' : '/'}${path}"`,
    )
}
