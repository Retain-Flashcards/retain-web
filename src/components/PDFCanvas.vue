<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['width', 'pdf', 'page'])

const canvas = ref(null)

onMounted(async () => {

    
    ctx.fillStyle = 'red'
    ctx.fillRect(10, 10, 100, 100)
})

</script>

<style scoped>

</style>