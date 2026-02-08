<template>
<el-container v-loading='props.loading'>
    <div class='card-editor-container'>
        <div class='card-content-container'>
            <div ref='divEl' :id='elId' :class='`card-editor ${props.clozeEnabled ? "cloze-enabled" : ""}`' contenteditable :key='renderKey' v-memo='[renderKey, contentTree]'>
                <EditorCanvas :content='contentTree'></EditorCanvas>
            </div>
        </div>
        <div class='cloze-toolbar' v-if='props.clozeEnabled'>
            <cloze-button v-for="n in nextClozeN" :n="n" :color-class='clozeColorClass((Math.floor(Number(n))) % CLOZE_COLORS.length)' @add-cloze='(n) => handleAddCloze(n)'></cloze-button>
            <div class='cloze-toolbar-spacer'></div>
        </div>
    </div>
</el-container>
</template>

<script setup>
import { useKeyDownBinding } from '../../../composables/keybindings'
import ClozeButton from './ClozeButton.vue'
import EditorCanvas from './EditorCanvas'
import { generate_uuid } from '../../../utils'

const props = defineProps(['loading', 'clozeEnabled', 'controller'])

//ID to identify the editor element for the controller
const elId = generate_uuid()

//Inform the controller of what the element is
props.controller.setElId(elId)

const handleAddCloze = (n) => {
    addCloze(n)
}

const { clozeColorClass, contentTree, addCloze, nextClozeN, renderKey } = props.controller

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
    /*padding: 20px;*/
    height: 400px;
    width: 100%;
    overflow: hidden;
    position: relative;
}

.card-content-container {
    overflow-y: auto;
    position: absolute;
    left: 20px; 
    right: 0px;
    top: 20px;
    bottom: 20px;
    padding-right: 20px;
    max-height: 100%;
}

.cloze-toolbar {
    position: absolute;
    bottom: 0px;
    width: 100%;
    max-width: 100%;
    left: 0px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
    padding-top: 10px;
    box-sizing: border-box;
    overflow-x: auto;
    display: flex;
    z-index: 4;
    background-color: white;
    border-top: solid 2px #eee;
}

.cloze-toolbar-spacer {
    width: 50px;
}

.card-editor img {
    width: 100%;
    border: solid 1px #eee;
}
</style>