<template>
    <div class='preview'>
        <div class='preview-wrapper'>
            <div class='content-wrapper'>
                <EditorCanvas :content='displayData.contentTree.value'></EditorCanvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch } from 'vue'
import EditorCanvas from './EditorCanvas'
import useCardEditor from '../../../composables/ui/useCardEditor'
            
const props = defineProps(['content'])

const displayData = useCardEditor(props.content, true)

watch(() => props.content, (newContent) => {
    displayData.setContent(newContent)
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
