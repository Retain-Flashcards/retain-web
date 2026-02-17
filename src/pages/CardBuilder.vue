<template>
<div class='content'>

    <div class='breadcrumb' style='margin-left: 20px;'>
        <return-link @click='() => { router.push({ name: "View Deck", params: { deckId: deckId } }) }'>
            Return to deck
        </return-link>
    </div>

    <!--Edit/Add Card Header-->
    <div class='header'>
        <h2>{{ noteId ? 'Edit Card':'Create Cards'}}</h2>
        <div class='flex-spacer'></div>

        <!--Deck selector if you're adding cards (easy switching)-->
        <template v-if='!noteId'>
            <span style='margin-right: 10px;'>To deck: </span>
            <loadable-state-provider :loadable='deckSelectLoadable' v-slot='{ loading, data: options}'>
                <el-select v-model='deckId' placeholder='to deck...' :loading='loading' @change='() => {}' style='width: 200px'>
                    <el-option v-for='item in options' :key='item.id' :label='item.title' :value='item.id'></el-option>
                </el-select>
            </loadable-state-provider>
        </template>
    </div>

    <el-main class='main-content'>
        <div id='tags'>
            <el-main class='tags-container'>
                <h3>Tags</h3>
                <loadable-state-provider :loadable='tagsLoadable' v-slot='{ loading, data: tagOptions }'>
                    <el-select-v2 
                        v-model='tags' 
                        :loading='loading' 
                        multiple 
                        filterable 
                        allow-create 
                        placeholder='Use tags to further organize your cards within the deck' 
                        style='width: 100%;' 
                        @change='() => {}'
                        tag-type='danger'
                        :options='tagOptions'
                        :props='{label: "name", value: "id"}'
                        no-data-text='Start Typing to Create a Tag...'>
                        <template #default='{ item }'>
                            <span>{{ item.name }}</span>
                        </template>
                    </el-select-v2>
                </loadable-state-provider>
            </el-main>
        </div>

        <!--Main Content Editor-->
        <loadable-provider :loadable='noteLoadable'>
            <template #default='{ loading, data: note }'>
                <div class='layout-container'>
                    <div v-if='!noteId' class='pdf-panel' :class='{ collapsed: !isPdfPanelOpen }'>
                        <KeyBindingProvider>
                            <div class='pdf-panel-inner'>
                                <pdf-box @screenshot='copyImageFromDataUrl' @pdf-closed='closeSuggestedCards'></pdf-box>
                                <div class='suggested-cards-container' v-if='displayingSuggestedCards'>
                                    <premium-content>
                                        <div class='suggested-cards-header'>
                                            <span class='suggested-cards-title'><font-awesome-icon icon="fa-wand-magic-sparkles"/> AI Card Suggestions</span>
                                            <span class='suggested-cards-hint'>(hover to preview)</span>
                                            <span style='flex: 1;'></span>
                                            <span class='suggested-cards-close' @click='closeSuggestedCards'><font-awesome-icon icon='fa-close'></font-awesome-icon></span>
                                        </div>

                                        <div class='suggested-cards-list'>
                                            <loadable-provider :loadable='suggestedCardLoadable'>
                                                <template #default='{ loading, data: cards }'>
                                                    <card-message v-for='(card, index) in cards' :key='index' :content='card' @add-card='addSuggestedCard' @click='useSuggestedCard' @startPreview='startPreview' @endPreview='endPreview'></card-message>
                                                </template>
                                                <template #error>
                                                    <div class='suggested-cards-error'>
                                                        <span>An error occurred while generating cards.</span>
                                                    </div>
                                                </template>
                                                <template #loading>
                                                    <app-spinner size='small'/>
                                                </template>
                                            </loadable-provider>
                                        </div>

                                        <template #nonSubscriber>
                                            <div class='suggested-cards-promo'><font-awesome-icon icon="fa-wand-magic-sparkles" style='color: var(--el-color-primary)'/>Get AI Card Suggestions<div class='flex-spacer'></div><brand-button @click='upgrade' type='primary'><premium-marker/>Upgrade</brand-button></div>
                                        </template>
                                    </premium-content>
                                    
                                    
                                </div>
                            </div>
                        </KeyBindingProvider>
                    </div>
                    <KeyBindingProvider>
                        <div class='editor-container'>
                            <!--Formatting Toolbar-->
                            <div class='toolbar-container'>
                                <div style='flex: 1; display: flex;'>
                                    <brand-button v-if='!noteId' :icon='isPdfPanelOpen ? "fa-regular fa-square-caret-left" : "fa-regular fa-square-caret-right"' :type='isPdfPanelOpen ? "primary" : "info"' :plain='true' size='small' @click='isPdfPanelOpen = !isPdfPanelOpen'>{{ isPdfPanelOpen ? 'Close Notes': 'Open Notes' }}</brand-button>
                                    <div style='flex: 1;'></div>
                                </div>
                                <formatting-toolbar :link-handler='linkHandler' :image-handler='imageHandler'></formatting-toolbar>
                                
                                <div style='flex: 1; display: flex;'>
                                    <div style='flex: 1;'></div>
                                    <!--Save/Add Button-->
                                    <brand-button style='margin-left: 10px;' type='primary' @click='saveNote' :disabled='editorLoading'>{{ noteId ? 'Save':'Add' }} Card</brand-button>
                                </div>
                            </div>
                            <div class='editor'>
                            <h3>Front Side</h3>
                                <div id='frontEditor'>   
                                    <!--KeyBindingProvider allows for keyboard shortcuts-->
                                    <KeyBindingProvider>                                        
                                        <card-editor :cloze-enabled='true' :controller='frontEditorController'></card-editor>
                                    </KeyBindingProvider>
                                </div>
                            </div>
                            <div class='editor'>
                                <h3>Back Side</h3>
                                <div id='backEditor'> 
                                    <!--KeyBindingProvider allows for keyboard shortcuts-->
                                    <KeyBindingProvider>
                                        <card-editor :controller='backEditorController'></card-editor>
                                    </KeyBindingProvider>
                                </div>
                            </div>

                            <!--Link Modal-->
                            <el-dialog v-model='linkModal.isOpen' title='Insert Link' @close='linkModal.state.cancel()'>
                                <el-form-item label='Link URL'>
                                    <el-input v-model='linkModal.state.url'></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <brand-button type='primary' @click='() => linkModal.state.callback()'>Save</brand-button>
                                </el-form-item>
                            </el-dialog>
                        </div>
                    </KeyBindingProvider>
                </div>
            </template>
            <template #loading>
                <el-skeleton :rows='5'></el-skeleton>
            </template>
            <template #error>
                <error-page message='Failed to load card' ></error-page>
            </template>
        </loadable-provider>
    </el-main>

