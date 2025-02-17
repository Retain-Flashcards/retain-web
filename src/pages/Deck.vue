<template>
<LoadableProvider :loadable='deckLoadable'>
<template #notStarted>

</template>
<template #default='{ data: deck }'>
    <div style='height: 100%; width: 100%;'>
        
        <div class='main-header' :style='{ backgroundImage: `url(${deck.coverImage})` }'>
            <div class='flex-spacer background-overlay' :style="{ backgroundColor: 'var(--el-color-primary-overlay)' }">
                <div class='return-link' @click='() => { router.push({ name: "Home" }) }'>
                    <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to home
                </div>
                <div class='flex-spacer'></div>
                <div style='display: flex; align-items: center;'>
                    <el-button v-if='deck.shared' type='text' style='color: white; font-size: 30px; margin-right: 15px;'><el-icon><Connection /></el-icon></el-button>
                    <h1>{{ deck.title }}</h1>
                </div>
            </div>
        </div>

        <div class='main-content'>
            <div style='display: flex; flex-direction: row; align-items: center; margin-top: 50px; margin-bottom: 10px;'>
                <h2>Due Now</h2>
                <div class='flex-spacer'></div>
                <el-select-v2 v-model='tags.selected' 
                    placeholder='Filter by Tags...' 
                    style='width: 200px;'
                    multiple
                    filterable
                    :options='tags.options'
                    :props='{label: "name", value: "id"}'
                    tag-type='danger'
                    @change='(selected) => { reloadDeckCount()}'>
                </el-select-v2>
                <div style='width: 20px;'></div>
                <el-button type='primary' plain @click='openSettingsDialog'>
                    <el-icon style='margin-right: 5px;'><Setting /></el-icon> Study Settings
                </el-button>
            </div>
            <div class='study-container'>
                <el-result v-if='deck.reviewCount == 0 && deck.newCount == 0' icon="success" title="Done for the Day!" subTitle="No Reviews Due" style='flex: 2;'>
                    <template slot="extra">
                        <el-button type="primary" size="medium">Back</el-button>
                    </template>
                </el-result>
                <div v-else class='due-container' style='flex: 2;'>
                    <div style='display: flex; flex-direction: row;'>
                        <div class='stats' style='flex: 2;'>
                            <div class='stats-container'>
                                <div class='flex-spacer'></div>
                                <div class='stats-item' style='color: var(--el-color-primary);'>
                                    <h2 class='new-text'>{{ deck.newCount }}</h2>
                                    <p class='new-text'>New</p>
                                </div>
                                <div class='stats-item' style='color: var(--el-color-primary-light-4);'>
                                    <h2 class='review-text'>{{ deck.reviewCount }}</h2>
                                    <p class='review-text'>Review</p>
                                </div>
                                <div class='flex-spacer'></div>
                            </div>
                            <div class='stats-overlay' @click='beginStudy'>
                                <button class='study-button'>Study Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <el-collapse class='due-container' style='margin-top: 0px;'>
                <el-collapse-item>
                    <template #title>
                        <div class='quizzes-header'>
                            <h2>Cram Sessions</h2>
                            <el-tag type='warning' round style='margin-left: 10px;'>Beta</el-tag>
                            <div class='flex-spacer'></div>
                            <el-button type='primary' @click='enterCramMode'>
                                <el-icon style='margin-right: 5px;'><Stopwatch /></el-icon> New Cram Session
                            </el-button>
                        </div>
                    </template>
                    <div class='table-container'>
                        <LoadableStateProvider :loadable='cramSessionsLoadable' v-slot='{ loading, data: cramSessions }'>
                            <el-table :data='cramSessions' v-loading='loading' style='width: 100%;' stripe>
                                <el-table-column label='Cram' v-slot='scope' min-width="50">
                                    <div style='display: flex; flex-direction: column; height: 100%; align-items: flex-start;'>
                                        <el-button link type='primary' @click='openCramSession(scope.row.cram_id)' size='large'><b>Cram {{  scope.$index + 1  }}</b></el-button>
                                    </div>
                                </el-table-column>
                                <el-table-column label='Number of Cards' v-slot='scope' min-width="50">
                                    <p v-if='scope.row.total_cards' style='white-space: pre-line;'>{{ scope.row.total_cards }}</p>
                                </el-table-column>
                                <template #empty>
                                    <div style='display: flex; flex-direction: column; align-items: center; padding-bottom: 30px; padding-top: 10px;'>
                                        <el-icon :size='40'><InfoFilled /></el-icon>
                                        <p style='line-height: 30px;'>No Cram Sessions Yet!</p>
                                    </div>
                                </template>
                            </el-table>
                        </LoadableStateProvider>
                    </div>
                </el-collapse-item>
                <el-collapse-item>
                    <template #title>
                        <div class='quizzes-header'>
                            <h2>Quizzes</h2>
                            <el-tag type='danger' round style='margin-left: 10px;'>Alpha</el-tag>
                            <div class='flex-spacer'></div>
                            <el-button type='primary' @click='createQuiz'>
                                <el-icon style='margin-right: 5px;'><Edit /></el-icon> Create a Quiz
                            </el-button>
                        </div>
                    </template>
                    <LoadableStateProvider :loadable='quizzesLoadable' v-slot='{ loading, data: quizzes }'>
                        <div class='table-container'>

                            <el-table :data='quizzes' v-loading='loading' style='width: 100%;' stripe>
                                <el-table-column label='Quiz' v-slot='scope' min-width="50">
                                    <div style='display: flex; flex-direction: column; height: 100%; align-items: flex-start;'>
                                        <el-button link type='primary' @click='openQuiz(scope.row.path)' size='large'><b>Quiz {{  scope.$index + 1  }}</b></el-button>
                                    </div>
                                </el-table-column>
                                <el-table-column label='Topics' v-slot='scope' min-width="50">
                                    <p v-if='scope.row.topics_list' style='white-space: pre-line;'>{{ scope.row.topics_list }}</p>
                                </el-table-column>
                                <template #empty>
                                    <div style='display: flex; flex-direction: column; align-items: center; padding-bottom: 30px; padding-top: 10px;'>
                                        <el-icon :size='40'><InfoFilled /></el-icon>
                                        <p style='line-height: 30px;'>No Quizzes Yet!</p>
                                    </div>
                                </template>
                            </el-table>

                        </div>
                    </LoadableStateProvider>
                </el-collapse-item>
            </el-collapse>

            <div class='due-container' style='margin-top: 0px; margin-bottom: 50px;'>
                
            </div>

            <div class='table-container'>
                <LoadableStateProvider :loadable='notesLoadable' v-slot='{ loading }'>
                    <div class='table-header' style='display: flex; align-items: center; margin-bottom: 5px;'>
                        <h3>All Notes ({{ tableState.noteCount }})</h3>
                        <div style='display: flex; align-items: center' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                            <el-button type='primary' style='margin-left: 30px;' @click='createNotes'>
                                <el-icon style='margin-right: 5px;'><Plus /></el-icon> Add Notes
                            </el-button> 
                            <el-button type='primary' plain style='margin-left: 30px;' @click='aiCardBuilder'>
                                <el-icon style='margin-right: 5px;'><MagicStick /></el-icon> Try our new AI Card Builder
                            </el-button>
                        </div>
                        
                        <div class='flex-spacer'></div>
                    </div>

                    <el-table :data='tableState.notes[tableState.currentPage]' v-loading='loading' style='width: 100%;' stripe>
                        <el-table-column label='Note ID' v-slot='scope' width='180'>
                            <p style='color: #AAA;'>{{ scope.row.id }}</p>
                        </el-table-column>
                        <el-table-column prop='frontContent' label='Front Content' style='flex: 1'>
                        </el-table-column>
                        <el-table-column prop='backContent' label='Back Content' style='flex: 1'></el-table-column>
                        <!--<el-table-column label='Active?' width='90'>
                            <template v-slot='scope'>
                                <el-checkbox v-model='scope.row.active'></el-checkbox>
                            </template>
                        </el-table-column>-->
                        <el-table-column label='Edit' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                            <template v-slot='scope'>
                                <el-button  @click='() => editNote(scope.row.id)'>Edit</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label='Reset' width='105'>
                            <template v-slot='scope'>
                                <el-button :loading='scope.row.loadingReset || false' plain type='warning' @click='() => _resetNote(scope.$index, scope.row.id)'>Reset</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label='Delete' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                            <template v-slot='scope'>
                                <el-button type='danger' plain @click='_deleteNote(scope.$index, scope.row.id)'>Delete</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-pagination background layout='prev, pager, next' :total='tableState.noteCount' :page-size='20' @next-click='onTableNextClick' @prev-click='onTablePrevClick' @current-change='onTableCurrentPageChange' style='margin-top: 20px; margin-bottom: 100px;'>

                    </el-pagination>

                    <el-dialog 
                        v-model='settingsModal.isOpen.value' title='Study Settings'>
                        <LoadableStateProvider :loadable='studySettingsLoadable' v-slot='{ loading, data: deckSettings}'>
                            <div style='display: flex; flex-direction: column; align-items: center;'>
                                <el-form label-position='top' style='width: 100%;' v-loading='loading'> 
                                    <el-form-item label='New Limit'>
                                        <el-input v-model='settingsModal.state().newLimit' type='number'></el-input>
                                    </el-form-item>
                                    <el-form-item label='Review Limit'>
                                        <el-input v-model='settingsModal.state().reviewLimit' type='number'></el-input>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-radio-group v-model='settingsModal.state().mode'>
                                            <el-radio-button label='defaults'>Set as Deck Defaults</el-radio-button>
                                            <el-radio-button label='today'>Just For Today</el-radio-button>   
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button type='primary' @click='saveSettings'>Save</el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </LoadableStateProvider>
                    </el-dialog>
                </LoadableStateProvider>
            </div>
            
        </div>

    </div>
