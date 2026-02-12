<template>
    <div class='card-item' @click="emit('click', props.content)" @mouseenter='emit("startPreview", props.content)' @mouseleave='emit("endPreview")'>
        <span class='quick-add' @click.prevent='emit("addCard", props.content)'><font-awesome-icon icon='fa-add'></font-awesome-icon></span>
        <span class='card-text'>{{ props.content }}</span>
    </div>
</template>

<script setup>

const props = defineProps(['content', 'disabled'])
const emit = defineEmits(['click', 'addCard', 'startPreview', 'endPreview'])

</script>

<style scoped>

.card-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    gap: 8px;
}

.card-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.card-checkbox {
    flex-shrink: 0;
}

.card-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: #333;
    line-height: 1.4;
}

.quick-add {
    font-size: 10px;
    background-color: var(--el-color-success-light-8);
    color: var(--el-color-success);
    border-radius: 4px;
    padding: 4px;
}

.quick-add:hover {
    background-color: var(--el-color-success-light-5);
    color: var(--el-color-success);
}

</style>