<template>
<el-tooltip :placement=' props.subItems ? "top": "bottom"' :content='props.hintText' :disabled='!props.hintText || props.hintText.length == 0'>
    <div :class='`formatting-button${popoverOpen ? " open":""}`' @click='onClick' @mousedown='onMousedown'>
        <font-awesome-icon v-if='props.icon.startsWith("fa-")' :icon='props.icon'/>
        <div v-if='!props.icon.startsWith("fa-")' class='formatting-button-icon' v-html='props.icon'></div>
        <div v-if='popoverOpen' class='formatting-button-popover'>
            <formatting-button v-for='tool in props.subItems' :icon='tool.icon' @action='tool.action'></formatting-button>
        </div>
    </div>
</el-tooltip>
</template>

<style>
.formatting-button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
    border-radius: 5px;
    margin-right: 5px;
    position: relative;
}

.formatting-button:hover, .formatting-button.open {
    background-color: #EEE;
    cursor: pointer;
}

.formatting-button-popover {
    position: absolute;
    left: 0px;
    top: 40px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 1px 2px 5px #CCC;
    padding: 5px;
    z-index: 40;
    display: grid;
    grid-template-columns: repeat(auto-fit, 30px);
    max-width: 120px;
}
</style>

<script setup>
import FormattingButton from './FormattingButton.vue'
import { ref } from 'vue'
import useLockedSelection from '../../../composables/ui/useLockedSelection'

const props = defineProps(['hintText', 'icon', 'subItems'])
const emit = defineEmits(['action'])

const lockedSelection = useLockedSelection()


const popoverOpen = ref(false)

function onMousedown(e) {
    lockedSelection.lockWindowSelection()
    e.preventDefault()
}

function onClick(e) {
    e.preventDefault()

    if (props.subItems) {
        popoverOpen.value = !popoverOpen.value
        return
    }

    lockedSelection.unlockWindowSelection()

    emit("action", e) 
}
</script>