<template>
    <form 
        :class="['soft-form', { 'soft-form--inline': inline }]" 
        @submit.prevent="handleSubmit"
        ref="formRef"
    >
        <slot></slot>
    </form>
</template>

<script setup>
import { ref, provide, reactive } from 'vue'

const props = defineProps({
    model: {
        type: Object,
        default: () => ({})
    },
    rules: {
        type: Object,
        default: () => ({})
    },
    labelPosition: {
        type: String,
        default: 'top', // 'top', 'left', 'right'
        validator: (val) => ['top', 'left', 'right'].includes(val)
    },
    labelWidth: {
        type: String,
        default: ''
    },
    inline: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showMessage: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const fieldRefs = reactive({})
const fieldErrors = reactive({})

// Provide form context to child SoftFormItem components
provide('softForm', {
    model: props.model,
    rules: props.rules,
    labelPosition: props.labelPosition,
    labelWidth: props.labelWidth,
    disabled: props.disabled,
    showMessage: props.showMessage,
    registerField: (fieldName, fieldRef) => {
        fieldRefs[fieldName] = fieldRef
    },
    unregisterField: (fieldName) => {
        delete fieldRefs[fieldName]
        delete fieldErrors[fieldName]
    },
    setFieldError: (fieldName, error) => {
        fieldErrors[fieldName] = error
    },
    clearFieldError: (fieldName) => {
        delete fieldErrors[fieldName]
    }
})

// Validate a single field
function validateField(fieldName) {
    const rules = props.rules[fieldName]
    if (!rules) return Promise.resolve(true)
    
    const value = props.model[fieldName]
    const ruleList = Array.isArray(rules) ? rules : [rules]
    
    for (const rule of ruleList) {
        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
            fieldErrors[fieldName] = rule.message || 'This field is required'
            return Promise.resolve(false)
        }
        
        // Pattern check
        if (rule.pattern && !rule.pattern.test(value)) {
            fieldErrors[fieldName] = rule.message || 'Invalid format'
            return Promise.resolve(false)
        }
        
        // Min length
        if (rule.min !== undefined && String(value).length < rule.min) {
            fieldErrors[fieldName] = rule.message || `Minimum length is ${rule.min}`
            return Promise.resolve(false)
        }
        
        // Max length
        if (rule.max !== undefined && String(value).length > rule.max) {
            fieldErrors[fieldName] = rule.message || `Maximum length is ${rule.max}`
            return Promise.resolve(false)
        }
        
        // Custom validator
        if (rule.validator && typeof rule.validator === 'function') {
            return new Promise((resolve) => {
                rule.validator(rule, value, (error) => {
                    if (error) {
                        fieldErrors[fieldName] = error.message || 'Validation failed'
                        resolve(false)
                    } else {
                        delete fieldErrors[fieldName]
                        resolve(true)
                    }
                })
            })
        }
    }
    
    delete fieldErrors[fieldName]
    return Promise.resolve(true)
}

// Validate all fields
async function validate(callback) {
    const fieldNames = Object.keys(props.rules)
    let allValid = true
    const errors = {}
    
    for (const fieldName of fieldNames) {
        const isValid = await validateField(fieldName)
        if (!isValid) {
            allValid = false
            errors[fieldName] = fieldErrors[fieldName]
        }
    }
    
    if (callback && typeof callback === 'function') {
        callback(allValid, allValid ? undefined : errors)
    }
    
    return allValid
}

// Reset validation state
function resetFields() {
    Object.keys(fieldErrors).forEach(key => {
        delete fieldErrors[key]
    })
}

// Clear validation for specific fields
function clearValidate(fields) {
    if (!fields) {
        resetFields()
    } else {
        const fieldList = Array.isArray(fields) ? fields : [fields]
        fieldList.forEach(field => {
            delete fieldErrors[field]
        })
    }
}

function handleSubmit() {
    validate((valid) => {
        if (valid) {
            emit('submit', props.model)
        }
    })
}

// Expose methods for parent components (matching el-form API)
defineExpose({
    validate,
    validateField,
    resetFields,
    clearValidate
})
</script>

<style scoped>
.soft-form {
    width: 100%;
}

.soft-form--inline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
}
</style>
