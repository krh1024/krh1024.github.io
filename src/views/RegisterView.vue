<template>
    <section class="register-page">
        <div class="register-decoration" aria-hidden="true">
            <span class="decoration-ring ring-one"></span>
            <span class="decoration-ring ring-two"></span>
            <span class="decoration-cross">+</span>
            <span class="decoration-caption">DOCHIS / NEW MEMBER</span>
        </div>

        <div class="register-panel-wrap">
            <div class="register-panel">
                <p class="register-eyebrow"><span></span> JOIN US</p>
                <h1>함께해서<br />반가워요<span>.</span></h1>
                <p class="register-intro">계정을 만들고 기록을 시작하세요.</p>

                <form class="register-form" @submit.prevent="submitRegister">
                    <label for="name">이름</label>
                    <input
                        id="name"
                        v-model.trim="name"
                        type="text"
                        name="name"
                        autocomplete="name"
                        placeholder="홍길동"
                        maxlength="255"
                        autofocus
                        required
                    />
                    <p v-if="errors.name" class="field-error" role="alert">{{ errors.name }}</p>

                    <label for="email">이메일</label>
                    <input
                        id="email"
                        v-model.trim="email"
                        type="email"
                        name="email"
                        autocomplete="username"
                        placeholder="name@example.com"
                        maxlength="255"
                        required
                    />
                    <p v-if="errors.email" class="field-error" role="alert">{{ errors.email }}</p>

                    <label for="password">비밀번호</label>
                    <div class="password-input-wrap">
                        <input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            name="password"
                            autocomplete="new-password"
                            placeholder="8자 이상 입력하세요"
                            minlength="8"
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
                    <p v-if="errors.password" class="field-error" role="alert">{{ errors.password }}</p>

                    <label for="password_confirmation">비밀번호 확인</label>
                    <div class="password-input-wrap">
                        <input
                            id="password_confirmation"
                            v-model="passwordConfirmation"
                            :type="showPasswordConfirm ? 'text' : 'password'"
                            name="password_confirmation"
                            autocomplete="new-password"
                            placeholder="비밀번호를 다시 입력하세요"
                            minlength="8"
                            required
                        />
                        <button
                            class="password-toggle"
                            type="button"
                            :aria-label="showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'"
                            @click="showPasswordConfirm = !showPasswordConfirm"
                        >
                            {{ showPasswordConfirm ? '숨기기' : '표시' }}
                        </button>
                    </div>
                    <p v-if="errors.password_confirmation" class="field-error" role="alert">
                        {{ errors.password_confirmation }}
                    </p>

                    <p v-if="errorMessage" class="form-message" role="alert">{{ errorMessage }}</p>

                    <button class="submit-button" type="submit" :disabled="loading">
                        {{ loading ? '처리 중...' : '회원가입' }}
                        <span aria-hidden="true">→</span>
                    </button>
                </form>

                <p class="login-prompt">이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink></p>
            </div>

            <p class="security-note"><span aria-hidden="true">⌁</span> 안전한 연결로 보호되는 가입</p>
        </div>
    </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import api from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'

