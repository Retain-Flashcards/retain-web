<template>
    <el-card id='register-card'>
        <h2>Sign Up</h2>
        <el-form :model='formData' label-position='top' :rules="rules" ref='theForm'>
            <el-form-item label='Email' prop='email'>
                <el-input placeholder='Email' v-model='formData.email' :disabled='formLoading'/>
            </el-form-item>
            <el-form-item label='Password' prop='password'>
                <el-input placeholder='Password' v-model='formData.password' type='password' :disabled='formLoading'/>
            </el-form-item>
            <el-form-item label='Confirm Password' prop='confirmPassword'>
                <el-input placeholder='Confirm Password' v-model='formData.confirmPassword' type='password' :disabled='formLoading'/>
            </el-form-item>
            <el-form-item>
                <el-button type='primary' @click.prevent='onFormSubmit' :loading='formLoading'>Sign Up</el-button>
            </el-form-item>
            <p>Already have an account? <el-link @click='goToLogin' type='primary'>Log In</el-link></p>
        </el-form>
    </el-card>
    </template>
    
    <style scoped>
    #register-card {
        text-align: center;
        padding: 10px;
    }
    
    el-input {
        margin-bottom: 10px;
    }
    </style>
    
    <script>
    import useAuthUser from '../composables/UseAuthUser'
    const { registerUser } = useAuthUser()
    
    export default {
        data() {
            return {
                formData: {
                    email: '',
                    password: '',
                    confirmPassword: ''
                },
                formLoading: false,
                rules: {
                    email: [ { required: true, message: 'Please enter an email', trigger: 'blur' } ],
                    password: [ { required: true, message: 'Please enter a password', trigger: 'blur' } ],
                    confirmPassword: [
                        { required: true, message: 'Please enter a password confirmation', trigger: 'blur' },
                        { validator: (rule, value, callback) => { if (value != this.formData.password) { callback(new Error('Password doesn\'t match confirmation')) } else { callback() } }, trigger: 'blur'}
                    ]
                }
            }
        },
    
        methods: {
            onFormSubmit() {
                this.$refs['theForm'].validate(valid => {

                    if (valid) {
                        this.formLoading = true

                        registerUser(this.formData.email, this.formData.password).then(() => {

                            this.$router.push('/verify')

                        }).catch(this.$Notification.error({
                            title: 'Error',
                            text: 'Something went wrong. Please try again.'
                        }) ).finally(() => this.formLoading = false)

                    }
                    else {
                        return false
                    }

                })
    
                
    
            },
            goToLogin() {
                this.$router.push({
                    name: 'Login'
                })
            }
        }
    }
    
    </script>