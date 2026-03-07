<template>
    <SoftCard id='register-card'>
        <h2>Sign Up</h2>
        <p style='margin-top: 10px; margin-bottom: 10px;' v-if="!registrationSuccessful">So good to see you here! Let's get started transforming your learning routine!</p>
        <SoftForm v-if="!registrationSuccessful" :model='formData' label-position='top' :rules="rules" ref='theFormRef' :submission-loadable='registerLoadable'>
            <SoftFormItem label='Email' prop='email'>
                <SoftInput placeholder='Email' v-model='formData.email' :disabled='registerLoadable.isLoading' size='large'/>
            </SoftFormItem>
            <SoftFormItem label='Password' prop='password'>
                <SoftInput placeholder='Password' v-model='formData.password' type='password' :disabled='registerLoadable.isLoading' size='large' show-password/>
            </SoftFormItem>
            <SoftFormItem label='Confirm Password' prop='confirmPassword'>
                <SoftInput placeholder='Confirm Password' v-model='formData.confirmPassword' type='password' :disabled='registerLoadable.isLoading' size='large' show-password/>
            </SoftFormItem>
            <SoftFormItem prop='agree'>
                <el-checkbox v-model='formData.agree'>I agree to the <el-link type='primary' href='https://retaincards.com/privacy-policy'>Privacy Policy</el-link> and <el-link type='primary' href='https://retaincards.com/terms-of-service'>Terms of Service</el-link>.</el-checkbox>
            </SoftFormItem>
            <SoftFormItem prop='captcha'>
                <Captcha v-model='formData.captcha' />
            </SoftFormItem>
            <SoftFormItem>
                <BrandButton style='width: 100%;' type='primary' @click='onFormSubmit' :loading='registerLoadable.isLoading'>Sign Up</BrandButton>
            </SoftFormItem>
            <p>Already have an account? <el-link @click='goToLogin' type='primary'>Log In</el-link></p>
        </SoftForm>
        <div v-else class="success-message">
            <font-awesome-icon icon="fa-solid fa-circle-check" class="success-icon" />
            <h3 style="margin-top: 15px;">Registered successfully!</h3>
            <p style="margin-top: 10px; margin-bottom: 20px;">
                You will receive an email with a link to verify your account shortly.
            </p>
            <div style='display: flex; align-items: center; justify-content: center;'>
                <BrandButton type="primary" @click="resendEmail" :loading="resendLoadable.isLoading" style="margin-bottom: 15px;">
                    Send verification email again
                </BrandButton>
            </div>
            <p><el-link @click="goToLogin" type="primary">Go to Log In</el-link></p>
        </div>
    </SoftCard>
</template>
    
<style scoped>
#register-card {
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
const { registerUser, resendVerificationEmail } = useAuthUser()

const theFormRef = ref(null)
const registrationSuccessful = ref(false)

const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
    captcha: ''
})

const rules = reactive({
    email: [{ required: true, message: 'Please enter an email', trigger: 'blur' }],
    password: [{ required: true, message: 'Please enter a password', trigger: 'blur' }],
    confirmPassword: [
        { required: true, message: 'Please enter a password confirmation', trigger: 'blur' },
        { 
            validator: (rule, value, callback) => { 
                if (value !== formData.password) { 
                    callback(new Error("Password doesn't match confirmation")) 
                } else { 
                    callback() 
                } 
            }, 
            trigger: 'blur'
        }
    ],
    agree: [
        { required: true, message: 'You must agree to the privacy policy and terms of service.', trigger: 'blur' },
        { 
            validator: (rule, value, callback) => { 
                if (!value) { 
                    callback(new Error('You must agree to the privacy policy and terms of service.')) 
                } else { 
                    callback() 
                } 
            }, 
            trigger: 'blur'
        }
    ]
})

const registerLoadable = useLoadable(async () => {
    await registerUser(formData.email, formData.password, formData.captcha)
    registrationSuccessful.value = true
}, { 
    onError: (e) => notificationService.error(e.message || 'Something went wrong. Please try again.')
})

const resendLoadable = useLoadable(async () => {
    await resendVerificationEmail(formData.email, formData.captcha)
    notificationService.success('Verification email resent successfully.')
}, {
    onError: (e) => notificationService.error(e.message || 'Failed to resend email.')
})

function resendEmail() {
    resendLoadable.load()
}

function onFormSubmit() {
    theFormRef.value.validate((valid) => {
        if (valid) {
            registerLoadable.load()
        }
    })
}

function goToLogin() {
    router.push({ name: 'Login' })
}
</script>