</div>

</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

//UI Components
import LoadableStateProvider from '../components/basic/providers/LoadableStateProvider.vue'
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import CardEditor from '../components/basic/cards/CardEditor.vue'
import FormattingToolbar from '../components/basic/cards/FormattingToolbar.vue'
import KeyBindingProvider from '../components/basic/providers/KeyBindingProvider.vue'
import ReturnLink from '../components/basic/ReturnLink.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import PdfBox from '../components/PdfBox.vue'
import CardMessage from '../components/CardMessage.vue'
import AppSpinner from '../components/basic/AppSpinner.vue'
import PremiumContent from '../components/PremiumContent.vue'
import PremiumMarker from '../components/basic/PremiumMarker.vue'

//Composables
import { useRouter, useRoute} from 'vue-router'
import useLoadable from '../composables/ui/useLoadable'
import useDecks from '../composables/api/useDecks'
import useDeck from '../composables/api/useDeck'
import useModal from '../composables/ui/useModal'
import useStorage from '../composables/api/useStorage'
import useNotes from '../composables/api/useNotes'
import useCards from '../composables/api/useCards'
import useCardEditor from '../composables/ui/useCardEditor'
import useNotificationService from '../composables/ui/useNotificationService'
import usePremiumFeature from '../composables/api/usePremiumFeature'

//Utils
import { setThemeColor } from '../utils'

const { uploadImage, convertImageToBlob, listNotePdfs } = useStorage()

const router = useRouter()
const route = useRoute()

const notificationService = useNotificationService()

const premiumFeature = usePremiumFeature()

//Data
const deckId = ref(route.params.deckId)
const noteId = ref(route.params.noteId)

const { fetchAllDecks } = useDecks()

const deck = computed(() => useDeck(deckId.value))
const notes = computed(() => useNotes(deckId.value))
const cardsOperations = computed(() => useCards(deckId.value))

