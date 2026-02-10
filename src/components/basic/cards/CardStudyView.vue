<template>
    <div class='preview'>
        <div class='preview-wrapper'>
            <div class='content-wrapper' v-html='displayHtml'></div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, unref } from 'vue'
import useCardEditor from '../../../composables/ui/useCardEditor'
            
const props = defineProps(['content'])

const displayData = useCardEditor(props.content, true)
const displayHtml = ref(unref(displayData.htmlContent))

watch(() => props.content, (newContent) => {
    displayData.setContent(newContent)
    displayHtml.value = unref(displayData.htmlContent)
})
</script>

<style scoped>
.preview {
    overflow-x: hidden;
}

.content-wrapper {
    overflow: hidden;
    max-width: 100%;
}

.preview-wrapper {
    padding-left: 50px;
    padding-right: 50px;
    display: block;
    box-sizing: border-box;
    max-width: 100%;
}

</style>

<style>
.preview-wrapper .content-wrapper img {
    max-width: 100%;
}
</style>
