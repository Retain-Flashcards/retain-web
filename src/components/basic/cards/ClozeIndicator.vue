<template>
    <span :class='`cloze-indicator ${props.colorClass}${props.displayOnly ? " display-only":""}`' contenteditable='false' ref='indicator'>
        <span class='cloze-indicator-control'>
            <span class='cloze-indicator-num' contenteditable="false">{{ props.n }}</span><span class='cloze-indicator-close' v-if='!props.displayOnly' contenteditable="false" @click="$emit('removeCloze', props.itemKey)">x</span>
        </span>
        <span class='cloze-indicator-text' contenteditable='plaintext-only' style='outline: none; font-weight: normal;'>
            <slot></slot>
        </span>
        <span class='cloze-indicator-hint-wrapper' contenteditable='false' v-if='props.hint || !props.displayOnly'>[<input type='text' class='cloze-indicator-hint' :readonly='props.displayOnly' placeholder='hint' :value='props.hint ?? ""'>]</span>
    </span>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['removeCloze'])
const indicator = ref(null)
const props = defineProps(['n', 'colorClass', 'hint', 'itemKey', 'displayOnly'])

onMounted(() => {
    indicator.value.setAttribute('data-itemkey', props.itemKey)
})

</script>

<style>
.cloze-indicator {
    background-color: #EEE;
    color: #AAA;
    padding: 2px 4px;
    border-radius: 5px;
    white-space: nowrap;
}

.cloze-indicator-text {
    color: black !important;
    font-weight: normal !important;
    font-style: normal !important;
    text-decoration: none !important;
    font-size: inherit !important;
    vertical-align: baseline !important;
}

.cloze-indicator.clz-red {
    background-color: #ffe1e1;
    color: #ff5f5f;
}

.cloze-indicator.clz-orange {
    background-color: #ffefe1;
    color: #ffa555;
}

.cloze-indicator.clz-yellow {
    background-color: #fff6c8;
    color: #ffbf00;
}

.cloze-indicator.clz-green {
    background-color: #d8ffda;
    color: #1ec724;
}

.cloze-indicator.clz-blue {
    background-color: #e1f6ff;
    color: #00b3ff;
}

.cloze-indicator.clz-purple {
    background-color: #f0e1ff;
    color: #9123ff;
}



.cloze-indicator-control {
    width: 12px;
    display: inline-grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    text-align: center;
    margin-right: 3px;
}

.cloze-indicator-num {
    margin-right: 5px;
    grid-area: 1 / 1;
    z-index: 1;
    user-select: none;
}
 
.cloze-indicator-close {
    display: inline-block;
    margin-right: 5px;
    opacity: 0;
    grid-area: 1 / 1;
    z-index: 2;
    user-select: none;
}

.cloze-indicator-hint {
    color: inherit;
    border: none;
    background: none;
    min-width: none;
    field-sizing: content;
    font-size: inherit;
    user-select: none;
}

.cloze-indicator:not(.display-only) .cloze-indicator-hint:hover, .cloze-indicator:not(.display-only) .cloze-indicator-hint:focus {
    color: #555;
}

.cloze-indicator-hint:focus::placeholder {
    opacity: 0;
    width: 0px;
}

.cloze-indicator-hint:hover::placeholder, .cloze-indicator-hint:focus::placeholder {
    color: inherit;
}

.cloze-indicator-hint::placeholder {
    color: inherit;
}

.cloze-indicator-hint-wrapper {
    margin-left: 7px;
    border: none;
    background: none;
    min-width: none;
    font-size: 16px;
    user-select: none;
}

.cloze-indicator-hint:focus {
    outline: none;
}

.cloze-indicator:not(.display-only) .cloze-indicator-control:hover {
    cursor: pointer;
}

.cloze-indicator:not(.display-only) .cloze-indicator-control:hover .cloze-indicator-num {
    opacity: 0;
}
.cloze-indicator-control:hover .cloze-indicator-close {
    opacity: 1;
    z-index: 4;
}
</style>