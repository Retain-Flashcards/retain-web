<template>
    <div class="soft-popover-wrapper" ref="wrapper" v-click-outside="close">
        <div @click.stop="toggle" class="soft-popover-trigger">
            <slot name="trigger"></slot>
        </div>
        <Transition name="soft-popover-fade">
            <div 
                v-if="isOpen" 
                class="soft-popover" 
                :class="[`soft-popover--${placement}`]"
                :style="customStyle"
            >
                <div class="soft-popover-content">
                    <template v-if="items && items.length">
                        <div 
                            v-for="(item, index) in items" 
                            :key="index" 
                            class="soft-popover-item"
                            @click.stop="handleItemClick(item)"
                        >
                            <slot name="item" :item="item">
                                {{ item.label || item }}
                            </slot>
                        </div>
                    </template>
                    <slot v-else></slot>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, provide, watch } from 'vue'

const props = defineProps({
    placement: {
        type: String,
        default: 'bottom-start' // bottom-start, bottom-end, bottom
    },
    items: {
        type: Array,
        default: () => []
    },
    width: {
        type: String,
        default: ''
    },
    closeOnItemClick: {
        type: Boolean,
        default: true
    },
    modelValue: {
        type: [String, Number],
        default: undefined
    }
})

const emit = defineEmits(['update:modelValue', 'select'])

const isOpen = ref(false)
const wrapper = ref(null)
const selection = ref(undefined)

provide('selection', selection)

watch(selection, () => {
    handleItemClick(selection.value)
})

const customStyle = computed(() => {
    if (props.width) {
        return { width: props.width }
    }
    return {}
})

function toggle() {
    isOpen.value = !isOpen.value
}

function close() {
    isOpen.value = false
}

function handleItemClick(item) {
    emit('select', item)
    emit('update:modelValue', item)
    if (props.closeOnItemClick) {
        close()
    }
}

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el)
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    }
}

defineExpose({
    open: () => isOpen.value = true,
    close
})
</script>

<style scoped>
.soft-popover-wrapper {
    position: relative;
    display: inline-block;
}

.soft-popover-trigger {
    cursor: pointer;
    display: inline-block;
}

.soft-popover {
    position: absolute;
    z-index: 2000;
    min-width: 150px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1), 
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0,0,0,0.05);
    margin-top: 8px;
    transform-origin: top center;
}

/* Placements */
.soft-popover--bottom-start {
    top: 100%;
    left: 0;
}

.soft-popover--bottom-end {
    top: 100%;
    right: 0;
}

.soft-popover--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
}

.soft-popover-content {
    padding: 6px;
    display: flex;
    flex-direction: column;
}

.soft-popover-item {
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #4b5563;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.soft-popover-item:hover {
    background-color: #f3f4f6;
    color: #111827;
}

/* Animations */
.soft-popover-fade-enter-active,
.soft-popover-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.soft-popover-fade-enter-from,
.soft-popover-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

.soft-popover--bottom.soft-popover-fade-enter-from,
.soft-popover--bottom.soft-popover-fade-leave-to {
    transform: translateX(-50%) translateY(-10px) scale(0.95);
}
</style>
