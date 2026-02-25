<template>
    <premium-content>
        <template #nonSubscriber>
            <span class="pro-pill">PRO</span>
        </template>
    </premium-content>
</template>

<script setup>
import PremiumContent from '../PremiumContent.vue'
</script>

<style scoped>
.pro-pill {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #FFF3E0;
    color: #E65100;
    border: 1px solid #FFB74D;
    line-height: 1.4;
    user-select: none;
    vertical-align: middle;
}
</style>
