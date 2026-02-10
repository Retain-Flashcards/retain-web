<template>
    <div :class="['soft-textarea-wrapper', { 
        'is-disabled': disabled, 
        'is-focused': isFocused,
        [`soft-textarea--${size}`]: size
    }]">
        <textarea
            ref="textareaRef"
            class="soft-textarea__inner"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :maxlength="maxlength"
            :minlength="minlength"
            :rows="rows"
            :name="name"
            :autofocus="autofocus"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @change="handleChange"
        ></textarea>
        
        <span class="soft-textarea__count" v-if="showWordLimit && maxlength">
            {{ currentLength }} / {{ maxlength }}
        </span>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    readonly: {
        type: Boolean,
        default: false
    },
    rows: {
        type: Number,
        default: 3
    },
    size: {
        type: String,
        default: 'default', // 'small', 'default', 'large'
        validator: (val) => ['small', 'default', 'large'].includes(val)
    },
    maxlength: {
        type: [String, Number],
        default: undefined
    },
    minlength: {
        type: [String, Number],
        default: undefined
    },
    showWordLimit: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: ''
    },
    autofocus: {
        type: Boolean,
        default: false
    },
    resize: {
        type: String,
        default: 'vertical', // 'none', 'vertical', 'horizontal', 'both'
        validator: (val) => ['none', 'vertical', 'horizontal', 'both'].includes(val)
    },
    autosize: {
        type: [Boolean, Object],
        default: false
    }
})

const emit = defineEmits([
    'update:modelValue',
    'input',
    'change',
    'focus',
    'blur'
])

const textareaRef = ref(null)
const isFocused = ref(false)

const currentLength = computed(() => {
    return String(props.modelValue || '').length
})

function handleInput(event) {
    const value = event.target.value
    emit('update:modelValue', value)
    emit('input', value)
    
    // Auto-resize if enabled
    if (props.autosize) {
        autoResize()
    }
}

function handleFocus(event) {
    isFocused.value = true
    emit('focus', event)
}

function handleBlur(event) {
    isFocused.value = false
    emit('blur', event)
}

function handleChange(event) {
    emit('change', event.target.value)
}

function autoResize() {
    if (!textareaRef.value) return
    
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    
    const minRows = typeof props.autosize === 'object' ? props.autosize.minRows : props.rows
    const maxRows = typeof props.autosize === 'object' ? props.autosize.maxRows : undefined
    
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 22
    const minHeight = minRows * lineHeight
    let newHeight = textarea.scrollHeight
    
    if (maxRows) {
        const maxHeight = maxRows * lineHeight
        newHeight = Math.min(newHeight, maxHeight)
    }
    
    textarea.style.height = Math.max(newHeight, minHeight) + 'px'
}

// Expose methods for parent components
function focus() {
    textareaRef.value?.focus()
}

function blur() {
    textareaRef.value?.blur()
}

defineExpose({
    focus,
    blur,
    textareaRef
})
</script>

<style scoped>
.soft-textarea-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--soft-input-bg, #f8f9fc);
    border: 2px solid var(--soft-input-border, #e8ecf4);
    border-radius: 7px;
    padding: 12px 14px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    position: relative;
}

.soft-textarea-wrapper:hover:not(.is-disabled) {
    border-color: var(--el-color-primary-light-5, #a0cfff);
    background-color: var(--soft-input-bg-hover, #ffffff);
}

.soft-textarea-wrapper.is-focused {
    border-color: var(--el-color-primary, #409eff);
    background-color: #ffffff;
    box-shadow: 0 0 0 4px var(--el-color-primary-light-8, #d9ecff);
}

.soft-textarea-wrapper.is-disabled {
    background-color: var(--soft-input-bg-disabled, #f0f2f5);
    cursor: not-allowed;
    opacity: 0.7;
}

/* Size variants */
.soft-textarea--small {
    padding: 8px 10px;
    border-radius: 6px;
}

.soft-textarea--small .soft-textarea__inner {
    font-size: 13px;
}

.soft-textarea--large {
    padding: 14px 16px;
    border-radius: 8px;
}

.soft-textarea--large .soft-textarea__inner {
    font-size: 16px;
}

.soft-textarea__inner {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: var(--soft-input-text, #303133);
    font-family: inherit;
    resize: v-bind(resize);
    line-height: 1.5;
    min-height: 22px;
}

.soft-textarea__inner::placeholder {
    color: var(--soft-input-placeholder, #a8abb2);
}

.soft-textarea__inner:disabled {
    cursor: not-allowed;
    color: var(--soft-input-text-disabled, #c0c4cc);
    resize: none;
}

.soft-textarea__count {
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
}
</style>
