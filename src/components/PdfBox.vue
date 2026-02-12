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
        <template #default>
            <div v-if='!pdfUrl' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;'>
                <h4>Upload PDF Here</h4>
                <input type='file' @change='uploadPDFHandler' style='display: none;' ref='fileInput' accept='application/pdf' />
                <p style='width: 50%'>Once you upload your PDF, you can select a region to screenshot and add to your cards.</p>
                <brand-button type='primary' style='margin-top: 20px;' @click='clickFileUpload' icon='file-arrow-up'>Upload PDF</brand-button>
            </div>
            <div v-else @mousedown='beginCrop' @mousemove='updateCrop' @mouseup='endCrop' style='position: relative; overflow-y: auto; max-height: 100%;'>
                <div style='height: 100%;'>
                    <PDFViewer @scroll='onPDFScroll' :controller='pdfViewerController' :pdfUrl='pdfUrl'/>
                </div>
                <div id='frame' ref='cropFrame' style='display: none;'></div>
            </div>
        </template>
    </loadable-provider>
</div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch } from 'vue'

import PDFViewer from './PDFViewer.vue'
import BrandButton from './basic/BrandButton.vue'
import LoadableProvider from './basic/providers/LoadableProvider.vue'
import AppSpinner from './basic/AppSpinner.vue'
import ErrorPage from './basic/errorHandling/ErrorPage.vue'

import useLoadable from '../composables/ui/useLoadable'
import useStorage from '../composables/api/useStorage'
import useNotificationService from '../composables/ui/useNotificationService'
import PDFViewerController from '../model/PdfViewerController'
import { useKeyDownBinding } from '../composables/keybindings'

const {
    uploadImage,
    uploadPNGFromDataURL,
    uploadPDF
} = useStorage()

const notificationService = useNotificationService()

const emit = defineEmits(['screenshot'])

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
    const url = await uploadPDF(file)
    pdfUrl.value = url
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
    pdfLoadable.load()
}

onMounted(() => {
    
})

</script>

<style scoped>
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