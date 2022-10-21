<template>

<el-form :model='formData' ref='theForm' label-position='top' :disabled='isLoading' :rules='rules'>

    <el-form-item label='Deck Title' :required='true' prop='title'>
        <el-input v-model='formData.title'></el-input>
    </el-form-item>
    <el-form-item label='Color'>
        <el-color-picker v-model='formData.primaryColor' :predefine='predefinedColors'></el-color-picker>
    </el-form-item>
    <el-form-item label='Cover Image' prop='coverImage'>
        <div style='width: 100%; display: flex; flex-direction: column; align-items: center;'>
            <img v-if='editingDeck && editingDeck.coverImage' :src='editingDeck.coverImage' style='max-width: 100%; width: 70%; margin: 20px; border-radius: 20px;'/>
            <el-upload drag :file-list="formData.coverImageFiles" thumbnail-mode :auto-upload='false' action='' list-type='picture' :multiple='false' :style='{ display: "flex", flex: 1, width: "100%" }'>
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
        <el-button type='primary' @click='submitNewDeckForm' :loading='isLoading'>{{ editingDeck ? 'Save':'Create' }} Deck</el-button>
        <el-popconfirm
            v-if='editingDeck'
            confirm-button-type='danger'
            title="Delete this deck?"
            @confirm='deleteDeck'>
            <template #reference>
                <el-button type='danger' slot='reference' :loading='isLoading'>Delete Deck</el-button>
            </template>
        </el-popconfirm>
    </el-form-item>
    
        

</el-form>

</template>

<script>
import useFlashcards from '../../composables/UseFlashcards'

const { createDeck, deleteDeck } = useFlashcards()

export default {
    props: ['onComplete', 'editingDeck'],
    data() {
        return {
            predefinedColors: [
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
            ],
            isLoading: false,
            formData: {
                title: '',
                coverImageFiles: [],
                primaryColor: ''
            },
            rules: {
                title: [
                    { required: true, message: 'Please enter deck title', trigger: 'blur' }
                ]
            }
        }
    },
    mounted() {
        if (this.editingDeck) {
            this.formData.title = this.editingDeck.title
            this.formData.primaryColor = this.editingDeck.primaryColor
        }
    },  
    methods: {
        submitNewDeckForm() {
            console.log(this.formData.primaryColor)
            this.$refs['theForm'].validate(valid => {

                if (valid) {
                    
                    this.isLoading = true
                    
                    const fileObj = this.formData.coverImageFiles.length > 0 ? this.formData.coverImageFiles[0].raw : undefined

                    createDeck(this.formData.title, fileObj, this.formData.primaryColor, this.editingDeck?.id).then(result => {
                        this.formData = {
                            title: '',
                            coverImageFiles: []
                        }
                        this.onComplete(result)
                    }).catch(error => {
                        console.log(error)
                        this.$Notification.error({
                            title: 'Error',
                            text: 'Something went wrong. Please try again.'
                        })
                    }).finally(() => {
                        this.isLoading = false
                    })

                }
                else {
                    return false
                }

            })

            
        },
        deleteDeck() {
            this.isLoading = true
            deleteDeck(this.editingDeck.id).then(result => {
                this.onComplete(result)
            }).catch(console.error).finally(() => {
                this.isLoading = false
            })
        }

    }
}

</script>

<style>

.el-upload.el-upload--picture {
    flex: 1;
}

</style>