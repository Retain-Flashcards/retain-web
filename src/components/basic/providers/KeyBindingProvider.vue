<template>
    <slot></slot>
</template>

<script setup>
import { onBeforeUnmount, onMounted, provide, getCurrentInstance, ref } from 'vue'

const keyDownBindings = {}
const keyUpBindings = {}

function keyUpListener(e) { 
    if (!e.key) return
    const keyComb = {
        mainKey: e.key.toLowerCase(),
        cmd: e.metaKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey
    }
    let keyCombStr = ''
    if (e.shiftKey) keyCombStr = 'SHIFT|' + keyCombStr
    if (e.altKey) keyCombStr = 'ALT|' + keyCombStr
    if (e.ctrlKey) keyCombStr = 'CTRL|' + keyCombStr
    if (e.metaKey) keyCombStr = 'CMD|' + keyCombStr
    keyCombStr += e.key
    if (keyUpBindings[keyCombStr]) {
        e.preventDefault()
        for (let i = 0; i < keyUpBindings[keyCombStr].length; i++) {
            keyUpBindings[keyCombStr][i](e)
        }
    }
}
function keyDownListener(e) { 
    if (!e.key) return
    const keyComb = {
        mainKey: e.key.toLowerCase(),
        cmd: e.metaKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey
    }
    let keyCombStr = ''
    if (e.shiftKey) keyCombStr = 'SHIFT|' + keyCombStr
    if (e.altKey) keyCombStr = 'ALT|' + keyCombStr
    if (e.ctrlKey) keyCombStr = 'CTRL|' + keyCombStr
    if (e.metaKey) keyCombStr = 'CMD|' + keyCombStr
    keyCombStr += e.key.toLowerCase()
    if (keyDownBindings[keyCombStr]) {
        e.preventDefault()
        for (let i = 0; i < keyDownBindings[keyCombStr].length; i++) {
            keyDownBindings[keyCombStr][i](e) 
        }
    }
}


function addKeyUpBinding(key, callback, exclusive) {
    if (!keyUpBindings[key.toLowerCase()] || exclusive) keyUpBindings[key.toLowerCase()] = []
    keyUpBindings[key.toLowerCase()].push(callback) 
}

function addKeyDownBinding(key, callback, exclusive) {
    if (!keyDownBindings[key.toLowerCase()] || exclusive) keyDownBindings[key.toLowerCase()] = []
    keyDownBindings[key.toLowerCase()].push(callback)
}

provide('addKeyUpBinding', addKeyUpBinding)
provide('addKeyDownBinding', addKeyDownBinding)

onMounted(() => {
    window.addEventListener('keyup', keyUpListener)
    window.addEventListener('keydown', keyDownListener)
})

onBeforeUnmount(() => {
    window.removeEventListener('keyup', keyUpListener)
    window.removeEventListener('keydown', keyDownListener)
});

</script>