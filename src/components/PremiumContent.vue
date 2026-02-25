<template>
    <!-- While loading: render nothing (avoids flash of wrong content) -->
    <template v-if="isProSubscriber === null">
        <!-- intentionally empty until status resolves -->
    </template>
    <!-- Pro user -->
    <slot v-else-if="isProSubscriber" />
    <!-- Free user -->
    <slot v-else name="nonSubscriber" />
</template>

<script setup>
import useRevenueCat from '../composables/api/useRevenueCat'

const { isProSubscriber } = useRevenueCat()
</script>

<style scoped>

</style>