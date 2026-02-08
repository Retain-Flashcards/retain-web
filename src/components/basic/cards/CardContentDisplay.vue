<template>
<el-main v-loading='props.loading'>
    <EditorCanvas :content='contentTree'></EditorCanvas>
</el-main>
</template>

<script setup>
import EditorCanvas from './EditorCanvas'

const props = defineProps(['loading', 'controller'])

const { contentTree } = props.controller

</script>