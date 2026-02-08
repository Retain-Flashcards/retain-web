<template>
    <div :class='`cloze-button ${props.colorClass}`' @mousedown='onMousedown' @click='onClick'>
        <font-awesome-icon icon='fa-add' ></font-awesome-icon>
        Blank {{ props.n }}
    </div>
</template>

<script setup>
import useLockedSelection from '../../../composables/ui/useLockedSelection'

const props = defineProps(['n', 'colorClass'])

const emit = defineEmits(['addCloze'])

const lockedSelection = useLockedSelection()

function onMousedown(e) {
    lockedSelection.lockWindowSelection()
    e.preventDefault()
}

function onClick(e) {
    e.preventDefault()
    lockedSelection.unlockWindowSelection()
    emit("addCloze", props.n) 
}
</script>

<style>

.cloze-button {
    padding: 7px 10px;
    border-radius: 10px;
    font-size: 14px;
    transition: 0.2s;
    margin-right: 10px;
    text-wrap: nowrap;
}

.cloze-button:hover {
    cursor: pointer;
    scale: 1.04;
}

.cloze-button.clz-red {
    background-color: #ffe1e1;
    color: #ff5f5f;
}

.cloze-button.clz-orange {
    background-color: #ffefe1;
    color: #ffa555;
}

.cloze-button.clz-yellow {
    background-color: #fff6c8;
    color: #ffbf00;
}

.cloze-button.clz-green {
    background-color: #d8ffda;
    color: #1ec724;
}

.cloze-button.clz-blue {
    background-color: #e1f6ff;
    color: #00b3ff;
}

.cloze-button.clz-purple {
    background-color: #f0e1ff;
    color: #9123ff;
}

</style>