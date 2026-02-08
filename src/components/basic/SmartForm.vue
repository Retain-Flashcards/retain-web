<template>
    <div class="smart-form-container">
        <!-- Main Loadable Provider for Submit Action -->
        <LoadableStateProvider :loadable="submissionLoadable" v-slot="{ loading, error }">
            
            <el-form 
                ref="formRef" 
                :model="formData" 
                :rules="validationRules" 
                label-position="top" 
                :disabled="loading"
            >
                <!-- Loop through schema to render fields -->
                <el-form-item 
                    v-for="(field, index) in schema" 
                    :key="field.key || index" 
                    :label="field.label" 
                    :prop="field.key"
                    :required="field.required"
                >
                    <!-- Text / Password Input -->
                    <el-input 
                        v-if="!field.type || field.type === 'text' || field.type === 'password' || field.type === 'email'"
                        v-model="formData[field.key]"
                        :type="field.type || 'text'"
                        :placeholder="field.placeholder"
                        :rows="field.rows"
                        :autosize="field.autosize"
                        @keyup.enter="field.submitOnEnter ? handleSubmit() : null"
                    />

                    <!-- Color Picker -->
                    <el-color-picker 
                        v-else-if="field.type === 'color'"
                        v-model="formData[field.key]"
                        :predefine="field.predefinedColors"
                    />

                    <!-- Select -->
                    <el-select 
                        v-else-if="field.type === 'select'"
                        v-model="formData[field.key]"
                        :placeholder="field.placeholder"
                        :multiple="field.multiple"
                    >
                        <el-option
                            v-for="opt in field.options"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                        />
                    </el-select>

                     <!-- Custom Slot -->
                     <template v-else-if="field.type === 'slot'">
                        <slot :name="field.slotName" :formData="formData"></slot>
                    </template>

                </el-form-item>

                <!-- Error Display -->
                <el-alert
                    v-if="error"
                    :title="errorMessage || 'An error occurred'"
                    type="error"
                    show-icon
                    style="margin-bottom: 20px;"
                />

                <!-- Submit Button -->
                 <div class="form-actions">
                    <brand-button type="primary" @click="handleSubmit" :loading="loading">
                        {{ submitText }}
                    </brand-button>
                    <slot name="actions" :loading="loading"></slot>
                 </div>

            </el-form>

        </LoadableStateProvider>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import LoadableStateProvider from './providers/LoadableStateProvider.vue'
import BrandButton from './BrandButton.vue'

import useLoadable from '../../composables/ui/useLoadable'

const props = defineProps({
    schema: {
        type: Array,
        required: true,
        // Example schema item: 
        // { key: 'email', label: 'Email', type: 'text', required: true, rules: [...] }
    },
    initialData: {
        type: Object,
        default: () => ({})
    },
    submit: {
        type: Function,
        required: true
    },
    submitText: {
        type: String,
        default: 'Submit'
    },
    onSuccess: {
        type: Function,
        default: () => {}
    }
})

const formRef = ref(null)
const formData = reactive({ ...props.initialData })

// Initialize formData keys if they don't exist in initialData
props.schema.forEach(field => {
    if (field.key && formData[field.key] === undefined) {
        formData[field.key] = field.defaultValue !== undefined ? field.defaultValue : ''
    }
})

// Build validation rules object
const validationRules = computed(() => {
    const rules = {}
    props.schema.forEach(field => {
        if (field.key) {
            const fieldRules = []
            if (field.required) {
                fieldRules.push({ required: true, message: `${field.label || 'Field'} is required`, trigger: 'blur' })
            }
            if (field.rules) {
                if (Array.isArray(field.rules)) {
                    fieldRules.push(...field.rules)
                } else {
                    fieldRules.push(field.rules)
                }
            }
            if (fieldRules.length > 0) {
                rules[field.key] = fieldRules
            }
        }
    })
    return rules
})

const submissionLoadable = useLoadable(async () => {
    const result = await props.submit(formData)
    return result
}, {
    onError: (e) => {
        // Error is handled by state provider or local handling
        console.error("Form submission error:", e)
    },
    onData: (data) => {
        props.onSuccess(data)
    }
})

const errorMessage = computed(() => {
    if (submissionLoadable.error) return submissionLoadable.error.message || 'An unexpected error occurred.'
    return null
})

async function handleSubmit() {
    if (!formRef.value) return
    
    await formRef.value.validate((valid, fields) => {
        if (valid) {
            submissionLoadable.load()
        } else {
            console.log('Validation failed', fields)
        }
    })
}

// Watch initialData for changes (if editing form loads data asynchronously)
watch(() => props.initialData, (newData) => {
    Object.assign(formData, newData)
}, { deep: true })

</script>

<style scoped>
.smart-form-container {
    width: 100%;
}
.form-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
