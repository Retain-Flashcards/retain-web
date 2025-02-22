<template>
    <slot></slot>
</template>

<script setup>
import { onBeforeUnmount, onMounted, provide } from 'vue'

const props = defineProps(['element'])
const element = props.element || window

const keyDownBindings = {}
const keyUpBindings = {}

function keyUpListener(e) { 
    if (keyUpBindings[e.key]) {
        for (let i = 0; i < keyUpBindings[e.key].length; i++) {
            keyUpBindings[e.key][i](e)
        }
    }
}
function keyDownListener(e) { 
    if (keyDownBindings[e.key]) {
        for (let i = 0; i < keyDownBindings[e.key].length; i++) {
            keyDownBindings[e.key][i](e) 
        }
    }
}

provide('keyUpBindings', keyUpBindings)
provide('keyDownBindings', keyDownBindings)

onMounted(() => {
    element.addEventListener('keyup', keyUpListener)
    element.addEventListener('keydown', keyDownListener)
})

onBeforeUnmount(() => {
    element.removeEventListener('keyup', keyUpListener)
    element.removeEventListener('keydown', keyDownListener)
});

</script>