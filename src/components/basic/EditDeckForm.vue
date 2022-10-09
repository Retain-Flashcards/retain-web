<template>

<el-form :model='formData' ref='theForm' label-position='top' :disabled='isLoading' :rules='rules'>

    <el-form-item label='Deck Title' :required='true' prop='title'>
        <el-input v-model='formData.title'></el-input>
    </el-form-item>

    <el-form-item label='Cover Image' prop='coverImage'>
        <el-upload drag :file-list="formData.coverImageFiles" thumbnail-mode :auto-upload='false' action='' list-type='picture' :multiple='false' :style='{ display: "flex", flex: 1, width: "100%" }'>
            <div class='flex-spacer'></div>
            <div>
                <el-icon><Upload /></el-icon>
                <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div>
            </div>
            <div class='flex-spacer'></div>
        </el-upload>
    </el-form-item>

    <el-form-item>
        <el-button type='primary' @click='submitNewDeckForm' :loading='isLoading'>Create Deck</el-button>
    </el-form-item>

</el-form>

</template>

<script>
import useFlashcards from '../../composables/UseFlashcards'

const { createDeck } = useFlashcards()

export default {
    props: ['onComplete'],
    data() {
        return {
            isLoading: false,
            formData: {
                title: '',
                coverImageFiles: []
            },
            rules: {
                title: [
                    { required: true, message: 'Please enter deck title', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        submitNewDeckForm() {
            this.$refs['theForm'].validate(valid => {

                if (valid) {
                    
                    this.isLoading = true
                    
                    const fileObj = this.formData.coverImageFiles.length > 0 ? this.formData.coverImageFiles[0].raw : undefined

                    console.log('testth')
                    createDeck(this.formData.title, fileObj).then(result => {
                        this.formData = {
                            title: '',
                            coverImageFiles: []
                        }
                        console.log('testagain')
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

            
        }
    }
}

</script>

<style>

.el-upload.el-upload--picture {
    flex: 1;
}

</style>