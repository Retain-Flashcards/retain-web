<template>
    <el-main style='display: flex; align-items: center; justify-content: center; height: 100%;'>
        <AppSpinner size='large' />
    </el-main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSpinner from '../components/basic/AppSpinner.vue'
import useAuthUser from '../composables/api/UseAuthUser'
import useNotificationService from '../composables/ui/useNotificationService'

const router = useRouter()
const notificationService = useNotificationService()
const { logInWithGoogle } = useAuthUser()

onMounted(() => {
    logInWithGoogle().catch((error) => {
        notificationService.error(error.message || 'Google login failed. Please try again.')
        router.push({ name: 'Login' })
    })
})
</script>