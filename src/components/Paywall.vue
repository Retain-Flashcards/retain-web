<template>
    <div ref='paywallRef'/>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useRevenueCat from '../composables/api/useRevenueCat'

const { presentPaywall } = useRevenueCat()

const emit = defineEmits(['dismiss', 'success'])

const paywallRef = ref(null)

onMounted(() => {
    presentPaywall(paywallRef.value).then((result) => {
        if (result) {
            emit('success')
        } else {
            emit('dismiss')
        }
    })
})

</script>

<style scoped>

</style>