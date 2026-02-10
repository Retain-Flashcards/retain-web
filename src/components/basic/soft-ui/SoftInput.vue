<template>
    <div :class="['soft-input-wrapper', { 
        'is-disabled': disabled, 
        'is-focused': isFocused,
        'has-prefix': prefixIcon || $slots.prefix,
        'has-suffix': suffixIcon || $slots.suffix || clearable || showPassword,
        [`soft-input--${size}`]: size
    }]">
        <!-- Prefix Icon/Slot -->
        <span class="soft-input__prefix" v-if="prefixIcon || $slots.prefix">
            <slot name="prefix">
                <font-awesome-icon :icon="prefixIcon" v-if="prefixIcon" />
            </slot>
        </span>

        <!-- Input Element -->
        <input
            ref="inputRef"
            class="soft-input__inner"
            :type="inputType"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :maxlength="maxlength"
            :minlength="minlength"
            :autocomplete="autocomplete"
            :name="name"
            :autofocus="autofocus"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @change="handleChange"
            @keyup="handleKeyup"
            @keydown="handleKeydown"
            @keyup.enter="emit('keyup', $event)"
        />

        <!-- Suffix Icons/Actions -->
        <span class="soft-input__suffix" v-if="suffixIcon || $slots.suffix || clearable || showPassword">
            <!-- Clear Button -->
            <font-awesome-icon 
                v-if="clearable && modelValue && !disabled" 
                icon="fa-solid fa-circle-xmark" 
                class="soft-input__clear"
                @click="handleClear"
            />
            
            <!-- Password Toggle -->
            <font-awesome-icon 
                v-if="showPassword && type === 'password'" 
                :icon="passwordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" 
                class="soft-input__password-toggle"
                @click="togglePasswordVisibility"
            />
            
            <!-- Custom Suffix -->
            <slot name="suffix">
                <font-awesome-icon :icon="suffixIcon" v-if="suffixIcon && !clearable" />
            </slot>
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
    type: {
        type: String,
        default: 'text'
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
    clearable: {
        type: Boolean,
        default: false
    },
    showPassword: {
        type: Boolean,
        default: false
    },
    prefixIcon: {
        type: String,
        default: ''
    },
    suffixIcon: {
        type: String,
        default: ''
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
    autocomplete: {
        type: String,
        default: 'off'
    },
    name: {
        type: String,
        default: ''
    },
    autofocus: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'update:modelValue',
    'input',
    'change',
    'focus',
    'blur',
    'clear',
    'keyup',
    'keydown'
])

const inputRef = ref(null)
const isFocused = ref(false)
const passwordVisible = ref(false)

const inputType = computed(() => {
    if (props.showPassword && props.type === 'password') {
        return passwordVisible.value ? 'text' : 'password'
    }
    return props.type
})

function handleInput(event) {
    const value = event.target.value
    emit('update:modelValue', value)
    emit('input', value)
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

function handleKeyup(event) {
    emit('keyup', event)
}

function handleKeydown(event) {
    emit('keydown', event)
}

function handleClear() {
    emit('update:modelValue', '')
    emit('clear')
    emit('input', '')
    inputRef.value?.focus()
}

function togglePasswordVisibility() {
    passwordVisible.value = !passwordVisible.value
}

// Expose focus method for parent components
function focus() {
    inputRef.value?.focus()
}

function blur() {
    inputRef.value?.blur()
}

defineExpose({
    focus,
    blur,
    inputRef
})
</script>

<style scoped>
.soft-input-wrapper {
    display: inline-flex;
    align-items: center;
    width: 100%;
    background-color: var(--soft-input-bg, #f8f9fc);
    border: 2px solid var(--soft-input-border, #e8ecf4);
    border-radius: 7px;
    padding: 0 14px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.soft-input-wrapper:hover:not(.is-disabled) {
    border-color: var(--el-color-primary-light-5, #a0cfff);
    background-color: var(--soft-input-bg-hover, #ffffff);
}

.soft-input-wrapper.is-focused {
    border-color: var(--el-color-primary, #409eff);
    background-color: #ffffff;
    box-shadow: 0 0 0 4px var(--el-color-primary-light-8, #d9ecff);
}

.soft-input-wrapper.is-disabled {
    background-color: var(--soft-input-bg-disabled, #f0f2f5);
    cursor: not-allowed;
    opacity: 0.7;
}

/* Size variants */
.soft-input--small {
    padding: 0 10px;
    border-radius: 6px;
}

.soft-input--small .soft-input__inner {
    height: 32px;
    font-size: 13px;
}

.soft-input--default .soft-input__inner {
    height: 40px;
    font-size: 14px;
}

.soft-input--large {
    padding: 0 16px;
    border-radius: 8px;
}

.soft-input--large .soft-input__inner {
    height: 48px;
    font-size: 16px;
}

.soft-input__inner {
    flex: 1;
    height: 40px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: var(--soft-input-text, #303133);
    font-family: inherit;
    min-width: 0;
}

.soft-input__inner::placeholder {
    color: var(--soft-input-placeholder, #a8abb2);
}

.soft-input__inner:disabled {
    cursor: not-allowed;
    color: var(--soft-input-text-disabled, #c0c4cc);
}

.soft-input__prefix,
.soft-input__suffix {
    display: flex;
    align-items: center;
    color: var(--soft-input-icon, #909399);
    font-size: 14px;
    gap: 8px;
}

.soft-input__prefix {
    margin-right: 10px;
}

.soft-input__suffix {
    margin-left: 10px;
}

.soft-input__clear,
.soft-input__password-toggle {
    cursor: pointer;
    transition: color 0.2s ease;
}

.soft-input__clear:hover,
.soft-input__password-toggle:hover {
    color: var(--el-color-primary, #409eff);
}

/* When has prefix/suffix icons, adjust padding */
.has-prefix .soft-input__inner {
    padding-left: 0;
}

.has-suffix .soft-input__inner {
    padding-right: 0;
}
</style>
