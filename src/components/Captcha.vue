<template>
    <div style='display: flex; justify-content: center; align-items: center; width: 100%;'>
        <div :id='containerId'></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

// Generate unique ID for this captcha instance
const containerId = ref(`turnstile-${Math.random().toString(36).substring(2, 9)}`)

onMounted(() => {
    turnstile.render(
        `#${containerId.value}`,
        {
            sitekey: import.meta.env.VITE_CAPTCHA_SITE_KEY,
            size: 'flexible',
            callback: (token) => {
                emit('update:modelValue', token)
            }
        }
    )
})
</script>