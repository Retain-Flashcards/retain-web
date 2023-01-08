<template>

<div class='content'>
    <div class='breadcrumb' style='margin-left: 20px;margin-bottom: 30px;'>
        <div class='return-link' @click='() => { this.$router.push({ name: "View Deck", params: { deckId: this.deckId } }) }'>
            <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
        </div>
    </div>
    <div class='header'>
        <h1>{{ this.noteId ? 'Edit':'Add'}} Card</h1>
        <div class='flex-spacer'></div>
        <span style='margin-right: 10px;'>To deck: </span>
        <el-select v-model='deckSelect.value' placeholder='to deck...' :loading='deckSelect.loading' @change='onDeckSelectChange'>
            <el-option v-for='item in deckSelect.options' :key='item.id' :label='item.title' :value='item.id'>

            </el-option>
        </el-select>
    </div>

    <el-main class='main-content' v-loading='submittingNote'>
        <div id='frontEditor'>
            <el-main v-loading='editor.frontLoading'>
                <div style='display: flex; width: 100%; align-items: center;'>
                    <h2>Front</h2>
                    <div class='flex-spacer'></div>
                    <el-button type='primary' :disabled='submittingNote' @click='submitNote'>{{ this.noteId ? 'Save':'Add'}} Card</el-button>
                </div>
                <v-md-editor class='frontEditor' ref='frontEditor' v-model="editor.frontContent" height="400px" :placeholder='frontPlaceholder' autofocus right-toolbar='preview' :disabled-menus='[]' @upload-image='uploadFrontImage' :before-preview-change='processFrontContent'></v-md-editor>
            </el-main>
        </div>
        <div id='backEditor'>
            <el-main style='margin-top: 50px;' v-loading='editor.backLoading'>
                <h2>Back</h2>
                <v-md-editor id='backEditor' v-model="editor.backContent" height="400px" placeholder='Add Content...' right-toolbar='preview' :disabled-menus='[]' @upload-image='uploadBackImage'></v-md-editor>
            </el-main>
        </div>
    </el-main>

    <el-footer style='display: flex; margin-top: 20px;'>
        <div class='flex-spacer'></div>
        <el-button type='primary' :disabled='submittingNote' @click='submitNote'>{{ this.noteId ? 'Save':'Add'}} Card</el-button>

    </el-footer>

</div>

</template>

<script>
import useFlashcards from '../composables/UseFlashcards'
import { setThemeColor } from '../utils'

const { getDecks, uploadImage, createNote, loadNote, deleteNote } = useFlashcards()

const CLOZE_COLORS = ['red', 'orange', 'green', 'blue', 'purple']

