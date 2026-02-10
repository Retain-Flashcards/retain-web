<template>
<SoftCard id='login-card'>
    <h2>Log In</h2>
    <SoftForm :model='formData' label-position='top'>
        <SoftFormItem label='Email'>
            <SoftInput placeholder='Email' v-model='formData.email' :disabled='loginLoadable.isLoading'/>
        </SoftFormItem>
        <SoftFormItem label='Password'>
            <SoftInput @keyup.enter='onFormSubmit' placeholder='Password' v-model='formData.password' type='password' :disabled='loginLoadable.isLoading' show-password/>
        </SoftFormItem>
        
        <SoftFormItem prop='captcha'>
            <Captcha v-model='formData.captcha' />
        </SoftFormItem>

        <SoftFormItem>
            <BrandButton type='primary' @click='onFormSubmit' :loading='loginLoadable.isLoading'>Log In</BrandButton>
        </SoftFormItem>
        <p>Don't have an account? <el-link @click='goToRegister' type='primary'>Sign up</el-link></p>
    </SoftForm>
</SoftCard>
</template>

<style scoped>
#login-card {
    text-align: center;
    padding: 10px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Captcha from '../components/Captcha.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import { SoftCard, SoftForm, SoftFormItem, SoftInput } from '../components/basic/soft-ui'
import useAuthUser from '../composables/api/UseAuthUser'
import useLoadable from '../composables/ui/useLoadable'
import useNotificationService from '../composables/ui/useNotificationService'

const router = useRouter()
const notificationService = useNotificationService()
const { loginEmailPassword, userIsLoggedIn, reloadAuth } = useAuthUser()

const formData = ref({
    email: '',
    password: '',
    captcha: ''
})

const loginLoadable = useLoadable(async () => {
    await loginEmailPassword(formData.value.email, formData.value.password, formData.value.captcha)
    router.push({ name: 'Home' })
}, { 
    onError: (e) => notificationService.error(e.message || 'Login failed. Please check your credentials.')
})

function onFormSubmit() {
    loginLoadable.load()
}

function goToRegister() {
    router.push({ name: 'Register' })
}

onMounted(() => {
    reloadAuth()
    if (userIsLoggedIn()) {
        router.replace({ name: 'Home' })
    }
})
</script>