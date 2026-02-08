<template>
    <el-dialog
        :model-value="modal.isOpen"
        :title="title"
        @update:model-value="updateVisibility"
        @close="handleClose"
    >
        <slot :state="modal.state"></slot>
    </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    modal: {
        type: Object,
        required: true
    },
    title: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'open'])

function updateVisibility(val) {
    props.modal.isOpen = val
}

function handleClose() {
    props.modal.close()
    emit('close')
}

function handleOpen() {
    emit('open')
}

function handleBeforeClose(done) {
    if (props.beforeClose) {
        props.beforeClose(done)
    } else {
        done()
    }
}
</script>