const tags = ref([])
const isPdfPanelOpen = ref(true)
const displayingSuggestedCards = ref(false)

const frontEditorController = useCardEditor('')
const backEditorController = useCardEditor('')

const preview = ref({
    active: false,
    lastScreenshot: null,
    cachedFrontContent: null,
    cachedBackContent: null
})

//Loadables
const deckSelectLoadable = useLoadable(async () => {
    return await fetchAllDecks()
}, {
    initialValue: [], 
    autoload: true,
    onError: (e) => {}
})

const tagsLoadable = useLoadable(async () => {
    const results = await deck.value.loadTags()
    return results
}, {
    initialValue: [], 
    autoload: true,
    onError: (e) => notificationService.error('Failed to load tags')
})

watch(deckId, (_) => {
    tagsLoadable.load()
}, { immediate: true})


const noteLoadable = useLoadable(async () => {
    if (!noteId.value) return null
    const result = await notes.value.fetchNote(noteId.value)
    frontEditorController.setContent(result.frontContent)
    backEditorController.setContent(result.backContent)
    return result
}, {
    initialValue: null, 
    autoload: true
})

const suggestedCardLoadable = useLoadable(async (_, url) => {
    const cards = await cardsOperations.value.generateCards(url)
    displayingSuggestedCards.value = true
    return cards
}, {
    initialValue: [], 
    autoload: false
})

const saveNote = async () => {
    editorLoading.value = true
    try {
        if (!noteId.value) {
            await notes.value.createNote(frontEditorController.getClozeContent(), backEditorController.getClozeContent())
            frontEditorController.setContent('')
            backEditorController.setContent('')
        }
        else {
            await notes.value.editNote(noteId.value, frontEditorController.getClozeContent(), backEditorController.getClozeContent())
        }

        notificationService.success('Card saved successfully')
    } catch(e) {
        console.log(e)
        notificationService.error('Failed to save card')
    }
    finally {
        editorLoading.value = false
    }
}

//Update theme color with deck selection
watch(deckSelectLoadable.currentState, (newVals) => {
    const options = newVals.data
    if (options) {
        for (const deck of options) {
            if (deck.id == deckId.value) {
                setThemeColor(deck.primaryColor, document.documentElement)
                break
            }
        }
    }
}, { immediate: true })

const editorLoading = ref(false)

const linkModal = useModal({ url: '' })

async function linkHandler() {
    const promise = new Promise((resolve, reject) => {
        editorLoading.value = true
        linkModal.openWithState({ url: '', callback: () => {
            resolve()
            editorLoading.value = false
            linkModal.close()
        }, cancel: () => {
            reject() 
            editorLoading.value = false
        }})
    })

    try {
        await promise
        const url = linkModal.state.url
        return url
    } catch(e) {
        return undefined
    }
    
}

async function imageHandler() {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.id = 'fileInput'
    inputElement.accept = 'png,jpg,jpeg'

    const promise = new Promise((resolve, reject) => {
        editorLoading.value = true
        

        inputElement.click()

        inputElement.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (!file) {
                reject()
                editorLoading.value = false
            } else {
                uploadImage(file).then((url) => {
                    resolve(url)
                }).catch((e) => {
                    reject()
                }).finally(() => {
                    editorLoading.value = false
                })
            }
        })

        window.addEventListener('focus', (e) => {
            setTimeout(() => {
                if (!inputElement.value) {
                    reject()
                    editorLoading.value = false
                }
            }, 500)
        }, { once: true })

    })
    try {
        const url = await promise
        if (inputElement) inputElement.remove()
        return url
    } catch(e) {
        if (inputElement) inputElement.remove()
    }

    
    /*uploadImage(isFront, insertImage, file) {
            if (isFront) this.editor.frontLoading = true
            else this.editor.backLoading = true

            uploadImage(file).then(imageUrl => {
                insertImage({

                    url: imageUrl,
                    desc: 'New Image'

                })
            }).catch(error => {

            }).finally(() => {
                if (isFront) this.editor.frontLoading = false
                else this.editor.backLoading = false
            })
        },*/
}

async function copyImageFromDataUrl(url) {
    const blob = await convertImageToBlob(url)
    const clipboardItem = new ClipboardItem({ [blob.type]: blob })
    navigator.clipboard.write([clipboardItem])

    preview.value.lastScreenshot = url

    displayingSuggestedCards.value = true

    //Load the cards
    premiumFeature.executeWithoutPaywall(() => {
        console.log('Loading suggested cards')
        suggestedCardLoadable.load(url)
    })
}

