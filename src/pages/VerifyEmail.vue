<template>
    <el-row id='therow' justify='center' align='middle' style='height: 100%'>
        <el-col :span="4" />
        <el-col :span="16" class='centered-container'>
            <h1>You've been Registered!</h1>
            <p id='paragraph'>Please verify your email to continue.</p>
            <BrandButton type='primary' @click='goToHome'>Go to Home</BrandButton>
        </el-col>
        <el-col :span="4"/>
    </el-row>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BrandButton from '../components/basic/BrandButton.vue'

const router = useRouter()

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
</style>