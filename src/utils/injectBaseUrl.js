/**
 * img 태그의 src 속성 중 도메인(http:// / https://)이 없는 경우
 * VITE_API_BASE_URL 을 앞에 붙여 반환한다.
 *
 * @param {string} html - 원본 HTML 문자열
 * @returns {string}    - src 가 보정된 HTML 문자열
 */
export function injectBaseUrl(html) {
    if (!html) return html ?? ''
    const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
    return html.replace(
        /<img([^>]*?)\ssrc="(?!https?:\/\/)([^"]+)"/gi,
        (_, attrs, path) =>
            `<img${attrs} src="${baseUrl}${path.startsWith('/') ? '' : '/'}${path}"`,
    )
}