function closeSuggestedCards() { displayingSuggestedCards.value = false }

function startPreview(cardContent) {
    preview.value.active = true
    preview.value.cachedFrontContent = frontEditorController.getClozeContent()
    preview.value.cachedBackContent = backEditorController.getClozeContent()

    const backContent = preview.value.lastScreenshot ? `![Image](${preview.value.lastScreenshot})` : ''
    frontEditorController.setContent(cardContent)
    backEditorController.setContent(backContent)
}

function endPreview() { 
    preview.value.active = false

    if (preview.value.cachedFrontContent != null) frontEditorController.setContent(preview.value.cachedFrontContent)
    if (preview.value.cachedBackContent != null) backEditorController.setContent(preview.value.cachedBackContent)
    preview.value.cachedFrontContent = null
    preview.value.cachedBackContent = null
}

function useSuggestedCard(cardContent) {
    const backContent = preview.value.lastScreenshot ? `![Image](${preview.value.lastScreenshot})` : ''
    
    frontEditorController.setContent(cardContent)
    backEditorController.setContent(backContent)

    preview.value.active = false
    preview.value.cachedFrontContent = null
    preview.value.cachedBackContent = null
}

function addSuggestedCard(cardContent) {
    suggestedCardLoadable.value = suggestedCardLoadable.value.filter((card) => card !== cardContent)
    if (suggestedCardLoadable.value.length == 0) closeSuggestedCards()
    saveNote()
}

function upgrade() {
    premiumFeature.execute(() => {}, () => {})
}

</script>

<style scoped>

.content {
    margin: 10px;
}

.tags-container {
    display: flex;
    align-items: center;
    gap: 20px;
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

.layout-container {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 250px);
    margin-bottom: 60px;
    margin-left: 20px;
    margin-right: 20px;
}

.pdf-panel {
    width: 50%;
    min-width: 0;
    align-self: stretch;
    transition: width 0.3s ease, margin 0.3s ease, opacity 0.3s ease;
    margin-right: 20px;
}

.pdf-panel-inner {
    width: calc(50vw - 60px);
    height: 100%;
    flex-shrink: 0;
    position: relative;
}

.suggested-cards-container {
    position: absolute;
    bottom: 10px;
    left: 25%;
    right: 25%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: solid 1px var(--el-color-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.suggested-cards-promo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    color: black;
}

.flex-spacer {
    flex: 1;
}

.suggested-cards-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    color: var(--el-color-primary);
}

.suggested-cards-title {
    font-size: 11px;
    font-weight: 600;
}

.suggested-cards-title i {
    margin-right: 4px;
    color: var(--el-color-primary);
}

.suggested-cards-hint {
    font-size: 10px;
    color: #929292;
}

.suggested-cards-close {
    cursor: pointer;
    font-size: 10px;
    color: #929292;
    border-radius: 10px;
    padding: 4px;
}

.suggested-cards-close:hover {
    background-color: rgba(158, 158, 158, 0.1);
}

.suggested-cards-list {
    max-height: 100px;
    overflow-y: auto;
    padding: 0 4px 4px;
}

.suggested-cards-error {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--el-color-danger);
}

.pdf-panel.collapsed {
    width: 0;
    margin-right: 0;
    opacity: 0;
}

.editor-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
    height: 100%;
}

.editor {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.double-editor {
    
    
    
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 20px;
}

.editor-headers {
    width: 100%;
    display: flex;
    border-bottom: solid 1px black;
}

.editor-headers h3 {
    flex: 1;
    text-align: center;
}

#frontEditor {
    flex: 1;
    border-right: solid 1px #EEE;
    border: solid 2px #EEE;
    border-radius: 20px;
    box-sizing: border-box;
    margin-bottom: 10px;
}

#backEditor {
    flex: 1;
    border-right: solid 1px #EEE;
    border: solid 2px #EEE;
    border-radius: 20px;
    box-sizing: border-box;
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

.toolbar-container {
    width: 100%;
    display: flex;
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: 20px;
}

.editor-container h3 {
    margin-top: 10px;
    margin-bottom: 7px;
    color: rgb(85, 85, 85)/*var(--el-color-primary-light-4)*/;
}
</style>