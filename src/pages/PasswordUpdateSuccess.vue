<template>
    <el-row id='therow' justify='center' align='middle' style='height: 100%'>
        <el-col :span="4" />
        <el-col :span="16" class='centered-container'>
            <h1>Your Password has been Updated!</h1>
            <el-button type='primary' @click.prevent='goToHome'>Go to Home</el-button>
        </el-col>
        <el-col :span="4"/>
    </el-row>
</template>

<script>
export default {
    methods: {
        goToHome() {
            this.$router.push('/')
        }
    }
}
</script>

<style>
html, body, #app {
    height: 100%;
}

.centered-container {
    text-align: center;
}
</style>