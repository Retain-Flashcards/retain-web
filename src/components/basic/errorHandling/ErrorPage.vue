<template>
    <el-result :title="message" subTitle="Please try again later.">
        <template #icon>
            <el-icon :size='60' color='var(--el-color-error)'><WarnTriangleFilled /></el-icon>
        </template>
        <template v-if='loadable && !disableRetry' #extra>
            <brand-button :loading='loadable.isLoading' icon='fa-refresh' type='error' @click='() => loadable.load()'>Try Again</brand-button>
        </template>
    </el-result>
</template>

<script setup>
import { inject } from 'vue'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import BrandButton from '../BrandButton.vue';
const props = defineProps(['message', 'disableRetry'])
const loadable = inject('loadable', null)
</script>

<style scoped></style>