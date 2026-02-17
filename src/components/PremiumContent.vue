<template>
<LoadableProvider :loadable='userIsProSubscriberLoadable'>
    <template #default='{ data }'>
        <slot v-if='data' />
        <slot v-else name='nonSubscriber' />
    </template>
    <template #error>
        <slot name='nonSubscriber' />
    </template>
    <template #loading>
        <slot name='nonSubscriber' />
    </template>
</LoadableProvider>
</template>

<script setup>
import LoadableProvider from './basic/providers/LoadableProvider.vue'

import useRevenueCat from '../composables/api/useRevenueCat'
import useLoadable from '../composables/ui/useLoadable';

const { userIsProSubscriber } = useRevenueCat()

const userIsProSubscriberLoadable = useLoadable(async () => {
    const result = await userIsProSubscriber()
    return result
}, { autoload: true })

</script>

<style scoped>

</style>