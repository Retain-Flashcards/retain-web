<template>
<slot v-if='(loadable.status == "not-started" && !$slots.notStarted) || loadable.status == "data" || (loadable.status == "loading" && !slots.loading)' :data='loadable.value' :loading='loadable.status == "loading"'></slot>
<slot name='loading' v-if='loadable.status == "loading"'></slot>
<slot name='error' v-if='loadable.status == "error"' :error='loadable.error'></slot>
<slot name='not-started' v-if='loadable.status == "not-started"'></slot>
</template>

<script setup>
import { provide, useSlots } from 'vue'
const props = defineProps(['loadable']);
provide('loadable', props.loadable)

const slots = useSlots()
</script>