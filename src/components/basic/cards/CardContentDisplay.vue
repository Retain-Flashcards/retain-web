<template>
<el-main v-loading='props.loading'>
    <div v-html='html'></div>
</el-main>
</template>

<script setup>
import { computed, unref } from 'vue'

const props = defineProps(['loading', 'controller'])

const html = computed(() => unref(props.controller.htmlContent))
</script>