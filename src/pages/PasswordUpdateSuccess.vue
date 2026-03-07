<template>
    <SoftCard id='success-card'>
        <div class='centered-container'>
            <h2 style="margin-bottom: 15px;">Your Password has been Updated!</h2>
            <BrandButton type='primary' @click='goToHome'>Go to Home</BrandButton>
        </div>
    </SoftCard>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BrandButton from '../components/basic/BrandButton.vue'
import { SoftCard } from '../components/basic/soft-ui'

const router = useRouter()

function goToHome() {
    router.push('/')
}
</script>

<style scoped>
#success-card {
    text-align: center;
    padding: 20px 10px;
}

.centered-container {
    text-align: center;
}
</style>