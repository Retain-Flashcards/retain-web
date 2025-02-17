<template>

    <div class='content'>
        <div class='breadcrumb' style='margin-left: 20px;margin-bottom: 30px;'>
            <div class='return-link' @click='() => { router.push({ name: "View Deck", params: { deckId: deckId } }) }'>
                <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
            </div>
        </div>
        <div class='header'>
            <h1>Add AI Cards</h1>
            <div class='flex-spacer'></div>
            <span style='margin-right: 10px;'>To deck: </span>
            <el-select v-model='deckSelect.value' placeholder='to deck...' :loading='deckSelect.loading' @change='onDeckSelectChange' style='width: 200px'>
                <el-option v-for='item in deckSelect.options' :key='item.id' :label='item.title' :value='item.id'>
    
                </el-option>
            </el-select>
        </div>
    
        <el-main class='main-content'>
            <div id='tags'>
                <el-main>
                    <h2>Tags</h2>
                    <el-select-v2 
                        v-model='editor.tags' 
                        :loading='editor.tagsLoading' 
                        multiple 
                        filterable 
                        allow-create 
                        placeholder='Add tags...' 
                        style='width: 100%;' 
                        @change='onTagsChanged'
                        tag-type='danger'
                        :options='deckTags.options'
                        :props='{label: "name", value: "id"}'
                        no-data-text='Start Typing to Create a Tag...'>
                        <template #default='{ item }'>
                            <span>{{ item.name }}</span>
                        </template>
                        <!--<template #tag>
                            {{ item }}
                            <el-tag v-for="tag in value" :key="tag.id" type='primary'/>
                        </template>-->
                        <!--<el-option v-for='tag in deckTags.options' :key='tag.id' :label='tag.name' :value='tag.id'>
    
                        </el-option>-->
                    </el-select-v2>
                </el-main>
            </div>

            <div style='display: flex; padding-left: 20px; padding-right: 20px; height: 600px'>
                <div style='background: #f5f5f5; margin-right: 5px; padding: 20px; width: 50%; border-radius: 20px; overflow-y: scroll;'>
                    <div v-loading='loadingFile' v-if='!pdfUrl' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;'>
                        <h4>Upload PDF Here</h4>
                        <input type='file' @change='uploadPDFHandler' style='display: none;' ref='fileInput' accept='application/pdf' />
                        <p style='width: 50%'>The AI Card Builder allows you to take screenshots of your notes and have cards automatically generated from them.</p>
                        <el-button type='primary' style='margin-top: 20px;' @click='clickFileUpload'>Upload PDF</el-button>
                    </div>
                    <div v-else-if='loadingFile' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;'>
                        <h4>Loading PDF...</h4>
                        <el-spinner style='margin-top: 20px;'></el-spinner>
                    </div>
                    <div v-else @mousedown='beginCrop' @mousemove='updateCrop' @mouseup='endCrop' style='position: relative'>
                        <div>
                            <PDFViewer @scroll='onPDFScroll' :controller='pdfViewerController' :pdfUrl='pdfUrl'/>
                        </div>
                        <div id='frame' ref='cropFrame' style='display: none;'></div>
                    </div>
                </div>
                <div style='width: 50%; padding: 10px; margin-left: 5px; border: 2px solid #f5f5f5; border-radius: 20px;'>
                    <AiChat :loading='aiChatLoading' :imageUrl='currentImageUrl' :deckId='deckId' />
                </div>
            </div>
            <!--
            <div id='frontEditor'>
                <el-main v-loading='editor.frontLoading'>
                    <div style='display: flex; width: 100%; align-items: center;'>
                        <h2>Front</h2>
                        <div class='flex-spacer'></div>
                        <el-button type='primary' :disabled='submittingNote' @click='submitNote'>{{ noteId ? 'Save':'Add'}} Card</el-button>
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
            -->
        </el-main>
    
    </div>
    
</template>
    
