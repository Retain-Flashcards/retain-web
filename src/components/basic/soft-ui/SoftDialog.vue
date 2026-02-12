<template>
    <Teleport to="body">
        <Transition name="soft-dialog-fade">
            <div 
                v-if="modal.isOpen" 
                class="soft-dialog-overlay"
                @click.self="handleOverlayClick"
            >
                <Transition name="soft-dialog-zoom">
                    <div 
                        v-if="modal.isOpen"
                        :class="['soft-dialog', { 'soft-dialog--fullscreen': fullscreen }, sizeClass]"
                        :style="customStyle"
                    >
                        <!-- Header -->
                        <div class="soft-dialog__header" v-if="!hideHeader">
                            <slot name="header">
                                <span class="soft-dialog__title">{{ title }}</span>
                            </slot>
                            <button 
                                v-if="showClose" 
                                class="soft-dialog__close" 
                                @click="handleClose"
                                type="button"
                                aria-label="Close dialog"
                            >
                                <font-awesome-icon icon="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="soft-dialog__body">
                            <slot :state='modal.state'></slot>
                        </div>

                        <!-- Footer -->
                        <div class="soft-dialog__footer" v-if="$slots.footer">
                            <slot name="footer"></slot>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import Modal from '../Modal.vue'

const props = defineProps({
    modal: {
        type: Object,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'default', // 'small', 'default', 'large'
        validator: (val) => ['small', 'default', 'large'].includes(val)
    },
    fullscreen: {
        type: Boolean,
        default: false
    },
    showClose: {
        type: Boolean,
        default: true
    },
    closeOnClickModal: {
        type: Boolean,
        default: true
    },
    closeOnPressEscape: {
        type: Boolean,
        default: true
    },
    lockScroll: {
        type: Boolean,
        default: true
    },
    hideHeader: {
        type: Boolean,
        default: false
    },
    beforeClose: {
        type: Function,
        default: null
    }
})

const emit = defineEmits(['open', 'opened', 'close', 'closed'])

const sizeClass = computed(() => {
    if (props.fullscreen) return ''
    return `soft-dialog--${props.size}`
})

const customStyle = computed(() => {
    if (props.width) {
        return { width: props.width }
    }
    return {}
})

function handleClose() {
    if (props.beforeClose) {
        props.beforeClose(() => {
            closeDialog()
        })
    } else {
        closeDialog()
    }
}

function closeDialog() {
    props.modal.close()
    emit('close')
}

function handleOverlayClick() {
    if (props.closeOnClickModal) {
        handleClose()
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape' && props.closeOnPressEscape && props.modelValue) {
        handleClose()
    }
}

// Handle body scroll lock
watch(() => props.modelValue, (newValue) => {
    if (props.lockScroll) {
        if (newValue) {
            document.body.style.overflow = 'hidden'
            emit('open')
        } else {
            document.body.style.overflow = ''
            emit('closed')
        }
    }
})

onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
    document.body.style.overflow = ''
})
</script>

<style scoped>
.soft-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    box-sizing: border-box;
}

.soft-dialog {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 8px 16px rgba(0, 0, 0, 0.1);
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Size variants */
.soft-dialog--small {
    width: 380px;
    max-width: 90vw;
}

.soft-dialog--default {
    width: 520px;
    max-width: 90vw;
}

.soft-dialog--large {
    width: 720px;
    max-width: 90vw;
}

.soft-dialog--fullscreen {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
}

.soft-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    flex-shrink: 0;
}

.soft-dialog__title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    line-height: 1.4;
}

.soft-dialog__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background-color: #f4f6f8;
    border-radius: 36px;
    cursor: pointer;
    color: #909399;
    font-size: 16px;
    transition: all 0.2s ease;
    margin-left: 16px;
    flex-shrink: 0;
}

.soft-dialog__close:hover {
    background-color: #ced0d4;
    color: #606266;
}

.soft-dialog__close:active {
    transform: scale(0.95);
}

.soft-dialog__body {
    padding: 8px 24px 24px;
    flex: 1;
    overflow-y: auto;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
}

.soft-dialog__footer {
    padding: 16px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
    border-top: 1px solid #f0f2f5;
}

/* Overlay fade animation */
.soft-dialog-fade-enter-active,
.soft-dialog-fade-leave-active {
    transition: opacity 0.25s ease;
}

.soft-dialog-fade-enter-from,
.soft-dialog-fade-leave-to {
    opacity: 0;
}

/* Dialog zoom animation */
.soft-dialog-zoom-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.soft-dialog-zoom-leave-active {
    transition: all 0.2s ease-in;
}

.soft-dialog-zoom-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

.soft-dialog-zoom-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
    .soft-dialog-overlay {
        padding: 10px;
    }
    
    .soft-dialog--small,
    .soft-dialog--default,
    .soft-dialog--large {
        width: 100%;
        max-width: 100%;
        border-radius: 10px;
    }
    
    .soft-dialog__header {
        padding: 16px 18px 12px;
    }
    
    .soft-dialog__title {
        font-size: 18px;
    }
    
    .soft-dialog__body {
        padding: 8px 18px 18px;
    }
    
    .soft-dialog__footer {
        padding: 12px 18px 18px;
    }
}
</style>
