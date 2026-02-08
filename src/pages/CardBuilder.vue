<template>
<div class='content'>

    <div class='breadcrumb' style='margin-left: 20px;margin-bottom: 30px;'>
        <return-link @click='() => { router.push({ name: "View Deck", params: { deckId: deckId } }) }'>
            Return to deck
        </return-link>
    </div>

    <!--Edit/Add Card Header-->
    <div class='header'>
        <h1>{{ noteId ? 'Edit':'Add'}} Card</h1>
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

        <!--Save/Add Button-->
        <brand-button style='margin-left: 10px;' type='primary' @click='saveNote' :disabled='editorLoading'>{{ noteId ? 'Save':'Add' }}</brand-button>
    </div>

    <el-main class='main-content'>
        <div id='tags'>
            <el-main>
                <h2>Tags</h2>
                <loadable-state-provider :loadable='tagsLoadable' v-slot='{ loading, data: tagOptions }'>
                    <el-select-v2 
                        v-model='tags' 
                        :loading='loading' 
                        multiple 
                        filterable 
                        allow-create 
                        placeholder='Add tags...' 
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
                <KeyBindingProvider>
                    <div class='double-editor' v-loading='loading || editorLoading'>

                        <!--Formatting Toolbar-->
                        <div class='toolbar-container'>
                            <h3 style='justify-self: flex-start;'>Front Side</h3>
                            <formatting-toolbar :link-handler='linkHandler' :image-handler='imageHandler'></formatting-toolbar>
                            <h3 style='justify-self: flex-end; text-align: right;'>Back Side</h3>
                        </div>
                        

                        <div class='editor-container'>
                            <div id='frontEditor'>   
                                <el-container>
                                    <!--KeyBindingProvider allows for keyboard shortcuts-->
                                    <KeyBindingProvider>
                                        <card-editor :cloze-enabled='true' :controller='frontEditorController'></card-editor>
                                    </KeyBindingProvider>
                                </el-container>
                            </div>
                            <div id='backEditor'> 
                                <el-container>
                                    <!--KeyBindingProvider allows for keyboard shortcuts-->
                                    <KeyBindingProvider>
                                        <card-editor :controller='backEditorController'></card-editor>
                                    </KeyBindingProvider>
                                </el-container>
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
            </template>
            <template #loading>
                <el-skeleton :rows='5'></el-skeleton>
            </template>
            <template #error>
                <error-page message='Failed to load note' ></error-page>
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

//Composables
import { useRouter, useRoute} from 'vue-router'
import useLoadable from '../composables/ui/useLoadable'
import useDecks from '../composables/api/useDecks'
import useDeck from '../composables/api/useDeck'
import useModal from '../composables/ui/useModal'
import useStorage from '../composables/api/useStorage'
import useNotes from '../composables/api/useNotes'
import useCardEditor from '../composables/ui/useCardEditor'
import useNotificationService from '../composables/ui/useNotificationService'

//Utils
import { setThemeColor } from '../utils'

const { uploadImage } = useStorage()

const router = useRouter()
const route = useRoute()

const notificationService = useNotificationService()

//Data
const deckId = ref(route.params.deckId)
const noteId = ref(route.params.noteId)

const { fetchAllDecks } = useDecks()

const deck = computed(() => useDeck(deckId.value))
const notes = computed(() => useNotes(deckId.value))

const tags = ref([])

const frontEditorController = useCardEditor('')
const backEditorController = useCardEditor('')

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

watch(deck, () => tagsLoadable.load())

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
    } catch(e) {
        notificationService.error('Failed to save note')
    }
    finally {
        editorLoading.value = false
    }
}

//Update theme color with deck selection
watch([deckSelectLoadable.currentState, deckId], (newVals) => {
    const options = newVals[0].value
    if (options) {
        for (const deck of options) {
            if (deck.id == deckId.value) setThemeColor(deck.primaryColor, document.documentElement)
        }
    }
})

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

.editor-container {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
}

.double-editor {
    border: solid 2px #EEE;
    border-radius: 20px;
    box-sizing: border-box;
    overflow: hidden;
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
}

#backEditor {
    flex: 1;
    border-left: solid 1px #EEE;
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: solid 2px #EEE;
}

.toolbar-container h3 {
    flex: 1;
    margin: 15px 25px;
    color: rgb(85, 85, 85)/*var(--el-color-primary-light-4)*/;
}
</style>