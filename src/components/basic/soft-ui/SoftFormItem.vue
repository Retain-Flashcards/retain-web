<template>
    <div 
        :class="['soft-form-item', {
            'soft-form-item--error': hasError,
            'soft-form-item--required': required || isRequired,
            [`soft-form-item--${labelPositionClass}`]: true
        }]"
        :style="itemStyle"
    >
        <label 
            class="soft-form-item__label" 
            v-if="label || $slots.label"
            :style="labelStyle"
        >
            <slot name="label">{{ label }}</slot>
        </label>
        
        <div class="soft-form-item__content">
            <slot></slot>
            
            <Transition name="soft-error-fade">
                <div class="soft-form-item__error" v-if="hasError && showMessage">
                    <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="error-icon" />
                    <span>{{ errorMessage }}</span>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { inject, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    prop: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    labelWidth: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    }
})

// Inject form context
const softForm = inject('softForm', null)

const labelPositionClass = computed(() => {
    return softForm?.labelPosition || 'top'
})

const labelStyle = computed(() => {
    const width = props.labelWidth || softForm?.labelWidth
    if (width && labelPositionClass.value !== 'top') {
        return { width }
    }
    return {}
})

const itemStyle = computed(() => {
    const width = props.labelWidth || softForm?.labelWidth
    if (width && labelPositionClass.value !== 'top') {
        return { '--label-width': width }
    }
    return {}
})

const showMessage = computed(() => {
    return softForm?.showMessage !== false
})

// Check if field is required from rules
const isRequired = computed(() => {
    if (!props.prop || !softForm?.rules) return false
    const rules = softForm.rules[props.prop]
    if (!rules) return false
    const ruleList = Array.isArray(rules) ? rules : [rules]
    return ruleList.some(rule => rule.required)
})

// Get error from form context or prop
const errorMessage = computed(() => {
    if (props.error) return props.error
    if (props.prop && softForm) {
        // Check if there's an error for this field in the form context
        return softForm.fieldErrors?.[props.prop] || ''
    }
    return ''
})

const hasError = computed(() => !!errorMessage.value)

// Register/unregister field with form
onMounted(() => {
    if (props.prop && softForm?.registerField) {
        softForm.registerField(props.prop, props)
    }
})

onUnmounted(() => {
    if (props.prop && softForm?.unregisterField) {
        softForm.unregisterField(props.prop)
    }
})
</script>

<style scoped>
.soft-form-item {
    margin-bottom: 22px;
}

.soft-form-item:last-child {
    margin-bottom: 0;
}

/* Label position: top (default) */
.soft-form-item--top {
    display: flex;
    flex-direction: column;
}

.soft-form-item--top .soft-form-item__label {
    margin-bottom: 8px;
}

/* Label position: left */
.soft-form-item--left {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

.soft-form-item--left .soft-form-item__label {
    flex-shrink: 0;
    padding-right: 16px;
    padding-top: 10px;
    text-align: right;
    width: var(--label-width, 100px);
}

/* Label position: right */
.soft-form-item--right {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

.soft-form-item--right .soft-form-item__label {
    flex-shrink: 0;
    padding-right: 16px;
    padding-top: 10px;
    text-align: left;
    width: var(--label-width, 100px);
}

.soft-form-item__label {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    line-height: 1.4;
    text-align: left;
}

/* Required indicator */
.soft-form-item--required .soft-form-item__label::before {
    content: '*';
    color: var(--el-color-danger, #f56c6c);
    margin-right: 4px;
    font-weight: 600;
}

.soft-form-item__content {
    flex: 1;
    position: relative;
}

.soft-form-item__error {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-color-danger, #f56c6c);
    line-height: 1.4;
}

.soft-form-item__error .error-icon {
    font-size: 11px;
    flex-shrink: 0;
}

/* Error state - affects child inputs */
.soft-form-item--error :deep(.soft-input-wrapper) {
    border-color: var(--el-color-danger, #f56c6c);
}

.soft-form-item--error :deep(.soft-input-wrapper.is-focused) {
    box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.2);
}

/* Error animation */
.soft-error-fade-enter-active {
    transition: all 0.25s ease;
}

.soft-error-fade-leave-active {
    transition: all 0.15s ease;
}

.soft-error-fade-enter-from,
.soft-error-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
