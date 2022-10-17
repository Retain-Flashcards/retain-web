<template>
<el-card id='login-card'>
    <h2>Log In</h2>
    <el-form :model='formData' label-position='top'>
        <el-form-item label='Email'>
            <el-input placeholder='Email' v-model='formData.email' :disabled='formLoading'/>
        </el-form-item>
        <el-form-item label='Password'>
            <el-input @keyup.enter.native='onFormSubmit' placeholder='Password' v-model='formData.password' type='password' :disabled='formLoading'/>
        </el-form-item>
        <el-form-item>
            <el-button type='primary' @click.prevent='onFormSubmit' :loading='formLoading'>Log In</el-button>
        </el-form-item>
        <p>Don't have an account? <el-link @click='goToRegister' type='primary'>Sign up</el-link></p>
    </el-form>
</el-card>
</template>

<style scoped>
#login-card {
    text-align: center;
    padding: 10px;
}

el-input {
    margin-bottom: 10px;
}
</style>

<script>
import useAuthUser from '../composables/UseAuthUser'
const { loginEmailPassword } = useAuthUser()

export default {
    data() {
        return {
            formData: {
                email: '',
                password: ''
            },
            formLoading: false
        }
    },

    methods: {
        onFormSubmit() {

            this.formLoading = true

            loginEmailPassword(this.formData.email, this.formData.password).then((res) => {
                this.$router.push({ name: 'Home' })

            }).catch(console.error).finally(() => this.formLoading = false)

        },
        goToRegister() {
            this.$router.push({
                name: 'Register'
            })
        }
    }
}

</script>