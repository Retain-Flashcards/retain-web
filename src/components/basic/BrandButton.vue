<template>
    <button @click.prevent='emit("click")' :disabled='props.loading || props.disabled' :class='`brand-button ${props.size || ""} ${props.plain ? "plain" : ""} ${props.type || "primary"} ${props.loading || props.disabled ? "disabled" : ""}`'>
        <span :class='`brand-button__text ${props.loading ? "loading" : ""}`'>
            <font-awesome-icon :icon='props.icon' v-if='props.icon && (!props.iconPosition || props.iconPosition === "left")'></font-awesome-icon>
            <slot></slot>
            <font-awesome-icon :icon='props.icon' v-if='props.icon && props.iconPosition === "right"'></font-awesome-icon>
        </span>
        <span class='spinner-container' v-if='props.loading'>
            <app-spinner size='small' :color='spinnerStyles[`${props.type}${props.plain ? "plain" : ""}`]'/>
        </span>
    </button>
</template>
    
<script setup>
import AppSpinner from './AppSpinner.vue'

const props = defineProps(['icon', 'iconPosition', 'loading', 'type', 'plain', 'size', 'disabled'])

const emit = defineEmits(['click'])

const spinnerStyles = {
    primary: 'light',
    primaryplain: 'primary',
    warning: 'light',
    warningplain: 'warning',
    error: 'light',
    errorplain: 'error'
}

</script>

<style scoped>
.brand-button {
    border: none;
    padding: 7px 15px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 16px;
    gap: 5px;
    display: flex;
    position: relative;
    transition: 0.2s;
    white-space: nowrap;
    justify-content: center;
}

.brand-button.large {
    padding: 10px 20px;
    font-size: 18px;
}

.brand-button.small {
    padding: 5px 10px;
    font-size: 14px;
}

.brand-button.disabled {
    cursor: not-allowed;
}


.brand-button.primary {
    background-color: var(--el-color-primary);
    color: white;
}

.brand-button.primary.disabled { background-color: var(--el-color-primary-light-3); }
.brand-button.primary:hover:not(.disabled) { background-color: var(--el-color-primary-light-3); }
.brand-button.primary:active:not(.disabled) { background-color: var(--el-color-primary-dark-2); }


.brand-button.primary.plain {
    background-color: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary);
    color: var(--el-color-primary);
}

.brand-button.primary.plain.disabled { background-color: var(--el-color-primary-light-9); }
.brand-button.primary.plain:hover:not(.disabled) { background-color: var(--el-color-primary-light-8); }
.brand-button.primary.plain:active:not(.disabled) { background-color: var(--el-color-primary-light-7); }

.brand-button.warning {
    background-color: var(--el-color-warning);
    color: white;
}

.brand-button.warning.disabled { background-color: var(--el-color-warning-light-3); }
.brand-button.warning:hover:not(.disabled) { background-color: var(--el-color-warning-light-3); }
.brand-button.warning:active:not(.disabled) { background-color: var(--el-color-warning-light-3); }
 
.brand-button.warning.plain {
    background-color: var(--el-color-warning-light-9);
    border: 1px solid var(--el-color-warning);
    color: var(--el-color-warning);
}

.brand-button.warning.plain.disabled { background-color: var(--el-color-warning-light-9); }
.brand-button.warning.plain:hover:not(.disabled) { background-color: var(--el-color-warning-light-8); }
.brand-button.warning:active:not(.disabled) { background-color: var(--el-color-warning-dark-2); }


.brand-button.error {
    background-color: var(--el-color-error);
    color: white;
}

.brand-button.error.disabled { background-color: var(--el-color-error-light-3); }
.brand-button.error:hover:not(.disabled) { background-color: var(--el-color-error-light-3); }
.brand-button.error:active:not(.disabled) { background-color: var(--el-color-error-light-3); }
 
.brand-button.error.plain {
    background-color: var(--el-color-error-light-9);
    border: 1px solid var(--el-color-error);
    color: var(--el-color-error);
}

.brand-button.error.plain.disabled { background-color: var(--el-color-error-light-9); }
.brand-button.error.plain:hover:not(.disabled) { background-color: var(--el-color-error-light-8); }
.brand-button.error:active:not(.disabled) { background-color: var(--el-color-error-dark-2); }



.brand-button.info {
    background-color: var(--el-color-info);
    color: white;
}

.brand-button.info.disabled { background-color: var(--el-color-info-light-3); }
.brand-button.info:hover:not(.disabled) { background-color: var(--el-color-info-light-3); }
.brand-button.info:active:not(.disabled) { background-color: var(--el-color-info-light-3); }
 
.brand-button.info.plain {
    background-color: transparent;
    border: 1px solid var(--el-color-info);
    color: var(--el-color-info);
}

.brand-button.info.plain.disabled { background-color: var(--el-color-info-light-9); }
.brand-button.info.plain:hover:not(.disabled) { background-color: var(--el-color-info-light-8); }
.brand-button.info:active:not(.disabled) { background-color: var(--el-color-info-dark-2); }


.brand-button.success {
    background-color: var(--el-color-success);
    color: white;
}

.brand-button.success.disabled { background-color: var(--el-color-success-light-3); }
.brand-button.success:hover:not(.disabled) { background-color: var(--el-color-success-light-3); }
.brand-button.success:active:not(.disabled) { background-color: var(--el-color-success-light-3); }
 
.brand-button.success.plain {
    background-color: var(--el-color-success-light-9);
    border: 1px solid var(--el-color-success);
    color: var(--el-color-success);
}

.brand-button.success.plain.disabled { background-color: var(--el-color-success-light-9); }
.brand-button.success.plain:hover:not(.disabled) { background-color: var(--el-color-success-light-8); }
.brand-button.success:active:not(.disabled) { background-color: var(--el-color-success-dark-2); }


.brand-button__text {
    display: flex;
    align-items: center;
    gap: 5px;
    z-index: 1;
}

.brand-button__text.loading {
    opacity: 0;
}

.spinner-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
}
</style>
