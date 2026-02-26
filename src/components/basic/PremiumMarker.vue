<template>
    <font-awesome-icon v-if='!isProSubscriber' icon='fa-star' style="font-size: 10px;"/>
</template>
<script setup>
import useRevenueCat from '../../composables/api/useRevenueCat'

const { isProSubscriber } = useRevenueCat()

</script>
<style scoped>
.premium-marker {
    color: var(--el-color-primary);
}
</style>
