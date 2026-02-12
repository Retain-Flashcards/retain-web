<template>
<el-container v-loading='props.loading' class='card-editor-loading-container'>
    <div class='card-editor-container'>
        <div class='card-content-container'>
            <div ref='editorEl' :id='elId' :class='`card-editor ${props.clozeEnabled ? "cloze-enabled" : ""}`' contenteditable></div>
        </div>
        <div class='cloze-toolbar' v-if='props.clozeEnabled'>
            <cloze-button v-for="n in nextClozeN" :n="n" :color-class='clozeColorClass((Math.floor(Number(n))) % CLOZE_COLORS.length)' @add-cloze='(n) => handleAddCloze(n)'></cloze-button>
            <div class='cloze-toolbar-spacer'></div>
        </div>
    </div>
</el-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useKeyDownBinding } from '../../../composables/keybindings'
import ClozeButton from './ClozeButton.vue'
import { generate_uuid } from '../../../utils'

const props = defineProps(['loading', 'clozeEnabled', 'controller'])

//ID to identify the editor element for the controller
const elId = generate_uuid()

const editorEl = ref(null)

//Inform the controller of what the element is
props.controller.setElId(elId)

const handleAddCloze = (n) => {
    addCloze(n)
}

const { clozeColorClass, addCloze, nextClozeN, removeCloze } = props.controller

// Set up event delegation for cloze removal
onMounted(() => {
    if (editorEl.value) {
        editorEl.value.addEventListener('remove-cloze', (e) => {
            removeCloze(e.detail.key)
        })

        // Set initial content if the composable already has HTML
        if (props.controller.htmlContent.value) {
            editorEl.value.innerHTML = props.controller.htmlContent.value
        }
    }
})

//Keybindings for processing cloze
if (props.clozeEnabled) {
    useKeyDownBinding('CMD|SHIFT|c', () => {
        handleAddCloze(nextClozeN.value)
    })
    useKeyDownBinding('CTRL|SHIFT|c', () => {
        handleAddCloze(Math.max(1, nextClozeN.value - 1))
    })
}

const CLOZE_COLORS = [
    'clz-red',
    'clz-orange',
    'clz-yellow',
    'clz-green',
    'clz-blue',
    'clz-purple'
]

</script>


<style>

.card-editor-loading-container {
    height: 100%;
}

.card-editor {
    line-height: 30px;
    width: 100%;
    display: inline-block;
}

.card-editor:empty::before {
    content: 'Enter content here...';
    color: #888; 
    pointer-events: none; 
    display: block; 
}

.card-editor:focus {
    outline: none;
}

.card-editor-container {
    background-color: white;
    flex: 1;
    width: 100%;
    overflow: hidden;
    position: relative;
    border-radius: 18px;
}

.card-content-container {
    overflow-y: auto;
    position: absolute;
    left: 20px; 
    right: 0px;
    top: 20px;
    bottom: 20px;
    padding-right: 20px;
}

.card-editor-container:has(.cloze-toolbar) .card-content-container {
    bottom: 55px;
}

.cloze-toolbar {
    position: absolute;
    bottom: 0px;
    width: 100%;
    left: 0px;
    padding: 10px;
    box-sizing: border-box;
    overflow-x: auto;
    display: flex;
    z-index: 4;
    background-color: white;
    border-top: solid 2px #eee;
}

.cloze-toolbar-spacer {
    width: 50px;
    flex-shrink: 0;
}

.card-editor img {
    max-width: 50%;
    border: solid 1px #505050;
}
</style>