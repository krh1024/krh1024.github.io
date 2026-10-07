<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="Kim Dochi Blog 홈">
        <span class="brand-mark">Kim</span>
        <span class="brand-accent">dochi</span>
      </RouterLink>

      <nav class="main-nav" aria-label="메인 메뉴">
        <ul class="nav-list">
          <li
            v-for="item in menuItems"
            :key="item.to"
            class="nav-item"
          >
            <RouterLink v-if="!item.submenu || item.submenu.length === 0" :to="item.to">
              {{ item.label }}
            </RouterLink>
            <span v-else class="nav-parent">{{ item.label }}</span>

            <ul v-if="item.submenu && item.submenu.length > 0" class="submenu">
              <li v-for="sub in item.submenu" :key="sub.to">
                <RouterLink :to="sub.to">{{ sub.label }}</RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- <RouterLink class="login-link" to="/login">
        로그인 <span aria-hidden="true">↗</span>
      </RouterLink> -->
    </header>

    <main v-if="isHome" class="home-main" :style="{ '--hero-color': colors[colorIndex] }">
      <div class="hero-grid" aria-hidden="true"></div>
      <section class="hero-content">
        <p class="eyebrow"><span class="live-dot"></span> NOTES ON BUILDING FOR THE WEB</p>
        <h1>배우고 만들며,<br /><span>기록합니다.</span></h1>
        <p class="hero-copy">
          개발하며 마주친 문제와 해결 과정을 차곡차곡 담는 공간입니다.<br class="desktop-break" />
          작은 기록이 다음 한 걸음을 더 쉽게 만들어 주니까요.
        </p>
        <div class="hero-actions">
          <RouterLink v-if="firstMenuPath" class="primary-button" :to="firstMenuPath">
            글 둘러보기 <span aria-hidden="true">→</span>
          </RouterLink>
          <span class="hero-caption">기록은 계속 업데이트됩니다</span>
        </div>
      </section>

      <div class="hero-note note-top" aria-hidden="true">
        <span class="note-symbol">{ }</span>
        <span>Ideas into<br />interfaces</span>
      </div>
      <div class="hero-note note-bottom" aria-hidden="true">
        <span class="note-line"></span>
        <span>EST. WITH Codex</span>
      </div>
    </main>

    <main v-else class="route-content">
      <RouterView />
    </main>

    <footer class="site-footer">
      <span>© {{ currentYear }} Kim Dochi BLOG</span>
      <span>생각을 코드로, 경험을 기록으로.<br>with AWS AI Kiro</span>
      <a href="mailto:dochis1024@gmail.com">CONTACT <span aria-hidden="true">↗</span></a>
    </footer>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import api from '@/composables/useApi'

// API 응답 전까지 노출할 기본 메뉴
const FALLBACK_MENUS = [
    { label: '서버 사이드', to: '/serverside', submenu: [] },
    { label: '클라이언트 사이드', to: '/clientside', submenu: [] },
    { label: '일상', to: '/tt', submenu: [] },
]

