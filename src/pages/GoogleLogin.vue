<template>
    <el-main v-loading='true'>

    </el-main>
</template>

<script>
    import useAuthUser from '../composables/api/UseAuthUser'
    const { logInWithGoogle } = useAuthUser()

    export default {
        setup() {
            window.onload = () => {
                logInWithGoogle().catch(error => {

                })
            }
        }
    }

    
</script>