</template>
<template #loading>
    <div style='height: 100%; width: 100%;' v-loading='true'></div>
</template>
<template #error='{ error }'>
</template>
</LoadableProvider>
</template>

<script setup>
//Composables
import { onMounted, ref } from 'vue'
import useFlashcards from '../composables/UseFlashcards'
import useDeck from '../composables/useDeck.js'
import useNotes from '../composables/useNotes.js'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
import useLoadable from '../composables/useLoadable.js'
import useModal from '../composables/useModal.js'
const {
    fetchData,
    getQuizzes,
    getQuizPath,
    listCramSessions,
    loadTags,
    getStudySettings,
    setDeckStudySettings,
    setTodayStudySettings
} = useDeck(route.params.deckId)

const {
    fetchDeckNotes,
    deleteNote,
    resetNote
} = useNotes(route.params.deckId)

//UI components
import LoadableProvider from '../components/basic/LoadableProvider.vue'
import { Plus, ArrowLeft, InfoFilled, Setting, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

//Other
import { setThemeColor } from '../utils'
import LoadableStateProvider from '../components/basic/LoadableStateProvider.vue'

//Data
const tags = ref({
    options: [],
    selected: []
})
const tableState = ref({
    currentPage: 0,
    notes: {},
    noteCount: 0
})

//Modals
const settingsModal = useModal({
    newLimit: 20,
    reviewLimit: 200,
    mode: 'defaults'
})

//Loadables
const deckLoadable = useLoadable(async (prevValue, tagFilter = []) => {
    const deck = await fetchData(tagFilter)
    setThemeColor(deck.primaryColor, document.documentElement)
    return deck
})
const notesLoadable = useLoadable(async () => {
    if (!deckLoadable.value()) return
            
    const pagesLoaded = notesCount() / 20
    const pagesToLoad = tableState.value.currentPage - pagesLoaded

    const result = await fetchDeckNotes(tableState.value.currentPage)
    const { notes, count } = result
    tableState.value.notes[tableState.value.currentPage] = [...notes.map(item => item.export())]
    tableState.value.noteCount = count
})
const cramSessionsLoadable = useLoadable(async () => {
    if (!deckLoadable.value()) return []
    const result = await listCramSessions()
    return result
})
const quizzesLoadable = useLoadable(async () => {
    if (!deckLoadable.value()) return []
    const result = await getQuizzes()
    return result.map(item => {
        let path = item.path.split('/')
        let quizId = path[path.length - 1]
        return {
            path: quizId,
            topics_list: item.topics_list
        }
    })
})
const studySettingsLoadable = useLoadable(async (prevValue, deck) => {
    const result = await getStudySettings(deck.daily_new_limit, deck.daily_review_limit)
    return {
        ...prevValue,
        newLimit: result.newLimit,
        reviewLimit: result.reviewLimit,
        mode: result.today ? 'today' : 'defaults'
    }
}, {
    editing: false,
    newLimit: 20,
    reviewLimit: 200,
    mode: 'defaults'
})

const saveSettings = async () => {
    const newSettings = settingsModal.state()
    studySettingsLoadable.loadWithFunction(async () => {
        if (newSettings.mode == 'defaults') await setDeckStudySettings(Number(newSettings.newLimit), Number(newSettings.reviewLimit))
        else if (newSettings.mode == 'today') await setTodayStudySettings(Number(newSettings.newLimit), Number(newSettings.reviewLimit))
        reloadDeckCount()
        return newSettings
    })
}


//Methods
function openSettingsDialog() { settingsModal.openWithState(studySettingsLoadable.value()) }
function reloadDeckCount() { deckLoadable.loadSilently(tags.value.selected) }
function notesCount() {
    let count = 0
    for (const [key, value] of Object.entries(tableState.value.notes)) {
        count += value.length
    }
    return count
}
function enterCramMode() { router.push({ name: 'Cram Builder', params: { deckId: route.params.deckId } }) }
function openCramSession(cramId) { router.push({ name: 'Cram', params: { deckId: route.params.deckId, cramId: cramId } }) }
function createQuiz() { router.push({ name: 'QuizBuilder', params: { deckId: route.params.deckId } }) }
function editNote(noteId) { router.push({ name: 'Edit Card', params: { deckId: route.params.deckId, noteId: noteId } }) }
function openQuiz(quizName) {
    const quizPath = getQuizPath(quizName)
    router.push({ name: 'Quiz', params: { deckId: route.params.deckId, quizPath: quizPath } })
} 
function beginStudy() { router.push({ name: 'Study Deck', params: { deckId: route.params.deckId }, query: { tags: this.tags.selected } }) }
function createNotes() { router.push({ name: 'Create Cards', params: { deckId: route.params.deckId } }) }
function aiCardBuilder() { router.push({ name: 'AI Card Builder', params: { deckId: route.params.deckId } }) }


function onTableNextClick(currentPage) {
    const pagesLoaded = notesCount() / 20
    if (currentPage > pagesLoaded) {
        tableState.value.currentPage = currentPage - 1
        notesLoadable.load()
    }
}

function onTablePrevClick(currentPage) {
    const pagesLoaded = notesCount() / 20
    if (currentPage > 0) {
        tableState.value.currentPage = currentPage - 1
    }
}
function onTableCurrentPageChange(currentPage) {
    const pagesLoaded = notesCount() / 20
    if (currentPage > pagesLoaded) {
        tableState.value.currentPage = currentPage - 1
        notesLoadable.load()
    }
    else if (currentPage > 0 && currentPage != tableState.value.currentPage + 1) {
        tableState.value.currentPage = currentPage - 1
    }
}
function _deleteNote(index, noteId) {
    notesLoadable.loadWithVoidFunction(async (prevValue) => {
        await deleteNote(noteId)
        tableState.value.notes[tableState.value.currentPage].splice(index, 1)
    })
}
function _resetNote(index, noteId) {
    notesLoadable.loadWithVoidFunction(async () => {
        try {
            await resetNote(noteId)
            ElMessage({
                message: 'Card reset successfully!',
                type: 'success'
            })
        } catch(e) {
            ElMessage({
                message: `An error occurred: ${e.message}`,
                type: 'error'
            })
        }
        reloadDeckCount()
    })
}


//Lifecycle
onMounted(() => {
    deckLoadable.load().then(async (deck) => {
        notesLoadable.load()
        cramSessionsLoadable.load()
        quizzesLoadable.load()
        studySettingsLoadable.load(deck)

        const tagOptions = await loadTags(route.params.deckId)
        tags.value.options = tagOptions
    })
})

</script>

<style scoped>
.main-header {
    display: flex;
    flex-direction: column; 
    height: 200px;
}

.background-overlay {
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding-left: 50px;
    padding-bottom: 25px;
    font-size: 20px;
    display: flex;
    flex-direction: column;
}

h1 {
    margin: 0px;
}

.main-content {
    display: flex;
    flex-direction: column;
    width: 75%;
    margin: auto;
    margin-top: 0px;
    margin-bottom: 0px;
}

.due-container {
}



.stats {
    position: relative;
    border: #EEE solid 3px;
    margin-bottom: 50px;
    border-radius: 20px;
    overflow: hidden;
} 

.stats-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.study-container {
    display: flex;
    flex-direction: row;
}

.stats-overlay {
    position: absolute;
    display: flex;
    left: 0px;
    top: 0px;
    background: var(--el-color-primary-overlay);
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: 0.5s;
    transform: scale(1.1);
}

.stats-overlay:hover {
    opacity: 0.8;
    cursor: pointer;
    transform: scale(1);
}

.stats-item {
    text-align: center;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 20px;
    margin-right: 20px;
    flex: 0.3;
}

.study-button {
    color: white;
    border: white solid 2px;
    border-radius: 5px;
    padding: 10px;
    background: none;
    transition: 0.2s;
    font-weight: bold;
    font-size: 13px;
}

.study-button:hover {
    /*transform: scale(1.05);*/
    cursor: pointer;
}

.stats-item h2 {
    font-size: 40px;
    margin: 0px;
    margin-bottom: 10px;
}

.table-container {
    border-top: #EEE solid 3px;
    padding-top: 20px;
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

.ai-feature-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #EEE;
    padding: 50px;
    border-radius: 20px;
    margin-bottom: 20px;
}

.quizzes-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}



h2 {
    margin-top: 0px;
    margin-bottom: 0px;
}
</style>

<style>
.el-collapse-item__header {
    flex-direction: row-reverse;
}
</style>