export default {
    setup() {
        
    },
    created() {
        window.addEventListener('keydown', this.keyListener)
    },
    destroyed() {
        window.removeEventListener('keydown', this.keyListener)
    },
    mounted() {
        this.loadDeckSelectOptions()
        console.log(this.$refs.frontEditor)

        const textareas = document.getElementsByTagName('textarea')
        for (let i = 0; i < textareas.length; i++) {
            textareas[i].spellcheck = true
        }

        if (this.noteId) this.loadExistingNote()
    },  
    data() {
        return {
            deckId: this.$route.params.deckId,
            deckSelect: {
                options: [],
                value: this.$route.params.deckId,
                loading: true
            },
            editor: {
                frontContent: '',
                frontLoading: false,
                backContent: '',
                backLoading: false
            },
            submittingNote: false,
            noteId: this.$route.params.noteId,
            frontPlaceholder: `For a simple front/back card, just enter text for the front and back. 

For a fill-in-the-blank style card, write a sentence here, select the text you want to hide, and use the keyboard shortcut Cmd+Shift+C to hide it. The 'back' field can then be used to show extra content once the card is flipped.`
        }
    },
    methods: {
        keyListener(e) {
            
            if (e.metaKey && e.shiftKey && e.key.toLowerCase() == 'c') {
                e.preventDefault()
                const id = e.target?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.id
                if (id == 'frontEditor') this.addCloze(false)
            }
            else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == 'c') {
                e.preventDefault()
                const id = e.target?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.id
                if (id == 'frontEditor') this.addCloze(true)
            }

        }, 
        loadExistingNote() {
            this.submittingNote = true
            loadNote(this.noteId).then(result => {
                this.editor.frontContent = result.frontContent
                this.editor.backContent = result.backContent
            }).catch(error => {

            }).finally(() => {
                this.submittingNote = false
            })
        },  
        loadDeckSelectOptions() {
            this.deckSelect.loading = true
            getDecks().then(result => {
                this.deckSelect.options = result
                for (let i = 0; i < result.length; i++) {
                    if (result[i].id == this.deckId) {
                        setThemeColor(result[i].primaryColor, document.documentElement)
                    }
                }
            }).catch(error => {

            }).finally(() => this.deckSelect.loading = false)
        },
        onDeckSelectChange(value) {
            this.deckId = value
            this.$router.push({ 
                name: 'Create Cards',
                params: {
                    deckId: value
                }
            })
            this.loadDeckSelectOptions()
        },

        uploadFrontImage(event, insertImage, files) {
            if (files.length > 0) this.uploadImage(true, insertImage, files[0])
        },

        uploadBackImage(event, insertImage, files) {
            if (files.length > 0) this.uploadImage(false, insertImage, files[0])
        },

        uploadImage(isFront, insertImage, file) {
            if (isFront) this.editor.frontLoading = true
            else this.editor.backLoading = true

            uploadImage(file).then(imageUrl => {
                console.log(imageUrl)
                insertImage({

                    url: imageUrl,
                    desc: 'New Image'

                })
            }).catch(error => {

            }).finally(() => {
                if (isFront) this.editor.frontLoading = false
                else this.editor.backLoading = false
            })
        },

        processFrontContent(text, next) {
            const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g;

            text = text.replaceAll(clozeRegexp, (full, num, content, hint) => {
                return `<span style='color: ${CLOZE_COLORS[num - 1]}; font-weight: bold'>[${hint ? hint : '...'}]</span>`
            })

            next(text)
        },

        addCloze(keepIndex) {

            //Get current cloze index
            const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g;
            const occurences = [...this.editor.frontContent.matchAll(clozeRegexp)]
            const clozeNums = occurences.map(match => Number(match[1]))
            
            let currentIndex = 1

            if (clozeNums.length > 0) currentIndex = Math.max(...clozeNums) + (keepIndex ? 0:1)
    

            this.$refs.frontEditor.insert((selected) => {
                const prefix = `{{c${currentIndex}::`
                const suffix = '}}'
                const content = selected || ''

                return {
                    text: `${prefix}${content}${suffix}`,
                    selected: content
                }
            })
        },

        submitNote() {
            
            this.submittingNote = true

            if (this.noteId) {
                deleteNote(this.noteId).then(() => {
                    this.createNote(this.noteId)
                }).catch(error => {
                    this.submittingNote = false
                })
            } 
            else this.createNote()
            

        },
        createNote(noteId) {
            createNote(this.deckSelect.value, this.editor.frontContent, this.editor.backContent, noteId).then(result => {
                if (!noteId) {
                    this.editor.frontContent = ''
                    this.editor.backContent = ''
                }
            }).catch(error => {
                console.error(error)
            }).finally(() => this.submittingNote = false)
        }
    }
}

</script>

<style scoped>

.content {
    margin: 40px;
}

.header h1 {
    margin-right: 20px;
    /*color: var(--el-color-primary);*/
}
.header {
    display: flex;
    align-items: center;
    border-bottom: var(--el-color-primary) solid 3px;
    margin-left: 20px;
    margin-right: 20px;
}

.main-content {
    padding: 0px;
}

.return-link {
    display: flex;
    align-items: center;
    font-size: 15px;
    margin-top: 20px;
    transition: 0.2s;
}

.return-link:hover {
    cursor: pointer;
    text-decoration: underline;
}

.return-link el-icon {
    margin-right: 50px;
}

h2 {
    margin-bottom: 20px;
}
</style>