export default {
    name: 'App',

    components: { RouterLink, RouterView },

    data() {
        return {
            menuItems:  [...FALLBACK_MENUS],
            colorIndex: 0,
            colorTimer: null,
            currentYear: new Date().getFullYear(),
            colors: ['#d7f2e9', '#e8e2fb', '#fae7dc', '#dfeaf8', '#f4efcf'],
        }
    },

    computed: {
        isHome() {
            return this.$route.name === 'home'
        },
        // 홈 "글 둘러보기" 버튼이 링크할 첫 번째 메뉴 경로
        firstMenuPath() {
            return this.menuItems[0]?.to ?? null
        },
    },

    mounted() {
        this.colorTimer = window.setInterval(() => {
            this.colorIndex = (this.colorIndex + 1) % this.colors.length
        }, 10000)

        this.loadMenus()
    },

    beforeUnmount() {
        window.clearInterval(this.colorTimer)
    },

    methods: {
        async loadMenus() {
            try {
                const { data } = await api.get('/api/get/menu')
                if (data.flag && Array.isArray(data.items) && data.items.length > 0) {
                    // depth=1인 최상위 메뉴와 서브메뉴 배열을 함께 보존
                    this.menuItems = data.items
                        .filter((m) => m.menuLevel === 1)
                        .map((m) => ({
                            label:   m.menuName,
                            to:      `/${m.menuEngName}`,
                            submenu: Array.isArray(m.submenu)
                                ? m.submenu.map((s) => ({
                                      label: s.menuName,
                                      to:    `/${m.menuEngName}/${s.menuEngName}`,
                                  }))
                                : [],
                        }))
                }
                // 응답이 비었거나 flag=false 면 FALLBACK_MENUS 유지
            } catch {
                // 네트워크 오류 등 — FALLBACK_MENUS 유지
            }
        },
    },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');

:root {
  font-family: 'Manrope', 'Noto Sans KR', sans-serif;
  color: #17251f;
  background: #f7f8f5;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
}

* { box-sizing: border-box; }
body { min-width: 320px; min-height: 100vh; margin: 0; }
a { color: inherit; text-decoration: none; }
button, a { -webkit-tap-highlight-color: transparent; }

.site-shell { display: flex; min-height: 100vh; flex-direction: column; overflow: hidden; }
.site-header {
  position: relative;
  z-index: 2;
  display: grid;
  width: 100%;
  height: 88px;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(24px, 7.2vw, 112px);
  border-bottom: 1px solid #e8ebe5;
  background: #f7f8f5;
}
.brand { display: inline-flex; width: fit-content; align-items: center; gap: 10px; font-size: 19px; font-weight: 800; letter-spacing: -1px; }
.brand-mark { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 10px 10px 10px 3px; background: #1c352a; color: #f2f5ec; font-size: 17px; }
.brand-accent { color: #73a787; }
.main-nav { display: flex; align-items: center; }
.nav-list { display: flex; align-items: center; gap: clamp(22px, 3.1vw, 48px); list-style: none; margin: 0; padding: 0; }
.nav-item { position: relative; }
.nav-item > a,
.nav-item > .nav-parent { color: #737c75; font-size: 12px; font-weight: 600; transition: color .2s ease; cursor: pointer; white-space: nowrap; }
.nav-item > a:hover,
.nav-item > a.router-link-active,
.nav-item:hover > .nav-parent { color: #1b352a; }

/* 서브메뉴 — 기본 숨김 */
.submenu { display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); z-index: 100; min-width: 140px; list-style: none; margin: 0; padding: 4px 0; background: #fff; border: 1px solid #e8ebe5; border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
/* 탑메뉴 hover 시 서브메뉴 표시 */
.nav-item:hover .submenu { display: block; }
.submenu li a { display: block; padding: 8px 18px; color: #5a6a5e; font-size: 12px; font-weight: 500; white-space: nowrap; transition: background .15s, color .15s; }
.submenu li a:hover { background: #eef4f0; color: #1b352a; }
.login-link { justify-self: end; padding: 11px 16px; border: 1px solid #dce2db; border-radius: 4px; font-size: 11px; font-weight: 700; transition: background .2s, border-color .2s; }
.login-link span { margin-left: 9px; color: #7ca58a; }
.login-link:hover { border-color: #1c352a; background: #1c352a; color: white; }
.home-main { position: relative; display: flex; min-height: 600px; flex: 1; align-items: center; overflow: hidden; background: var(--hero-color); transition: background-color 2s ease; }
.hero-grid { position: absolute; inset: 0 0 0 48%; opacity: .42; background-image: linear-gradient(rgba(49, 75, 59, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(49, 75, 59, .08) 1px, transparent 1px); background-size: 62px 62px; mask-image: linear-gradient(90deg, transparent, #000 26%, #000); }
.hero-content { position: relative; z-index: 1; width: min(760px, 76%); margin-left: clamp(32px, 13.5vw, 208px); padding: 90px 0 112px; }
.eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 30px; color: #52675a; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1.1px; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #5b9870; box-shadow: 0 0 0 4px rgba(91, 152, 112, .13); }
h1 { margin: 0; color: #1a3025; font-size: clamp(54px, 7.4vw, 96px); font-weight: 700; letter-spacing: -.085em; line-height: 1.13; }
h1 span { color: #568069; }
.hero-copy { margin: 27px 0 0; color: #5b6a60; font-size: 14px; font-weight: 400; line-height: 1.95; }
.hero-actions { display: flex; align-items: center; gap: 20px; margin-top: 36px; }
.primary-button { display: inline-flex; min-height: 48px; align-items: center; gap: 29px; padding: 0 19px; border-radius: 3px; background: #203c2e; color: #fff; font-size: 12px; font-weight: 700; transition: transform .2s, background .2s; }
.primary-button:hover { transform: translateY(-2px); background: #315b43; }
.primary-button span { color: #a9d0b4; font-size: 17px; }
.hero-caption { color: #748176; font-size: 10px; }
.hero-note { position: absolute; z-index: 1; display: flex; align-items: center; gap: 12px; color: #68806e; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .8px; line-height: 1.6; }
.note-top { top: 22%; right: 16%; }
.note-symbol { display: grid; width: 52px; height: 52px; place-items: center; border: 1px solid rgba(74, 109, 83, .33); border-radius: 50%; color: #477158; font-family: 'DM Mono', monospace; font-size: 17px; }
.note-bottom { right: 11%; bottom: 20%; gap: 10px; }
.note-line { width: 42px; height: 1px; background: #89a28d; }
.hero-index { position: absolute; right: clamp(24px, 7.2vw, 112px); bottom: 34px; color: #829287; font-family: 'DM Mono', monospace; font-size: 10px; }
.hero-index span { color: #345641; }
.route-content { display: flex; width: 100%; flex: 1; }
.site-footer { display: flex; min-height: 72px; align-items: center; justify-content: space-between; gap: 20px; padding: 0 clamp(24px, 7.2vw, 112px); background: #1e3027; color: #a9b7ac; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .7px; }
.site-footer a { color: #d3e2d5; }
.site-footer a span { margin-left: 5px; color: #8ebe99; }

@media (max-width: 720px) {
  .site-header { height: auto; min-height: 76px; grid-template-columns: 1fr auto; padding: 14px 22px; }
  .main-nav { grid-column: 1 / -1; grid-row: 2; justify-content: space-between; gap: 12px; padding: 13px 0 2px; }
  .main-nav a { font-size: 11px; }
  .login-link { grid-column: 2; grid-row: 1; }
  .home-main { min-height: 610px; align-items: flex-start; }
  .hero-grid { inset: 40% 0 0 12%; background-size: 42px 42px; }
  .hero-content { width: auto; margin: 0; padding: 100px 25px 120px; }
  .eyebrow { margin-bottom: 24px; font-size: 8px; }
  h1 { font-size: clamp(50px, 13vw, 76px); }
  .hero-copy { font-size: 12px; }
  .desktop-break { display: none; }
  .hero-actions { align-items: flex-start; flex-direction: column; gap: 13px; }
  .note-top { top: auto; right: 28px; bottom: 94px; }
  .note-symbol { width: 38px; height: 38px; font-size: 13px; }
  .note-bottom { right: auto; bottom: 31px; left: 26px; font-size: 8px; }
  .hero-index { right: 25px; bottom: 33px; }
  .site-footer { min-height: 95px; flex-wrap: wrap; justify-content: flex-start; gap: 8px 20px; padding: 20px 24px; font-size: 8px; }
  .site-footer span:nth-child(2) { width: 100%; order: 1; }
  .site-footer a { margin-left: auto; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
