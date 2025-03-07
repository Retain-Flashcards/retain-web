<template>
<div class='viewer-container' ref='loadingContainer' v-loading='isLoading'>
    <div class='pdf-viewer' @scroll='emit("scroll")' style='width: 100%; overflow-y: scroll;' ref='container'>
    </div>

</div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.min.mjs'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'
import PDFCanvas from './PDFCanvas.vue'

const emit = defineEmits(['scroll'])
const props = defineProps(['controller', 'pdfUrl'])

GlobalWorkerOptions.workerPort = new pdfjsWorker.default()
const pdfUrl = props.pdfUrl

const container = ref(null)
const loadingContainer = ref(null)

const isLoading = ref(true)

let canvases = []

const loadPdf = async () => {
  const pdf = await getDocument(pdfUrl).promise  
  return pdf
}

function canvasFromCropRect(cropRect) {
    for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i]
        const canvasRect = canvas.canvas.getBoundingClientRect()
        const canvasTop = canvasRect.top
        const canvasBottom = canvasRect.bottom
        const cropTop = cropRect.top
        const cropBottom = cropRect.bottom

        console.log(
            'Canvas top:', canvasTop,
            'Canvas bottom:', canvasBottom,
            'Crop top:', cropTop,
            'Crop bottom:', cropBottom
        )

        if (cropTop >= canvasTop && cropBottom <= canvasBottom) {
            return canvas
        }
    }

    return null
}

function screenshotFromCropRect(cropRect) {
    const canvas = canvasFromCropRect(cropRect)
    console.log('Canvas', canvas)
    if (canvas) {
        const canvasRect = canvas.canvas.getBoundingClientRect()
        const topOffset = cropRect.top - canvasRect.top
        const leftOffset = cropRect.left - canvasRect.left
        const canvasContext = canvas.canvas.getContext('2d', {
            willReadFrequently: true
        })
        const imageData = canvasContext.getImageData(leftOffset, topOffset, cropRect.width, cropRect.height)

        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = cropRect.width
        tempCanvas.height = cropRect.height
        const tempContext = tempCanvas.getContext('2d', {
            willReadFrequently: true
        })
        tempContext.putImageData(imageData, 0, 0)
        return tempCanvas.toDataURL()
    }

    return null
}

const renderPdf = async () => {
    const pdf = await loadPdf()

    //const outputScale = window.devicePixelRatio || 1
    let promises = []
    canvases = []

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1)
        const pageViewport = page.getViewport({ scale: 1 })
        const scale = container.value.offsetWidth / pageViewport.width
        const scaledViewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
        canvas.height = scaledViewport.height
        canvas.width = container.value.offsetWidth
        container.value.appendChild(canvas)

        canvases.push(
            {
                canvas,
                height: scaledViewport.height
            }
        )

        const context = canvas.getContext('2d', {
            willReadFrequently: true
        })
        const renderContext = {
            canvasContext: context,
            viewport: scaledViewport
        }

        promises.push( page.render(renderContext).promise )

    }
    
    await Promise.all(promises)
}

onMounted(() => {
    console.log('Setting up PDF viewer')
    console.log(props.controller)
    loadingContainer.value.style.height = props.controller.height + 'px'
    container.value.style.height = props.controller.height + 'px'

    props.controller.attach(screenshotFromCropRect)

    renderPdf().then(() => {
        isLoading.value = false
    })

})

</script>

<style scoped>
.pdf-viewer {
    cursor: crosshair;
}
</style>