export default {
    name: 'RegisterView',

    components: { RouterLink },

    data() {
        return {
            name:                '',
            email:               '',
            password:            '',
            passwordConfirmation: '',
            showPassword:        false,
            showPasswordConfirm: false,
            loading:             false,
            errorMessage:        '',
            errors:              {},
        }
    },

    methods: {
        async submitRegister() {
            this.errorMessage = ''
            this.errors       = {}

            // 클라이언트 측 비밀번호 일치 검사
            if (this.password !== this.passwordConfirmation) {
                this.errors.password_confirmation = '비밀번호가 일치하지 않습니다.'
                return
            }

            this.loading = true

            try {
                const { data } = await api.post('/api/auth/register', {
                    name:                  this.name,
                    email:                 this.email.toLowerCase(),
                    password:              this.password,
                    password_confirmation: this.passwordConfirmation,
                })

                // 가입 성공 시 반환된 토큰으로 자동 로그인 처리
                const authStore = useAuthStore()
                authStore.token = data.token
                authStore.user  = data.user
                localStorage.setItem('auth_token', data.token)

                await this.$router.replace('/')
            } catch (error) {
                const data = error.response?.data

                if (error.response?.status === 422 && data?.errors) {
                    // 필드별 에러 메시지 추출 (배열 첫 번째 항목 사용)
                    const raw = data.errors
                    this.errors = Object.fromEntries(
                        Object.entries(raw).map(([key, messages]) => [
                            key,
                            Array.isArray(messages) ? messages[0] : messages,
                        ]),
                    )
                } else {
                    this.errorMessage = data?.message ?? '회원가입 요청을 처리하지 못했습니다.'
                }
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
.register-page { position: relative; display: grid; width: 100%; min-height: 650px; flex: 1; grid-template-columns: 1fr 1fr; overflow: hidden; background: #f1f4ef; }
.register-decoration { position: relative; display: flex; min-height: 650px; align-items: center; justify-content: center; overflow: hidden; background: #dcebe0; }
.register-decoration::before { position: absolute; inset: 0; background-image: linear-gradient(rgba(36, 75, 50, .055) 1px, transparent 1px), linear-gradient(90deg, rgba(36, 75, 50, .055) 1px, transparent 1px); background-size: 48px 48px; content: ''; }
.register-decoration::after { position: absolute; width: min(32vw, 420px); aspect-ratio: 1; border: 1px solid rgba(49, 102, 68, .18); border-radius: 50%; content: ''; }
.decoration-ring { position: absolute; z-index: 1; width: min(22vw, 290px); aspect-ratio: 1; border: 1px solid rgba(49, 102, 68, .29); border-radius: 50%; }
.ring-one { transform: translate(-17%, 8%); }
.ring-two { transform: translate(17%, -8%); }
.decoration-cross { position: relative; z-index: 1; display: grid; width: 54px; height: 54px; place-items: center; border-radius: 50%; background: #254734; color: #d9eddd; font-size: 29px; font-weight: 300; }
.decoration-caption { position: absolute; bottom: 40px; left: 44px; color: #66816c; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.2px; }
.register-panel-wrap { display: flex; align-items: center; justify-content: center; padding: 64px 36px; overflow-y: auto; }
.register-panel { width: min(100%, 390px); }
.register-eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 23px; color: #78907d; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.5px; }
.register-eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #6b9e78; }
h1 { margin: 0; color: #20392c; font-size: clamp(36px, 4vw, 51px); font-weight: 700; letter-spacing: -.075em; line-height: 1.2; }
h1 span { color: #6b9b78; }
.register-intro { margin: 14px 0 28px; color: #7b857d; font-size: 12px; }
.register-form { display: flex; flex-direction: column; }
.register-form > label { margin-top: 18px; margin-bottom: 8px; color: #435349; font-size: 11px; font-weight: 700; }
.register-form > label:first-of-type { margin-top: 0; }
.register-form input[type='text'],
.register-form input[type='email'],
.password-input-wrap input { width: 100%; height: 47px; padding: 0 14px; border: 1px solid #dfe5dd; border-radius: 3px; outline: none; background: #fafbf9; color: #24372b; font: inherit; font-size: 12px; transition: border-color .2s, box-shadow .2s; }
.register-form input::placeholder { color: #aab3aa; }
.register-form input:focus { border-color: #71967a; box-shadow: 0 0 0 3px rgba(113, 150, 122, .13); }
.password-input-wrap { position: relative; }
.password-input-wrap input { padding-right: 60px; }
.password-toggle { position: absolute; top: 50%; right: 13px; transform: translateY(-50%); border: 0; background: none; color: #7a8b7d; cursor: pointer; font: inherit; font-size: 10px; }
.field-error { margin: 5px 0 0; color: #b23b37; font-size: 10px; line-height: 1.5; }
.form-message { margin: 14px 0 0; color: #b23b37; font-size: 11px; line-height: 1.6; }
.submit-button { display: flex; height: 49px; align-items: center; justify-content: space-between; margin-top: 24px; padding: 0 17px; border: 0; border-radius: 3px; background: #244333; color: white; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; transition: background .2s; }
.submit-button:hover:not(:disabled) { background: #345f43; }
.submit-button:disabled { cursor: wait; opacity: .65; }
.submit-button span { color: #a9d0b4; font-size: 17px; }
.login-prompt { margin: 24px 0 0; color: #89928a; text-align: center; font-size: 10px; }
.login-prompt a { margin-left: 4px; color: #527d5d; font-weight: 700; }
.security-note { margin: 25px 0 0; color: #a0a9a1; text-align: center; font-size: 9px; }
.security-note span { margin-right: 5px; color: #70947a; font-size: 14px; }

@media (max-width: 760px) {
    .register-page { min-height: 620px; grid-template-columns: 1fr; }
    .register-decoration { position: absolute; inset: 0 0 auto; min-height: 205px; }
    .register-decoration::after { width: 185px; }
    .decoration-ring { width: 125px; }
    .decoration-cross { width: 40px; height: 40px; font-size: 22px; }
    .decoration-caption { bottom: 15px; left: 22px; font-size: 8px; }
    .register-panel-wrap { position: relative; align-items: flex-start; padding: 145px 25px 45px; }
    .register-panel { padding: 30px 24px 26px; border: 1px solid #e8ece6; border-radius: 5px; background: #f7f8f5; box-shadow: 0 14px 45px rgba(33, 57, 41, .08); }
    .register-eyebrow { margin-bottom: 17px; }
    h1 { font-size: 38px; }
    .register-intro { margin-bottom: 22px; }
    .security-note { margin-top: 17px; }
}
</style>
