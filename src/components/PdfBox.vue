<template>
<div style='background: #f5f5f5; padding: 20px; width: 100%; height: 100%; border-radius: 20px; box-sizing: border-box;'>
    <loadable-provider :loadable='pdfLoadable'>
        <template #loading>
            <div style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;'>
                <h4>Loading PDF...</h4>
                <app-spinner />
            </div>
        </template>
        <template #error>
            <error-page message='A problem occurred while loading the PDF.' />
        </template>
        <template #default='{ loading }'>
            <div v-if='!pdfUrl' style='width: 100%; height: 100%;'>
                <div class='notes-header'>
                    <h3>Your Notes</h3>
                    <div class='flex-spacer'></div> 
                    <brand-button size='small' :disabled='pdfListLoadable.isLoading' :plain='true' type='info' icon='fa-refresh' @click='() => { pdfListLoadable.load() }'></brand-button>
                    <brand-button size='small' type='primary' style='margin-left: 10px;' @click='clickFileUpload' icon='file-arrow-up'>Upload</brand-button>
                </div>

                <loadable-provider :loadable='pdfListLoadable'>
                    <template #loading>
                        <app-spinner size='medium'/>
                    </template>
                    <template #error>
                        <error-page message='A problem occurred while loading the PDFs.' />
                    </template>
                    <template #default="{ data: pdfs }">
                        <pdf-item v-for='pdf in pdfs' :title='pdf.user_metadata?.title ?? "Untitled PDF"' :id='pdf.id' :loading='pdf.loading' @delete='deletePdf' :date='pdf.created_at' @select='(id) => { loadPdf(pdf.filePath)} '/>
                        <div style='width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-top: 20px; color: #838383;'>
                            <p style='width: 50%'>Once you select a PDF to open, you can select a region to screenshot and add to your cards.</p>
                        </div>
                    </template>
                    <template #empty>
                        <div style='width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-top: 20px; color: #838383;'>
                            <p style='width: 50%'>Upload your notes as a PDF to get started. Take screenshots directly from your notes to create cards.</p>
                        </div>
                    </template>
                </loadable-provider>
                <input type='file' @change='uploadPDFHandler' style='display: none;' ref='fileInput' accept='application/pdf' />
            </div>
            <div v-else style='position: relative; overflow-y: auto; max-height: 100%;'>
                <div style='height: 100%;' @mousedown='beginCrop' @mousemove='updateCrop' @mouseup='endCrop'>
                    <PDFViewer @scroll='onPDFScroll' :controller='pdfViewerController' :pdfUrl='pdfUrl'/>
                </div>
                <div id='frame' ref='cropFrame' style='display: none;'></div>
            </div>
            <div v-if='pdfUrl' class='pdf-box-esc'>
                <font-awesome-icon icon='fa-close' @click.prevent='closePdf' />
            </div>
        </template>
    </loadable-provider>



    <soft-dialog :modal='pdfTitleModal' title='Enter a title for your PDF'>
        <soft-input v-model='pdfTitleModal.state.title' placeholder='Title' />
        <brand-button style='margin-top: 10px;' @click='savePDFTitle' type='primary'>Save</brand-button>
    </soft-dialog>
</div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch } from 'vue'

import PDFViewer from './PDFViewer.vue'
import BrandButton from './basic/BrandButton.vue'
import LoadableProvider from './basic/providers/LoadableProvider.vue'
import AppSpinner from './basic/AppSpinner.vue'
import ErrorPage from './basic/errorHandling/ErrorPage.vue'
import PdfItem from './PdfItem.vue'
import SoftDialog from './basic/soft-ui/SoftDialog.vue'
import SoftInput from './basic/soft-ui/SoftInput.vue'

import useLoadable from '../composables/ui/useLoadable'
import useStorage from '../composables/api/useStorage'
import useNotificationService from '../composables/ui/useNotificationService'
import PDFViewerController from '../model/PdfViewerController'
import { useKeyDownBinding } from '../composables/keybindings'
import useModal from '../composables/ui/useModal'

const {
    uploadImage,
    uploadPNGFromDataURL,
    uploadPDF,
    listNotePdfs,
    getPublicUrl,
    deleteNote
} = useStorage()

