<template>
    <div class='pdf-note-item' @click='selectPDF'>
        <font-awesome-icon icon='fa-regular fa-file' class='pdf-note-icon'/>
        <span class='pdf-note-title'>{{ title }}</span>
        <span class='pdf-note-date'>{{ new Date(date).toLocaleString() }}</span>
        <span class='flex-spacer'></span>
        <soft-popover v-if='!loading' placement="bottom-start" @select="handleSelect" >
            <template #trigger>
                <font-awesome-icon icon='fa-ellipsis-v' class='pdf-note-menu'/>
            </template>

            <!--<soft-popover-item value="Edit" icon='fa-pencil'>Edit</soft-popover-item>-->
            <soft-popover-item value="Delete" icon='fa-regular fa-trash-can' type="danger">Delete</soft-popover-item>
        </soft-popover>
        <app-spinner v-else='loading' size='small'/>
    </div>
</template>

<script setup>
import { ref } from 'vue'

import SoftPopoverItem from './basic/soft-ui/SoftPopoverItem.vue'
import SoftPopover from './basic/soft-ui/SoftPopover.vue'
import AppSpinner from './basic/AppSpinner.vue'


const props = defineProps(['id', 'title', 'date', 'loading'])
const emit = defineEmits(['delete', 'edit', 'select'])

const selectedItem = ref(undefined)

function handleSelect(item) {
    if (item == 'Edit') {
        emit('edit', props.id)
    } else if (item == 'Delete') {
        emit('delete', props.id)
    }
}

function selectPDF() {
    emit('select', props.id)
}
</script>

<style scoped>
.pdf-note-item {
    display: flex;
    align-items: center;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 10px;
    transition: background-color 0.2s ease;
}

.pdf-note-item:hover {
    background-color: #00000010;
    cursor: pointer;
}

.pdf-note-icon {
    margin-right: 10px;
}

.pdf-note-title {
    font-size: 16px;
    font-weight: 400;
}
.pdf-note-date {
    font-size: 14px;
    font-weight: 400;
    color: #838383;
    margin-left: 10px;
}
.flex-spacer {
    flex: 1;
}

.pdf-note-menu {
    margin-right: 10px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.pdf-note-menu:hover {
    transform: scale(1.1);
}
</style>
