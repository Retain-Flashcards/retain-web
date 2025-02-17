<template>
<slot v-if='(loadable.status() == "not-started" && !$slots.notStarted) || loadable.status() == "data" || (loadable.status() == "loading" && !$slots.loading)' :data='loadable.value()' :loading='loadable.status() == "loading"'></slot>
<slot name='loading' v-if='loadable.status() == "loading"'></slot>
<slot name='error' v-if='loadable.status() == "error"' :error='loadable.error()'></slot>

</template>

<script setup>
const props = defineProps(['loadable']);

//watch(props.loadable.currentState.value, () => {})

</script>