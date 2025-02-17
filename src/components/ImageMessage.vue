<template>
    <Message side='right' label='Note Image' type='normal'>
        <img :src='props.imageUrl' style='max-width: 100%; max-height: 200px;' />
    </Message>
</template>

<script setup>
import Message from './Message.vue'
const props = defineProps(['imageUrl'])
</script>

<style scoped>

</style>