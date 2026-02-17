<template>
<div class='spinner-container'>
    <div :class='`spinner ${props.size || "medium"} ${props.color || "primary"}`'></div>
</div>
</template>

<script setup>
const props = defineProps(['size', 'color'])
</script>

<style scoped>
.spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
}
.spinner {
    border: 4px solid #f3f3f300;
    border-top: 4px solid var(--el-color-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.spinner.primary {
    border-top: 4px solid var(--el-color-primary);
}

.spinner.warning {
    border-top: 4px solid var(--el-color-warning);
}

.spinner.error {
    border-top: 4px solid var(--el-color-error);
}

.spinner.success {
    border-top: 4px solid var(--el-color-success);
}

.spinner.info {
    border-top: 4px solid var(--el-color-info);
}

.spinner.light {
    border-top: 4px solid white;
}

.spinner.dark {
    border-top: 4px solid black;
}

.spinner.small {
    width: 15px;
    height: 15px;
    border-width: 2px;
}

.spinner.medium {
    width: 30px;
    height: 30px;
}

.spinner.large {
    width: 100px;
    height: 100px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(260deg); }
    100% { transform: rotate(360deg); }
}
</style>