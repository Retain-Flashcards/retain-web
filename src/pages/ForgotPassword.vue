<template>
    <SoftCard id='forgot-card'>
        <div v-if="!emailSent">
            <h2>Forgot Password</h2>
            <p style='margin-top: 10px; margin-bottom: 20px;'>Enter your email address and we'll send you a link to reset your password.</p>
            <SoftForm :model='formData' label-position='top' :rules="rules" ref='theFormRef' :submission-loadable='resetLoadable'>
                <SoftFormItem label='Email' prop='email'>
                    <SoftInput @keyup.enter='onFormSubmit' placeholder='Email' v-model='formData.email' :disabled='resetLoadable.isLoading' size='large'/>
                </SoftFormItem>
                <SoftFormItem prop='captcha'>
                    <Captcha v-model='formData.captcha' />
                </SoftFormItem>
                <SoftFormItem>
                    <BrandButton style='width: 100%;' type='primary' @click='onFormSubmit' :loading='resetLoadable.isLoading'>Send Reset Link</BrandButton>
                </SoftFormItem>
                <p><el-link @click='goToLogin' type='primary'>Back to Log In</el-link></p>
            </SoftForm>
        </div>
        <div v-else class="success-message">
            <font-awesome-icon icon="fa-solid fa-circle-check" class="success-icon" />
            <h3 style="margin-top: 15px;">Email Sent!</h3>
            <p style="margin-top: 10px; margin-bottom: 20px;">
                If an account exists for <b>{{ formData.email }}</b>, you will receive a password reset link shortly.
            </p>
            <div style='display: flex; align-items: center; justify-content: center;'>
                <BrandButton type="primary" @click="resendEmail" :loading="resendLoadable.isLoading" style="margin-bottom: 15px;">
                    Send link again
                </BrandButton>
            </div>
            <p><el-link @click='goToLogin' type='primary'>Return to Log In</el-link></p>
        </div>
    </SoftCard>
</template>

<style scoped>
#forgot-card {
    text-align: center;
    padding: 10px;
}

.success-message {
    padding: 20px 10px;
}

.success-icon {
    font-size: 48px;
    color: var(--el-color-success);
}
</style>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Captcha from '../components/Captcha.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import { SoftCard, SoftForm, SoftFormItem, SoftInput } from '../components/basic/soft-ui'
import useAuthUser from '../composables/api/UseAuthUser'
import useLoadable from '../composables/ui/useLoadable'
import useNotificationService from '../composables/ui/useNotificationService'

const router = useRouter()
const notificationService = useNotificationService()
const { resetPasswordForEmail } = useAuthUser()

const theFormRef = ref(null)
const emailSent = ref(false)

const formData = reactive({
    email: '',
    captcha: ''
})

const rules = reactive({
    email: [{ required: true, message: 'Please enter your email', trigger: 'blur' }]
})

const resetLoadable = useLoadable(async () => {
    await resetPasswordForEmail(formData.email, formData.captcha)
    emailSent.value = true
}, { 
    onError: (e) => notificationService.error(e.message || 'Failed to send reset link.')
})

function onFormSubmit() {
    theFormRef.value.validate((valid) => {
        if (valid) {
            resetLoadable.load()
        }
    })
}

const resendLoadable = useLoadable(async () => {
    await resetPasswordForEmail(formData.email, formData.captcha)
    notificationService.success('Reset link sent again.')
}, {
    onError: (e) => notificationService.error(e.message || 'Failed to resend link.')
})

function resendEmail() {
    resendLoadable.load()
}

function goToLogin() {
    router.push({ name: 'Login' })
}
</script>
