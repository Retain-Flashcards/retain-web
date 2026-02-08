<template>
    <div class='card-container'>
        <el-checkbox v-model='selected' size='large' class='card-selected' :disabled='props.disabled'></el-checkbox>
        <div class='card-content' @input="emit('update:modelValue', { ...props.modelValue, frontContent: $event.target.innerText })" contenteditable>
            {{ props.modelValue.frontContent }}
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps(['modelValue', 'disabled'])
const emit = defineEmits(['update:modelValue'])

const selected = ref(props.modelValue.selected)

watch(() => selected.value, (newVal) => {
    emit('update:modelValue', { ...props.modelValue, selected: newVal })
})


watch(() => props.modelValue, (newVal) => {
    //console.log('CardMessage', newVal)
})

</script>

<style scoped>

.card-container {
    border: 2px solid #f5f5f5;
    border-radius: 10px;
    padding: 10px;
    line-height: 25px;
    display: flex;
    align-items: center;
}

.card-container:focus {
    outline: none;
}

.el-checkbox.card-selected {
    margin-right: 10px;
}

[contenteditable]:focus {
    outline: 0px solid transparent;
}

textarea {
    border: none;
    resize: none;
    font-size: 16px;
    padding: 10px;
    line-height: 25px;
    field-sizing: content;
}

textarea:focus {
    outline: none;
}
</style>