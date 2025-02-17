<template>

<slot :data="loadable.value()" :loading="loadable.status() == 'loading'" :error="loadable.error()"></slot>

</template>

<script setup>
const props = defineProps(['loadable']);

//watch(props.loadable.currentState.value, () => {})

</script>