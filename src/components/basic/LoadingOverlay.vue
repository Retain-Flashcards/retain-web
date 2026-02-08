<template>
    <div class='loading-overlay'>
        <app-spinner size='medium'></app-spinner>
    </div>
</template>

<script setup>
import AppSpinner from './AppSpinner.vue'
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 1000;
}
</style>