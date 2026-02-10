<template>
<slot></slot>
</template>

<script setup>
import { onErrorCaptured } from 'vue'

const emit = defineEmits(['errorReceived'])

onErrorCaptured((err) => {
    console.error(err)
    emit('errorReceived', err)
    return false
})
</script>