<script setup>
    import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import useFlashcards from '../composables/UseFlashcards'
    import { setThemeColor } from '../utils'
    import PDFViewer from '../components/PDFViewer.vue'
    import AiChat from '../components/AiChat.vue'
    import PdfViewerController from '../model/PdfViewerController'

    const route = useRoute()
    const router = useRouter()
    
    const { getDecks, uploadImage, uploadPNGFromDataURL, uploadPDF, createNote, loadNote, deleteNote, loadNoteTags, addTagToNote, loadDeckTags, createTag, deleteTagFromNote } = useFlashcards()
    
    const CLOZE_COLORS = ['red', 'orange', 'green', 'blue', 'purple']

    const fileInput = ref(null)

    function clickFileUpload() {
        fileInput.value.click()
    }

    const deckId = ref(route.params.deckId)
    const fileList = ref([])
    const loadingFile = ref(false)
    const pdfUrl = ref('')
    const cropFrame = ref(null)
    const aiChatLoading = ref(false)
    const currentImageUrl = ref('')

    const pdfViewerController = new PdfViewerController(600)

    const cropRect = ref({
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        isDragging: false
    })

    watch(cropRect.value, (newVal, oldVal) => {
        const frame = cropFrame.value
        const x = Math.min(newVal.startX, newVal.endX)
        const y = Math.min(newVal.startY, newVal.endY)
        const width = Math.abs(newVal.startX - newVal.endX)
        const height = Math.abs(newVal.startY - newVal.endY)
        frame.style.width = `${width}px`
        frame.style.height = `${height}px`
        frame.style.left = `${x}px`
        frame.style.top = `${y}px`
    })

    const deckSelect = ref({
        options: [],
        value: route.params.deckId,
        loading: true
    })
    const deckTags = ref({
        loading: true,
        options: []
    })
    const editor = ref({
        frontContent: '',
        frontLoading: false,
        backContent: '',
        backLoading: false,
        tagsLoading: false,
        tags: []
    })
    const noteTags = ref([])
    const submittingNote = ref(false)
    const frontPlaceholder = ref(`For a simple front/back card, just enter text for the front and back. 
    
    For a fill-in-the-blank style card, write a sentence here, select the text you want to hide, and use the keyboard shortcut Cmd+Shift+C to hide it. The 'back' field can then be used to show extra content once the card is flipped.`)

    function onPDFScroll() {
        cropFrame.value.style.display = 'none'
    }

    function takeScreenshot() {
        const cropRect = cropFrame.value.getBoundingClientRect()
        const url = pdfViewerController.takeScreenshot(cropRect)
        aiChatLoading.value = true
        uploadPNGFromDataURL(url).then(result => {
            currentImageUrl.value = result
        }).catch(error => {
            console.error(error)
        }).finally(() => {
            aiChatLoading.value = false
        })
    }

    function beginCrop(event) {
        cropFrame.value.style.display = 'block'
        const rect = cropFrame.value.parentElement.getBoundingClientRect()
        cropRect.value.startX = event.clientX - rect.left
        cropRect.value.startY = event.clientY - rect.top
        cropRect.value.endX = cropRect.value.startX
        cropRect.value.endY = cropRect.value.startY
        cropRect.value.isDragging = true
    }

    function updateCrop(event) {
        if (cropRect.value.isDragging == false) return
        const rect = cropFrame.value.parentElement.getBoundingClientRect()
        cropRect.value.endX = event.clientX - rect.left
        cropRect.value.endY = event.clientY - rect.top
    }

    function endCrop(event) {
        const rect = cropFrame.value.parentElement.getBoundingClientRect()
        cropRect.value.endX = event.clientX - rect.left
        cropRect.value.endY = event.clientY - rect.top
        cropRect.value.isDragging = false
        takeScreenshot()
    }

    const frontEditor = ref(null)

    const keyListener = (e) => {
        if ((e.metaKey || e.keyCode == 91) && e.shiftKey && e.key.toLowerCase() == 'c') {
            e.preventDefault()
            const id = e.target?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.id
            if (id == 'frontEditor') addCloze(false)
        }
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == 'c') {
            e.preventDefault()
            const id = e.target?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.id
            if (id == 'frontEditor') addCloze(true)
        }
    }


    function uploadPDFHandler(event) {
        loadingFile.value = true
        fileList.value = event.target.files

        const file = fileList.value[0]
        uploadPDF(file).then(result => {
            pdfUrl.value = result
        }).catch(error => {
        }).finally(() => {
            loadingFile.value = false
        })
    }


    async function onTagsChanged(value) {
    
        deckTags.value.loading = true

        //Check to see if there are any new tags; if so, add them to the deck
        const currentDeckTags = deckTags.value.options.map(tag => tag.id)
        
        //If there are any new tags, load the tag selector and add the new tags to the deck
        for (let i = 0; i < value.length; i++) {
            if (currentDeckTags.includes(value[i])) continue
            try {
                const result = await createTag(deckId.value, value[i])
                value[i] = result[0].id
            } catch (error) {
            }
        }

        //Reload the deck tags to include the new tags
        try {
            const result = await loadDeckTags(deckId.value)
            deckTags.value.options = result
            editor.value.tags = value
        } catch (error) {
            editor.value.tags = editor.value.tags.filter(tag => currentDeckTags.includes(tag))
        }

        //Next, sync the editor tags with the ones on the note
        deckTags.value.loading = false
    }

    function loadDeckSelectOptions() {
        deckSelect.value.loading = true
        deckTags.value.loading = true
        getDecks().then(result => {
            deckSelect.value.options = result
            for (let i = 0; i < result.length; i++) {
                if (result[i].id == deckId.value) {
                    setThemeColor(result[i].primaryColor, document.documentElement)
                }
            }
        }).catch(error => {

        }).finally(() => deckSelect.value.loading = false)

        loadDeckTags(deckId.value).then(result => {
            deckTags.value.options = result
        }).catch(error => {

        }).finally(() => deckTags.value.loading = false)  
    }

    function onDeckSelectChange(value) {
        deckId.value = value
        router.push({ 
            name: 'Create Cards',
            params: {
                deckId: value
            }
        })
        loadDeckSelectOptions()
    }

    function uploadFrontImage(event, insertImage, files) {
        if (files.length > 0) uploadImageHandler(true, insertImage, files[0])
    }
    function uploadBackImage(event, insertImage, files) {
        if (files.length > 0) uploadImageHandler(false, insertImage, files[0])
    }

    function uploadImageHandler(isFront, insertImage, file) {
        if (isFront) editor.value.frontLoading = true
        else editor.value.backLoading = true

        uploadImage(file).then(imageUrl => {
            insertImage({

                url: imageUrl,
                desc: 'New Image'

            })
        }).catch(error => {

        }).finally(() => {
            if (isFront) editor.value.frontLoading = false
            else editor.value.backLoading = false
        })
    }

    function processFrontContent(text, next) {
        const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g;

        text = text.replaceAll(clozeRegexp, (full, num, content, hint) => {
            return `<span style='color: ${CLOZE_COLORS[num - 1]}; font-weight: bold'>[${hint ? hint : '...'}]</span>`
        })

        next(text)
    }

    function addCloze(keepIndex) {
        
        //Get current cloze index
        const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g;
        const occurences = [...editor.value.frontContent.matchAll(clozeRegexp)]
        const clozeNums = occurences.map(match => Number(match[1]))
        
        let currentIndex = 1

        if (clozeNums.length > 0) currentIndex = Math.max(...clozeNums) + (keepIndex ? 0:1)


        frontEditor.insert((selected) => {
            const prefix = `{{c${currentIndex}::`
            const suffix = '}}'
            const content = selected || ''

            return {
                text: `${prefix}${content}${suffix}`,
                selected: content
            }
        })
    }

    async function submitNote() {
        
        submittingNote.value = true
 
        let noteId = await createNoteHandler()

        //Find new tags and add them
        for (let i = 0; i < editor.value.tags.length; i++) {
            if (noteTags.value.map(tag => tag.id).includes(editor.value.tags[i])) continue
            try {
                const result = await addTagToNote(noteId, editor.value.tags[i])
            } catch (error) {
                editor.value.tags = editor.value.tags.filter(tag => tag != editor.value.tags[i])
                break
            }
        }

        //Reload the note tags
        noteTags.value = await loadNoteTags(noteId)

        //Find tags to remove and remove them
        let tagsToRemove = []
        for (let i = 0; i < noteTags.value.length; i++) {
            if (editor.value.tags.includes(noteTags.value[i].id)) continue
            try {
                if (noteTags.value[i].id == undefined) {
                    tagsToRemove.push(noteTags.value[i].id)
                    continue
                } 
                const result = await deleteTagFromNote(noteId, noteTags.value[i].id)
                tagsToRemove.push(noteTags.value[i].id)
            } catch (error) {
                editor.value.tags.push(noteTags.value[i].id)
                console.error(error)
            }
        }
        if (noteId.value) noteTags.value = noteTags.value.filter(tag => !tagsToRemove.includes(tag.id))
        else noteTags.value = []

    }

    async function createNoteHandler(noteId) {
        const result = await createNote(deckSelect.value.value, editor.value.frontContent, editor.value.backContent, noteId)
        
        if (!noteId) {
            editor.value.frontContent = ''
            editor.value.backContent = ''
        }
        submittingNote.value = false

        return result[0].note_id
    }

    onMounted(() => {
        window.addEventListener('keydown', keyListener)
        loadDeckSelectOptions()

        const textareas = document.getElementsByTagName('textarea')
        for (let i = 0; i < textareas.length; i++) {
            textareas[i].spellcheck = true
        }
    })

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', keyListener)
    })


</script>
    
<style scoped>

    #screenshotDisplay {
        max-height: 100px;
    }

    #frame {
        width: 100px;
        height: 100px;
        background-color: black;
        opacity: 0.4;
        position: absolute;
        cursor: pointer;
    }
    
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