<template>
<div class='return-link' @click='emit("click")'>
    <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>
    <slot></slot>
</div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'

const emit = defineEmits(['click'])
</script>

<style scoped>
.return-link {
    display: flex;
    align-items: center;
    font-size: 15px;
    margin-top: 20px;
    transition: 0.2s;
}

.return-link:hover {
    cursor: pointer;
    text-decoration: underline;
}

.return-link el-icon {
    margin-right: 50px;
}
</style>
