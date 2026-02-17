<template>
    <div @click.stop="handleClick" :class="`soft-popover-item ${type}`" >
        <slot name="icon">
            <font-awesome-icon :icon="icon" />
        </slot>
        <slot name="label">
            {{ label }}
        </slot>
        <slot></slot>
    </div>
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps(['label', 'value', 'icon', 'type'])

const emit = defineEmits(['select'])

const selection = inject('selection', null)

function handleClick() {
    emit('select', props.value)

    if (selection) selection.value = props.value
}
</script>

<style scoped>
.soft-popover-item {
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.soft-popover-item:hover {
    background-color: #f3f4f6;
    color: #111827;
}

.soft-popover-item.danger {
    color: var(--el-color-danger);
}

.soft-popover-item.success {
    color: var(--el-color-success);
}

.soft-popover-item.primary {
    color: var(--el-color-primary);
}
</style>
