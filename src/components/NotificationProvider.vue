<template>
    <slot></slot>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import useNotificationService from '../composables/ui/useNotificationService'
import { ElMessage } from 'element-plus'

const { registerListener } = useNotificationService()

const handleNotification = (notification) => {
    ElMessage({
        message: notification.message,
        type: notification.type
    })
}

onMounted(() => {
    registerListener(handleNotification)
})

</script>