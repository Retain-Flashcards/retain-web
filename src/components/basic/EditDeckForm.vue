<template>
<LoadableStateProvider :loadable='submitFormLoadable' v-slot='{ loading: submitLoading }'>
<LoadableStateProvider :loadable='deleteDeckLoadable' v-slot='{ loading: deleteLoading }'>
    <el-form :model='formData' ref='theForm' label-position='top' :disabled='submitLoading || deleteLoading' :rules='rules'>

        <el-form-item label='Deck Title' :required='true' prop='title'>
            <el-input v-model='formData.title'></el-input>
        </el-form-item>
        <el-form-item label='Color'>
            <el-color-picker v-model='formData.primaryColor' :predefine='predefinedColors'></el-color-picker>
        </el-form-item>
        <el-form-item label='Cover Image' prop='coverImage'>
            <div style='width: 100%; display: flex; flex-direction: column; align-items: center;'>
                <img v-if='editingDeck && editingDeck.coverImage' :src='editingDeck.coverImage' style='max-width: 100%; width: 70%; margin: 20px; border-radius: 20px;'/>
                <el-upload drag v-model:file-list="formData.coverImageFiles" thumbnail-mode :auto-upload='false' action='' list-type='picture' :multiple='false' :style='{ display: "flex", flex: 1, width: "100%" }'>
                    <div class='flex-spacer'></div>
                    <div>
                        <el-icon><Upload /></el-icon>
                        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                        <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div>
                    </div>
                    <div class='flex-spacer'></div>
                </el-upload>
            </div>
        </el-form-item>

        <el-form-item>
            <el-button type='primary' @click='submitNewDeckForm' :loading='submitLoading || deleteLoading'>{{ editingDeck ? 'Save':'Create' }} Deck</el-button>
            <el-popconfirm
                v-if='editingDeck'
                confirm-button-type='danger'
                title="Delete this deck?"
                @confirm='() => deleteDeckLoadable.load()'>
                <template #reference>
                    <el-button type='danger' slot='reference' :loading='submitLoading || deleteLoading'>Delete Deck</el-button>
                </template>
            </el-popconfirm>
        </el-form-item>
        
            

    </el-form>
</LoadableStateProvider>
</LoadableStateProvider>

</template>

<script setup>
import { onMounted, onUpdated, ref } from 'vue';
import useDecks from '../../composables/useDecks'
import useLoadable from '../../composables/useLoadable';
import LoadableStateProvider from './LoadableStateProvider.vue'

const { createDeck, updateDeck, deleteDeck } = useDecks()

const props = defineProps(['onComplete', 'editingDeck'])

const predefinedColors = [
    '#ffad33',
    '#E03E3E',
    '#AD1A72',
    '#6940A5',
    '#0B6E99',
    '#0F7B6C',
    '#DFAB01',
    '#D9730D',
    '#64473A',
    '#9B9A97'
]

const formData = ref({
    title: '',
    coverImageFiles: [],
    primaryColor: ''
})

const formRules = {
    title: [
        { required: true, message: 'Please enter deck title', trigger: 'blur' }
    ]
}


const theForm = ref(null)

onMounted(() => {
    formData.value.title = props.editingDeck?.title
    formData.value.primaryColor = props.editingDeck?.primaryColor
})
onUpdated(() => {
    formData.value.title = props.editingDeck?.title
    formData.value.primaryColor = props.editingDeck?.primaryColor
})

const submitFormLoadable = useLoadable(async () => {

    try {
        const fileObj = formData.value.coverImageFiles.length > 0 ? formData.value.coverImageFiles[0].raw : undefined
        let result;
        if (props.editingDeck) result = await updateDeck(props.editingDeck.id, formData.value.title, fileObj, formData.value.primaryColor)
        else result = await createDeck(formData.value.title, fileObj, formData.value.primaryColor)

        formData.value = {
            title: '',
            coverImageFiles: []
        }

        props.onComplete(result)
    } catch(error) {
        this.$Notification.error({
            title: 'Error',
            text: 'Something went wrong. Please try again.'
        })
    }

})

const deleteDeckLoadable = useLoadable(async () => {
    const result = await deleteDeck(props.editingDeck.id)
    props.onComplete(result)
})

function submitNewDeckForm() {
    submitFormLoadable.load()
}

</script>

<style>

.el-upload.el-upload--picture {
    flex: 1;
}

</style>