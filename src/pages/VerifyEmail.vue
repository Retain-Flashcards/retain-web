<template>
    <el-row id='therow' justify='center' align='middle' style='height: 100%'>
        <el-col :span="4" />
        <el-col :span="16" class='centered-container'>
            <div v-if="verifyingToken" class="loading-state">
                <app-spinner />
                <p style="margin-top: 20px;">Verifying your email securely...</p>
            </div>
            
            <div v-else-if="tokenError" class="error-state">
                <font-awesome-icon icon="fa-solid fa-circle-xmark" class="error-icon" />
                <h3 style="margin-top: 15px;">Verification Failed</h3>
                <p id='paragraph'>This verification link is invalid or has already expired.</p>
                <div style='display: flex; align-items: center; justify-content: center;'>
                    <BrandButton type='primary' @click="router.push('/login')">Return to Login</BrandButton>
                </div>
            </div>

            <div v-else class="success-state">
                <font-awesome-icon icon='fa-circle-check' class='check-icon'></font-awesome-icon>
                <h1>Email Verified!</h1>
                <p id='paragraph'>Your email has been successfully verified.</p>
                <div style='display: flex; align-items: center; justify-content: center;'>
                    <BrandButton type='primary' @click='goToHome'>Go to Home</BrandButton>
                </div>
            </div>
        </el-col>
        <el-col :span="4"/>
    </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BrandButton from '../components/basic/BrandButton.vue'
import AppSpinner from '../components/basic/AppSpinner.vue'
import useAuthUser from '../composables/api/UseAuthUser'
import useNotificationService from '../composables/ui/useNotificationService'

const router = useRouter()
const notificationService = useNotificationService()
const { verifyOtp } = useAuthUser()

const verifyingToken = ref(true)
const tokenError = ref(false)

onMounted(async () => {
    // Expected dynamic redirect URL shape: <site_url>/verify-email?token_hash=xxxxxx&type=signup
    const urlParams = new URLSearchParams(window.location.search)
    const tokenHash = urlParams.get('token_hash')
    const type = urlParams.get('type') || 'signup'

    if (!tokenHash) {
        verifyingToken.value = false
        tokenError.value = true
        return
    }

    // Delay verification intentionally by 2 seconds to evade aggressive bot pre-fetchers
    setTimeout(async () => {
        try {
            const { error } = await verifyOtp(tokenHash, type)
            if (error) throw error
            
            verifyingToken.value = false
        } catch (e) {
            console.error('Email verification error:', e)
            notificationService.error('Invalid or expired verification link.')
            verifyingToken.value = false
            tokenError.value = true
        }
    }, 2000)
})

function goToHome() {
    router.push('/')
}
</script>

<style>
html, body, #app {
    height: 100%;
}

#paragraph {
    margin-bottom: 20px;
}

.centered-container {
    text-align: center;
}

.check-icon {
    font-size: 40px;
    color: var(--el-color-success);
}
</style>