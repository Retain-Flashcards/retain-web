<template>
    <SoftCard id='reset-card'>
        <div v-if="verifyingToken" class="loading-state">
            <app-spinner />
            <p style="margin-top: 20px;">Verifying your reset link securely...</p>
        </div>
        <div v-else-if="tokenError" class="error-message">
            <font-awesome-icon icon="fa-solid fa-circle-xmark" class="error-icon" />
            <h3 style="margin-top: 15px;">Invalid Link</h3>
            <p style="margin-top: 10px; margin-bottom: 20px;">
                This password reset link is invalid or has already expired.
            </p>
            <div style='display: flex; justify-content: center; align-items: center;'>
                <BrandButton type='primary' @click="router.push('/forgot-password')">Request New Link</BrandButton>
            </div>
        </div>
        <div v-else-if="!resetSuccessful">
            <h2>Reset Password</h2>
            <p style='margin-top: 10px; margin-bottom: 20px;'>Please enter your new password below.</p>
            <SoftForm :model='formData' label-position='top' :rules="rules" ref='theFormRef' :submission-loadable='updateLoadable'>
                <SoftFormItem label='New Password' prop='password'>
                    <SoftInput placeholder='New Password' v-model='formData.password' type='password' :disabled='updateLoadable.isLoading' size='large' show-password/>
                </SoftFormItem>
                <SoftFormItem label='Confirm Password' prop='confirmPassword'>
                    <SoftInput @keyup.enter='onFormSubmit' placeholder='Confirm Password' v-model='formData.confirmPassword' type='password' :disabled='updateLoadable.isLoading' size='large' show-password/>
                </SoftFormItem>
                <SoftFormItem>
                    <div style='display: flex; justify-content: center; align-items: center;'>
                        <BrandButton style='width: 100%;' type='primary' @click='onFormSubmit' :loading='updateLoadable.isLoading'>Update Password</BrandButton>
                    </div> 
                </SoftFormItem>
            </SoftForm>
        </div>
        <div v-else class="success-message">
            <font-awesome-icon icon="fa-solid fa-circle-check" class="success-icon" />
            <h3 style="margin-top: 15px;">Password Updated!</h3>
            <p style="margin-top: 10px; margin-bottom: 20px;">
                Your password has been changed successfully. You can now use it to log in.
            </p>
            <div style='display: flex; justify-content: center; align-items: center;'>
                <BrandButton type='primary' @click='goToLogin'>Go to Log In</BrandButton>
            </div>
        </div>
    </SoftCard>
</template>

<style scoped>
#reset-card {
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

.error-icon {
    font-size: 48px;
    color: var(--el-color-danger);
}

</style>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BrandButton from '../components/basic/BrandButton.vue'
import AppSpinner from '../components/basic/AppSpinner.vue'
import { SoftCard, SoftForm, SoftFormItem, SoftInput } from '../components/basic/soft-ui'
import useAuthUser from '../composables/api/UseAuthUser'
import useLoadable from '../composables/ui/useLoadable'
import useNotificationService from '../composables/ui/useNotificationService'
import useSupabase from '../composables/api/UseSupabase'

const router = useRouter()
const notificationService = useNotificationService()
const { setPassword, verifyOtp } = useAuthUser()
const { supabase } = useSupabase()

const theFormRef = ref(null)
const resetSuccessful = ref(false)
const verifyingToken = ref(true)
const tokenError = ref(false)
const validTokenHash = ref('')

const formData = reactive({
    password: '',
    confirmPassword: ''
})

const rules = reactive({
    password: [{ required: true, message: 'Please enter a new password', trigger: 'blur' }],
    confirmPassword: [
        { required: true, message: 'Please confirm your new password', trigger: 'blur' },
        { 
            validator: (rule, value, callback) => { 
                if (value !== formData.password) { 
                    callback(new Error("Passwords don't match")) 
                } else { 
                    callback() 
                } 
            }, 
            trigger: 'blur'
        }
    ]
})

onMounted(async () => {
    // Check for token hash in active URL params (e.g. ?token_hash=xxx&type=recovery)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenHash = urlParams.get('token_hash')
    const type = urlParams.get('type') || 'recovery'

    if (!tokenHash) {
        verifyingToken.value = false
        tokenError.value = true
        return
    }

    // Delay manually by 2 seconds to avoid aggressive email pre-fetch bots validating things prematurely
    setTimeout(async () => {
        try {
            const { error } = await verifyOtp(tokenHash, type)
            if (error) throw error
            
            validTokenHash.value = tokenHash
            verifyingToken.value = false
        } catch (e) {
            console.error('Validation error:', e)
            notificationService.error('Invalid or expired reset link. Please try sending a new one.')
            verifyingToken.value = false
            tokenError.value = true
        }
    }, 2000)
})

const updateLoadable = useLoadable(async () => {
    const { error } = await setPassword(formData.password)
    if (error) throw error
    
    // Sign out explicitly so the user goes through the fresh login flow cleanly
    await supabase.auth.signOut()
    resetSuccessful.value = true
}, { 
    onError: (e) => notificationService.error(e.message || 'Failed to update password. Your reset link may have expired.')
})

function onFormSubmit() {
    theFormRef.value.validate((valid) => {
        if (valid) {
            updateLoadable.load()
        }
    })
}

function goToLogin() {
    router.push({ name: 'Login' })
}
</script>

