<template>
    <section class="login-page">
        <div class="login-decoration" aria-hidden="true">
            <span class="decoration-ring ring-one"></span>
            <span class="decoration-ring ring-two"></span>
            <span class="decoration-cross">+</span>
            <span class="decoration-caption">DOCHIS / MEMBER ACCESS</span>
        </div>

        <div class="login-panel-wrap">
            <div class="login-panel">
                <p class="login-eyebrow"><span></span> WELCOME BACK</p>
                <h1>다시 만나<br />반가워요<span>.</span></h1>
                <p class="login-intro">계정에 로그인하고 기록을 이어가세요.</p>

                <form class="login-form" @submit.prevent="submitLogin">
                    <label for="email">이메일</label>
                    <input
                        id="email"
                        v-model.trim="email"
                        type="email"
                        name="email"
                        autocomplete="username"
                        placeholder="name@example.com"
                        required
                    />

                    <div class="password-label-row">
                        <label for="password">비밀번호</label>
                        <RouterLink to="/forgot-password">비밀번호를 잊으셨나요?</RouterLink>
                    </div>
                    <div class="password-input-wrap">
                        <input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            name="password"
                            autocomplete="current-password"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                        <button
                            class="password-toggle"
                            type="button"
                            :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
                            @click="showPassword = !showPassword"
                        >
                            {{ showPassword ? '숨기기' : '표시' }}
                        </button>
                    </div>

                    <label class="remember-option">
                        <input v-model="remember" type="checkbox" />
                        <span class="custom-check" aria-hidden="true"></span>
                        <span>로그인 상태 유지</span>
                    </label>

                    <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

                    <button class="submit-button" type="submit" :disabled="loading">
                        {{ loading ? '로그인 중...' : '로그인' }}
                        <span aria-hidden="true">→</span>
                    </button>
                </form>

                <p class="signup-prompt">아직 계정이 없으신가요? <RouterLink to="/register">회원가입</RouterLink></p>
            </div>

            <p class="security-note"><span aria-hidden="true">⌁</span> 안전한 연결로 보호되는 로그인</p>
        </div>
    </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
    name: 'LoginView',

    components: { RouterLink },

    data() {
        return {
            email:        '',
            password:     '',
            remember:     true,
            showPassword: false,
            loading:      false,
            errorMessage: '',
        }
    },

    methods: {
        async submitLogin() {
            this.errorMessage = ''
            this.loading      = true

            try {
                const authStore = useAuthStore()

                await authStore.login({
                    email:    this.email,
                    password: this.password,
                    remember: this.remember,
                })

                const redirect = this.$route.query.redirect
                // 외부 URL 오픈 리다이렉트 차단: /로 시작하는 내부 경로만 허용
                const isSafe = typeof redirect === 'string' && redirect.startsWith('/')
                await this.$router.replace(isSafe ? redirect : '/')
            } catch (error) {
                const data = error.response?.data

                if (error.response?.status === 422 && data?.errors?.email) {
                    // 이메일/비밀번호 불일치 또는 Rate limit 초과
                    this.errorMessage = Array.isArray(data.errors.email)
                        ? data.errors.email[0]
                        : data.errors.email
                } else {
                    this.errorMessage = data?.message ?? '로그인 요청을 처리하지 못했습니다.'
                }
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
.login-page { position: relative; display: grid; width: 100%; min-height: 650px; flex: 1; grid-template-columns: 1fr 1fr; overflow: hidden; background: #f1f4ef; }
.login-decoration { position: relative; display: flex; min-height: 650px; align-items: center; justify-content: center; overflow: hidden; background: #dcebe0; }
.login-decoration::before { position: absolute; inset: 0; background-image: linear-gradient(rgba(36, 75, 50, .055) 1px, transparent 1px), linear-gradient(90deg, rgba(36, 75, 50, .055) 1px, transparent 1px); background-size: 48px 48px; content: ''; }
.login-decoration::after { position: absolute; width: min(32vw, 420px); aspect-ratio: 1; border: 1px solid rgba(49, 102, 68, .18); border-radius: 50%; content: ''; }
.decoration-ring { position: absolute; z-index: 1; width: min(22vw, 290px); aspect-ratio: 1; border: 1px solid rgba(49, 102, 68, .29); border-radius: 50%; }
.ring-one { transform: translate(-17%, 8%); }
.ring-two { transform: translate(17%, -8%); }
.decoration-cross { position: relative; z-index: 1; display: grid; width: 54px; height: 54px; place-items: center; border-radius: 50%; background: #254734; color: #d9eddd; font-size: 29px; font-weight: 300; }
.decoration-caption { position: absolute; bottom: 40px; left: 44px; color: #66816c; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.2px; }
.login-panel-wrap { display: flex; align-items: center; justify-content: center; padding: 64px 36px; }
.login-panel { width: min(100%, 390px); }
.login-eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 23px; color: #78907d; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; }
.login-eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #6b9e78; }
h1 { margin: 0; color: #20392c; font-size: clamp(40px, 4vw, 51px); font-weight: 700; letter-spacing: -.075em; line-height: 1.2; }
h1 span { color: #6b9b78; }
.login-intro { margin: 14px 0 34px; color: #7b857d; font-size: 12px; }
.login-form { display: flex; flex-direction: column; }
.login-form > label, .password-label-row label { margin-bottom: 9px; color: #435349; font-size: 11px; font-weight: 700; }
.login-form input[type='email'], .password-input-wrap input { width: 100%; height: 47px; padding: 0 14px; border: 1px solid #dfe5dd; border-radius: 3px; outline: none; background: #fafbf9; color: #24372b; font: inherit; font-size: 12px; transition: border-color .2s, box-shadow .2s; }
.login-form input::placeholder { color: #aab3aa; }
.login-form input:focus { border-color: #71967a; box-shadow: 0 0 0 3px rgba(113, 150, 122, .13); }
.password-label-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 21px; }
.password-label-row a, .signup-prompt a { color: #527d5d; font-size: 10px; font-weight: 700; }
.password-input-wrap { position: relative; }
.password-input-wrap input { padding-right: 60px; }
.password-toggle { position: absolute; top: 50%; right: 13px; transform: translateY(-50%); border: 0; background: none; color: #7a8b7d; cursor: pointer; font: inherit; font-size: 10px; }
.remember-option { display: flex; width: fit-content; align-items: center; gap: 9px; margin: 18px 0 0; color: #737f75; cursor: pointer; font-size: 10px; }
.remember-option input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.custom-check { display: grid; width: 15px; height: 15px; place-items: center; border: 1px solid #cbd6cc; border-radius: 3px; background: #fafbf9; }
.remember-option input:checked + .custom-check { border-color: #3e684b; background: #3e684b; }
.remember-option input:checked + .custom-check::after { width: 7px; height: 4px; transform: rotate(-45deg) translateY(-1px); border-bottom: 1.5px solid white; border-left: 1.5px solid white; content: ''; }
.remember-option input:focus-visible + .custom-check { outline: 3px solid rgba(113, 150, 122, .25); }
.form-message { margin: 16px 0 0; color: #b23b37; font-size: 11px; line-height: 1.6; }
.submit-button { display: flex; height: 49px; align-items: center; justify-content: space-between; margin-top: 23px; padding: 0 17px; border: 0; border-radius: 3px; background: #244333; color: white; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; transition: background .2s; }
.submit-button:hover:not(:disabled) { background: #345f43; }
.submit-button:disabled { cursor: wait; opacity: .65; }
.submit-button span { color: #a9d0b4; font-size: 17px; }
.signup-prompt { margin: 24px 0 0; color: #89928a; text-align: center; font-size: 10px; }
.signup-prompt a { margin-left: 4px; }
.security-note { margin: 25px 0 0; color: #a0a9a1; text-align: center; font-size: 9px; }
.security-note span { margin-right: 5px; color: #70947a; font-size: 14px; }

@media (max-width: 760px) {
    .login-page { min-height: 620px; grid-template-columns: 1fr; }
    .login-decoration { position: absolute; inset: 0 0 auto; min-height: 205px; }
    .login-decoration::after { width: 185px; }
    .decoration-ring { width: 125px; }
    .decoration-cross { width: 40px; height: 40px; font-size: 22px; }
    .decoration-caption { bottom: 15px; left: 22px; font-size: 8px; }
    .login-panel-wrap { position: relative; align-items: flex-start; padding: 145px 25px 45px; }
    .login-panel { padding: 30px 24px 26px; border: 1px solid #e8ece6; border-radius: 5px; background: #f7f8f5; box-shadow: 0 14px 45px rgba(33, 57, 41, .08); }
    .login-eyebrow { margin-bottom: 17px; }
    h1 { font-size: 42px; }
    .login-intro { margin-bottom: 27px; }
    .security-note { margin-top: 17px; }
}
</style>
