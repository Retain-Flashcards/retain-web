<template>
    <div class="section-layout">
        
        <!-- Header Section -->
        <div class="section-header" v-if="$slots.header || $slots.actions">
            <!-- Left Header -->
            <div class="header-title">
                <slot name="header"></slot>
            </div>
            
            <!-- Flex Gap Filler -->
            <div class="flex-spacer"></div>
            
            <!-- Absolute Center -->
            <div class="absolute-center">
                <div style="pointer-events: auto;">
                    <slot name="center"></slot>
                </div>
            </div>
            
            <!-- Right Actions -->
            <div class="header-actions">
                <slot name="actions"></slot>
            </div>
        </div>

    </div>
</template>

<script setup>
defineProps({
    fullWidth: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.section-layout {
    width: 100%;
    margin-bottom: 20px;
}

.section-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    /* Standard padding for headers */
    padding-top: 30px; 
    box-sizing: border-box;
    position: relative;
}

.header-title h1, 
.header-title h2, 
.header-title h3 {
    margin: 0;
}

.flex-spacer {
    flex-grow: 1;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.absolute-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none; /* Let clicks pass through to background */
    z-index: 10;
}

.section-content {
    /* Standard centered content behavior */
    width: 75%;
    margin: auto;
    display: flex;
    flex-direction: column;
}

.section-content.full-width {
    width: 100%;
    margin: 0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .section-content {
        width: 95%;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
    
    .header-actions {
        width: 100%;
        justify-content: flex-end;
    }
    
    .absolute-center {
        position: static;
        left: unset;
        transform: none;
        width: 100%;
        margin-top: 10px;
    }
}
</style>
