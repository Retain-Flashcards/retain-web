<template>
    <div :class="['soft-card', { 
        'soft-card--hoverable': hoverable,
        'soft-card--shadow-always': shadow === 'always',
        'soft-card--shadow-hover': shadow === 'hover',
        'soft-card--shadow-never': shadow === 'never'
    }]">
        <!-- Header -->
        <div class="soft-card__header" v-if="$slots.header || title">
            <slot name="header">
                <span class="soft-card__title">{{ title }}</span>
                <span class="soft-card__subtitle" v-if="subtitle">{{ subtitle }}</span>
            </slot>
            <div class="soft-card__header-actions" v-if="$slots['header-actions']">
                <slot name="header-actions"></slot>
            </div>
        </div>

        <!-- Body -->
        <div class="soft-card__body" :style="bodyStyle">
            <slot></slot>
        </div>

        <!-- Footer -->
        <div class="soft-card__footer" v-if="$slots.footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    subtitle: {
        type: String,
        default: ''
    },
    shadow: {
        type: String,
        default: 'always', // 'always', 'hover', 'never'
        validator: (val) => ['always', 'hover', 'never'].includes(val)
    },
    hoverable: {
        type: Boolean,
        default: false
    },
    bodyPadding: {
        type: String,
        default: ''
    }
})

const bodyStyle = computed(() => {
    if (props.bodyPadding) {
        return { padding: props.bodyPadding }
    }
    return {}
})
</script>

<style scoped>
.soft-card {
    background: #ffffff;
    border-radius: 7px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Shadow variants */
.soft-card--shadow-always {
    box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 2px 4px rgba(0, 0, 0, 0.04);
}

.soft-card--shadow-hover {
    box-shadow: none;
}

.soft-card--shadow-hover:hover {
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.08),
        0 4px 8px rgba(0, 0, 0, 0.04);
}

.soft-card--shadow-never {
    box-shadow: none;
    border: 1px solid #ebeef5;
}

/* Hoverable effect */
.soft-card--hoverable {
    cursor: pointer;
}

.soft-card--hoverable:hover {
    transform: translateY(-4px);
    box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.06);
}

.soft-card--hoverable:active {
    transform: translateY(-2px);
}

/* Header */
.soft-card__header {
    display: flex;
    flex-direction: column;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f4f6f8;
    position: relative;
}

.soft-card__header:has(.soft-card__header-actions) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.soft-card__title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
}

.soft-card__subtitle {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.4;
}

.soft-card__header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

/* Body */
.soft-card__body {
    padding: 24px;
}

/* Footer */
.soft-card__footer {
    padding: 16px 24px;
    border-top: 1px solid #f4f6f8;
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
    .soft-card {
        border-radius: 7px;
    }
    
    .soft-card__header {
        padding: 16px 18px 14px;
    }
    
    .soft-card__title {
        font-size: 16px;
    }
    
    .soft-card__body {
        padding: 18px;
    }
    
    .soft-card__footer {
        padding: 14px 18px;
    }
}
</style>