const notificationService = useNotificationService()

const emit = defineEmits(['screenshot', 'pdf-closed'])

const pdfTitleModal = useModal({ title: 'Untitled PDF' })

const fileInput = ref(null)

function clickFileUpload() {
    fileInput.value.click()
}

useKeyDownBinding('Escape', cancelCrop)

const fileList = ref([])
const pdfUrl = ref('')
const cropFrame = ref(null)
const currentImageUrl = ref('')

const pdfViewerController = new PDFViewerController(600)

const cropRect = ref({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isDragging: false
})


//Uploads a PDF and gets url
const pdfLoadable = useLoadable(async () => {
    const file = fileList.value[0]
    const url = await uploadPDF(file, pdfTitleModal.state.title)
    pdfUrl.value = url

    pdfListLoadable.load()
})

const pdfListLoadable = useLoadable(async () => {
    const pdfs = await listNotePdfs()
    return pdfs
}, { autoload: true })


function loadPdf(path) {
    const url = getPublicUrl(path)
    pdfUrl.value = url
}


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

function onPDFScroll() {
    cropFrame.value.style.display = 'none'
}

function takeScreenshot() {
    const cropRect = cropFrame.value.getBoundingClientRect()
    const url = pdfViewerController.takeScreenshot(cropRect)

   emit('screenshot', url)
}

function beginCrop(event) {
    cropFrame.value.style.display = 'block'
    const parent = cropFrame.value.parentElement
    const rect = parent.getBoundingClientRect()
    cropRect.value.startX = event.clientX - rect.left + parent.scrollLeft
    cropRect.value.startY = event.clientY - rect.top + parent.scrollTop
    cropRect.value.endX = cropRect.value.startX
    cropRect.value.endY = cropRect.value.startY
    cropRect.value.isDragging = true
}

function updateCrop(event) {
    if (cropRect.value.isDragging == false) return
    const parent = cropFrame.value.parentElement
    const rect = parent.getBoundingClientRect()
    cropRect.value.endX = event.clientX - rect.left + parent.scrollLeft
    cropRect.value.endY = event.clientY - rect.top + parent.scrollTop
}

function endCrop(event) {
    if (!cropRect.value.isDragging) return
    if (!pdfUrl.value) return
    const parent = cropFrame.value.parentElement
    const rect = parent.getBoundingClientRect()
    cropRect.value.endX = event.clientX - rect.left + parent.scrollLeft
    cropRect.value.endY = event.clientY - rect.top + parent.scrollTop
    cropRect.value.isDragging = false
    takeScreenshot()
    cropFrame.value.style.display = 'none'
    notificationService.success('Screenshot copied to clipboard')
}

function cancelCrop() {
    if (cropFrame.value) {
        cropFrame.value.style.display = 'none'
        cropRect.value.isDragging = false
    }
}



function uploadPDFHandler(event) {
    fileList.value = event.target.files
    pdfTitleModal.openWithState({ title: 'Untitled PDF' })
}

function savePDFTitle() {
    pdfTitleModal.close()
    pdfLoadable.load()
}

function deletePdf(id) {
    for (let pdf of pdfListLoadable.value) {
        if (pdf.id == id) {
            pdf.loading = true
            deleteNote(pdf.filePath).then(() => {
                pdfListLoadable.loadSilently()
            })
            return
        }
    }
}

function closePdf() {
    pdfUrl.value = ''
    emit('pdf-closed')
}

onMounted(() => {
    
})

</script>

<style scoped>
.notes-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgb(182, 182, 182);
    margin-bottom: 10px;
}

.pdf-box-esc {
    position: absolute;
    top: 40px;
    right: 50px;
    border: solid 1px var(--el-color-primary);
    color: var(--el-color-primary);
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 7px;
    cursor: pointer;
    z-index: 1000;
    transition: background-color 0.2s ease;
    transition: color 0.2s ease;
}

.pdf-box-esc:hover {
    background-color: var(--el-color-primary);
    color: white;
}

#frame {
    width: 100px;
    height: 100px;
    background-color: var(--el-color-primary);
    opacity: 0.4;
    position: absolute;
    cursor: pointer;
    border-radius: 3px;
}
</style>