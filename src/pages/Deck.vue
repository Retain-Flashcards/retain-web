<template>
<LoadableProvider :loadable='deckLoadable'>
    <template #notStarted>
        <el-result icon="info" title="Deck Not Found" subTitle="The deck you are looking for does not exist or you do not have access to it." style='flex: 2;' />
    </template>

    <template #default='{ data: deck }'>

        <div style='height: 100%; width: 100%;'>

            <!--Top Banner with Deck Title + Cover Image-->
            <div class='main-header' :style='{ backgroundImage: `url(${deck.coverImage})` }'>
                <div class='flex-spacer background-overlay' :style="{ backgroundColor: 'var(--el-color-primary-overlay)' }">
                    
                    <return-link @click='() => { router.push({ name: "Home" }) }'>Return to Home</return-link>
                    
                    <div class='flex-spacer'></div>
                    
                    <div style='display: flex; align-items: center;'>

                        <!--Link icon if deck is shared-->
                        <span v-if='deck.shared' style='color: white; font-size: 30px; margin-right: 15px;'><el-icon><Connection /></el-icon></span>
                        
                        <h1>{{ deck.title }}</h1>

                    </div>
                </div>
            </div>

            <!--Deck Content-->
            <div class='main-content'>

                <!-- Top Layout: Study Button (Left) & Stats (Right) -->
                <div class="deck-top-layout">
                    <!-- Left Column: Due Now + Study -->
                    <div class="deck-left-column">
                        <div style="padding-top: 30px; margin-bottom: 12px;">
                            <h2 style="margin-top: 0px; margin-bottom: 12px;">Due Now</h2>

                            <!-- Filter row: Study Focus + Tags + Settings gear -->
                            <div class="filter-row">
                                <premium-content>
                                    <div class="study-focus-row">
                                        <SoftInput 
                                            v-model="studyFocusText" 
                                            placeholder="Focus on a topic, e.g. 'amino acid structures'" 
                                            style="flex: 1;"
                                            @keyup.enter="beginStudy"
                                        />
                                    </div>
                                    <template #nonSubscriber>
                                        <div class="study-focus-row study-focus-row--locked" @click="beginStudyFocusPremium">
                                            <div class="study-focus-locked-input">
                                                <span>Focus on a topic, e.g. 'amino acid structures'</span>
                                            </div>
                                        </div>
                                    </template>
                                </premium-content>

                                <el-select-v2 v-model='tags.selected' 
                                    placeholder='Filter by Tags...' 
                                    style='flex: 0 0 auto; width: 180px;'
                                    multiple
                                    filterable
                                    :options='tags.options'
                                    :props='{label: "name", value: "id"}'
                                    tag-type='danger'
                                    @change='(selected) => { reloadDeckCount()}'>
                                </el-select-v2>

                                <brand-button icon='fa-gear' type='primary' :plain='true' @click='openSettingsDialog' style='flex-shrink: 0;'></brand-button>
                            </div>
                        </div>

                        <!-- Study Button -->
                        <study-button :newCount='deck.newCount' :reviewCount='deck.reviewCount' @beginStudy='beginStudy'></study-button>

                        <!-- Voice Study -->
                        <div class="study-divider">
                            <span class="study-divider__line"></span>
                            <span class="study-divider__text">or</span>
                            <span class="study-divider__line"></span>
                        </div>

                        <div class="voice-study-section">
                            <div class="voice-study-section__header">
                                <font-awesome-icon :icon="['fas', 'microphone']" class="voice-study-section__icon" />
                                <span class="voice-study-section__title">Voice Study</span>
                                <el-tag type='warning' size='small' round>Beta</el-tag>
                            </div>
                            <p class="voice-study-section__subtitle">AI-powered voice review experience</p>
                            <premium-content>
                                <brand-button type='primary' @click='beginAudioStudy'>Begin Session</brand-button>
                                <template #nonSubscriber>
                                    <brand-button type='primary' @click='beginAudioStudy'><premium-marker /> Upgrade</brand-button>
                                </template>
                            </premium-content>
                        </div>
                    </div>

                    <!-- Right Column: Stats -->
                    <div class="deck-right-column">
                        <div style="padding-top: 30px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <h2 style="margin: 0;">Stats</h2>
                            </div>

                            <premium-content>
                                <!-- Pro user: fully visible stats -->
                                <div class="stats-content">
                                    <div class="stats-section">
                                        <h4 class="stats-section__title">Upcoming Reviews</h4>
                                        <DueReviewsGraph :loadable="dueReviewsLoadable" />
                                    </div>
                                    <div class="stats-section">
                                        <h4 class="stats-section__title">Daily Activity</h4>
                                        <DailyActivityChart :loadable="dailyActivityLoadable" />
                                    </div>
                                </div>

                                <template #nonSubscriber>
                                    <!-- Free user: blurred placeholder charts -->
                                    <div class="stats-blurred-wrapper">
                                        <div class="stats-content stats-content--blurred">
                                            <div class="stats-section">
                                                <h4 class="stats-section__title">Upcoming Reviews</h4>
                                                <DueReviewsGraph :loadable="placeholderDueReviewsLoadable" />
                                            </div>
                                            <div class="stats-section">
                                                <h4 class="stats-section__title">Daily Activity</h4>
                                                <DailyActivityChart :loadable="placeholderDailyActivityLoadable" />
                                            </div>
                                        </div>
                                        <div class="stats-unlock-overlay">
                                            <brand-button type="primary" :plain="true" size="small" @click="unlockStats">
                                                <font-awesome-icon :icon="['fas', 'lock']" style="margin-right: 4px;" />
                                                Unlock with Pro
                                            </brand-button>
                                        </div>
                                    </div>
                                </template>
                            </premium-content>
                        </div>
                    </div>
                </div>

                <!--Cram Sessions-->
                <el-collapse class='due-container' style='margin-top: 0px;'>
                    <el-collapse-item>

                        <!--Header shown when collapsed-->
                        <template #title>
                            <div class='quizzes-header'>
                                <h2>Cram Sessions</h2>

                                <!--Info Tooltip-->
                                <div class='info-tooltip'>
                                    <el-tooltip class='info-tooltip' effect='dark' placement='right-start'>
                                        <template #content>
                                            Use "Cram Sessions" to create study sets that you can review<br /> on your own time, outside of the scheduled reviews.
                                        </template>

                                        <el-icon><InfoFilled /></el-icon>
                                    </el-tooltip>
                                </div>

                                <div class='flex-spacer'></div>

                                <brand-button icon='fa-regular fa-alarm-clock' type='primary' @click='enterCramMode'>New Cram Session</brand-button>
                            </div>
                        </template>

                        <!--Table shown when expanded-->
                        <div class='table-container'>
                            <LoadableStateProvider :loadable='cramSessionsLoadable' v-slot='{ loading, data: cramSessions }'>

                                <el-table :data='cramSessions' v-loading='loading' style='width: 100%;' stripe>

                                    <!--Cram Label Column-->
                                    <el-table-column label='Cram' v-slot='scope' min-width="50">
                                        <div style='display: flex; flex-direction: column; height: 100%; align-items: flex-start;'>
                                            <el-button link type='primary' @click='openCramSession(scope.row.cram_id)' size='large'><b>Cram {{  scope.$index + 1  }}</b></el-button>
                                        </div>
                                    </el-table-column>

                                    <!--Number of Cards Column-->
                                    <el-table-column label='Number of Cards' v-slot='scope' min-width="50">
                                        <p v-if='scope.row.total_cards' style='white-space: pre-line;'>{{ scope.row.total_cards }}</p>
                                    </el-table-column>

                                    <!--Empty State-->
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

                    <!--Quizzes - currently disabled-->
                    <!--
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
                    -->
                </el-collapse>



                <div class='due-container' style='margin-top: 0px; margin-bottom: 50px;'></div>

                <!--Notes Table-->
                <div class='table-container'>
                    <LoadableStateProvider :loadable='notesLoadable' v-slot='{ loading }'>

                        <!--Table Header-->
                        <section-layout>
                            <template #header>
                                <h3>All Cards ({{ tableState.noteCount }})</h3>
                            </template>

                            <template #actions>
                                <!--Regular Card Builder-->
                                <soft-popover placement="bottom-start" @select="handleSelect" >
                                    <template #trigger>
                                        <brand-button icon='fa-download' type='primary' :plain='true'>
                                            Use our Anki Import Utility
                                        </brand-button> 
                                    </template>

                                    <soft-popover-item value="macOS" icon='fa-brands fa-apple' @click='downloadMacOS'>Download for macOS</soft-popover-item>
                                    <!--Windows Support coming soon-->
                                    <!--<soft-popover-item value="windows" icon='fa-brands fa-windows' @click='downloadWindows'>Download for Windows</soft-popover-item>-->
                                </soft-popover>
                                
                                <!--Regular Card Builder-->
                                <brand-button icon='fa-add' type='primary' @click='createNotes'>
                                    Create Cards
                                </brand-button> 
                            </template>
                        </section-layout>

                        <!--Data Table-->
                        <el-table class='card-table' :data='tableState.notes[tableState.currentPage]' v-loading='loading' style='width: 100%;' stripe>
                            
                            <!--Front Content-->
                            <el-table-column label='Front Content' style='flex: 1'>
                                <template #default='{ row: note }'>
                                    <card-content-display :controller='note.frontContentController'></card-content-display>
                                </template>
                            </el-table-column>

                            <!--Back Content-->
                            <el-table-column label='Back Content' style='flex: 1'>
                                <template #default='{ row: note }'>
                                    <card-content-display :controller='note.backContentController'></card-content-display>
                                </template>
                            </el-table-column>

                            <!--Edit Button-->
                            <el-table-column label='Edit' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                                <template v-slot='scope'>
                                    <brand-button type='info' :plain='true' @click='() => editNote(scope.row.id)'>Edit</brand-button>
                                </template>
                            </el-table-column>

                            <!--Reset Button-->
                            <el-table-column label='Reset' width='105'>
                                <template v-slot='scope'>
                                    <brand-button :loading='scope.row.loadingReset || false' type='warning' :plain='true' @click='() => _resetNote(scope.$index, scope.row.id)'>Reset</brand-button>
                                </template>
                            </el-table-column>

                            <!--Delete Button-->
                            <el-table-column label='Delete' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                                <template v-slot='scope'>
                                    <brand-button type='error' :plain='true' @click='_deleteNote(scope.$index, scope.row.id)'>Delete</brand-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!--Pagination-->
                        <el-pagination 
                            background 
                            layout='prev, pager, next' 
                            :total='tableState.noteCount' 
                            :page-size='20' 
                            @next-click='onTableNextClick' 
                            @prev-click='onTablePrevClick' 
                            @current-change='onTableCurrentPageChange' 
                            style='margin-top: 20px; margin-bottom: 100px;' />


                        <!--Settings Modal-->
                        <SoftDialog :modal='settingsModal' title='Study Settings' v-slot='{ state }'>
                            <loadable-provider :loadable='studySettingsLoadable'>
                                <template #error>
                                    <error-page message='Failed to load study settings'></error-page>
                                </template>
                                <template #loading>
                                    <app-spinner></app-spinner>
                                </template>
                                <template #default='{ loading, data: deckSettings }'>
                                    <div style='display: flex; flex-direction: column; align-items: center;'>
                                        <SoftForm label-position='top' style='width: 100%;'> 
                                            <SoftFormItem label='New Limit'>
                                                <SoftInput v-model='state.newLimitContent' type='number'></SoftInput>
                                            </SoftFormItem>
                                            <SoftFormItem label='Review Limit'>
                                                <SoftInput v-model='state.reviewLimitContent' type='number'></SoftInput>
                                            </SoftFormItem>

                                            <!--Mode-->
                                            <SoftFormItem>
                                                <el-radio-group v-model='state.currentMode' @change='handleSwitchSettingsMode'>
                                                    <el-radio-button label='defaults' value='defaults'>Set as Deck Defaults</el-radio-button>
                                                    <el-radio-button label='today' value='today'>Just For Today</el-radio-button>   
                                                </el-radio-group>
                                            </SoftFormItem>

                                            <!--Save Button-->
                                            <SoftFormItem>
                                                <brand-button type='primary' @click='saveSettings'>Save</brand-button>
                                            </SoftFormItem>
                                        </SoftForm>
                                    </div>
                                </template>
                            </loadable-provider>
                        </SoftDialog>
                    </LoadableStateProvider>
                </div>
                
            </div>

        </div>
    </template>
    <template #loading>
        <loading-overlay></loading-overlay>
    </template>

    <template #error>
        <error-page message='Failed to load deck'></error-page>
    </template>
</LoadableProvider>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

//UI components
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import { Plus, ArrowLeft, InfoFilled, Setting, MagicStick } from '@element-plus/icons-vue'
import CardContentDisplay from '../components/basic/cards/CardContentDisplay.vue'
import ReturnLink from '../components/basic/ReturnLink.vue'
import StudyButton from '../components/StudyButton.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import LoadableStateProvider from '../components/basic/providers/LoadableStateProvider.vue'
import SectionLayout from '../components/basic/SectionLayout.vue'
import Modal from '../components/basic/Modal.vue'
import LoadingOverlay from '../components/basic/LoadingOverlay.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import SoftDialog from '../components/basic/soft-ui/SoftDialog.vue'
import SoftForm from '../components/basic/soft-ui/SoftForm.vue'
import SoftFormItem from '../components/basic/soft-ui/SoftFormItem.vue'
import SoftInput from '../components/basic/soft-ui/SoftInput.vue'
import AppSpinner from '../components/basic/AppSpinner.vue'
import PremiumContent from '../components/PremiumContent.vue'
import DueReviewsGraph from '../components/DueReviewsGraph.vue'
import ProPill from '../components/basic/ProPill.vue'
import PremiumMarker from '../components/basic/PremiumMarker.vue'
import DailyActivityChart from '../components/DailyActivityChart.vue'
import SoftPopover from '../components/basic/soft-ui/SoftPopover.vue'
import SoftPopoverItem from '../components/basic/soft-ui/SoftPopoverItem.vue'

//Composables
import useDeck from '../composables/api/useDeck.js'
import useNotes from '../composables/api/useNotes.js'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
import useLoadable from '../composables/ui/useLoadable.js'
import useModal from '../composables/ui/useModal.js'
import useCardEditor from '../composables/ui/useCardEditor.js'
import useNotificationService from '../composables/ui/useNotificationService.js'
import usePremiumFeature from '../composables/api/usePremiumFeature.js'
import useRevenueCat from '../composables/api/useRevenueCat.js'
const notificationService = useNotificationService()
const premiumFeature = usePremiumFeature()
const { isProSubscriber } = useRevenueCat()
const {
    fetchData,
    getQuizzes,
    getQuizPath,
    listCramSessions,
    loadTags,
    getStudySettings,
    setDeckStudySettings,
    setTodayStudySettings,
    getDueReviewCounts,
    getDailyActivityCounts
} = useDeck(route.params.deckId)

const {
    fetchDeckNotes,
    deleteNote,
    resetNote
} = useNotes(route.params.deckId)

//Other
import { setThemeColor } from '../utils'

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

const studyFocusText = ref('')

//Modals
const settingsModal = useModal({
    newLimitContent: 20,
    reviewLimitContent: 200,
    currentMode: 'defaults',
    previousMode: null
})

//Due Reviews Graph Data (loaded only for pro users)
const dueReviewsLoadable = useLoadable(async () => {
    return await getDueReviewCounts()
})

//Daily Activity Graph Data (loaded only for pro users)
const dailyActivityLoadable = useLoadable(async () => {
    return await getDailyActivityCounts()
})

// Placeholder loadables with static fake data for free-user blurred preview
const placeholderDueReviewsLoadable = useLoadable(() => {}, {
    initialValue: Array.from({ length: 10 }, (_, i) => ({
        date: '', label: i === 4 ? 'Today' : '', weekday: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed'][i],
        monthDay: `${Math.floor(Math.random()*12)+1}/${Math.floor(Math.random()*28)+1}`,
        count: [3, 8, 1, 5, 12, 4, 7, 2, 6, 9][i], isFuture: i > 4
    }))
})
placeholderDueReviewsLoadable.currentState.value.status = 'data'

const placeholderDailyActivityLoadable = useLoadable(() => {}, {
    initialValue: Array.from({ length: 10 }, (_, i) => ({
        date: '', label: i === 9 ? 'Today' : '', weekday: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed'][i],
        monthDay: `${Math.floor(Math.random()*12)+1}/${Math.floor(Math.random()*28)+1}`,
        newSeen: [5, 3, 8, 2, 6, 4, 7, 3, 5, 1][i],
        reviewSeen: [12, 8, 15, 6, 10, 9, 14, 7, 11, 4][i]
    }))
})
placeholderDailyActivityLoadable.currentState.value.status = 'data'

//Switch dynamically based on mode
function handleSwitchSettingsMode() {
    const newState = settingsModal.state
    if (newState.currentMode != newState.previousMode && studySettingsLoadable.value) {
        newState.previousMode = newState.currentMode
        if (newState.currentMode == 'defaults') {
            settingsModal.state = {
                ...newState,
                newLimitContent: studySettingsLoadable.value.defaultNewLimit,
                reviewLimitContent: studySettingsLoadable.value.defaultReviewLimit
            }
        } else {
            settingsModal.state = {
                ...newState,
                newLimitContent: studySettingsLoadable.value.todayNewLimit || studySettingsLoadable.value.defaultNewLimit,
                reviewLimitContent: studySettingsLoadable.value.todayReviewLimit || studySettingsLoadable.value.defaultReviewLimit
            }
        }
    }
}

//Loadables
const deckLoadable = useLoadable(async (prevValue, tagFilter = []) => {
    const deck = await fetchData(tagFilter)
    setThemeColor(deck.primaryColor, document.documentElement)
    return deck
})

const notesLoadable = useLoadable(async () => {
    if (!deckLoadable.value) return
            
    const pagesLoaded = notesCount() / 20
    const pagesToLoad = tableState.value.currentPage - pagesLoaded

    const result = await fetchDeckNotes(tableState.value.currentPage)
    const { notes, count } = result
    tableState.value.notes[tableState.value.currentPage] = [...notes.map(item => {
        const note = item.export()
        const frontContentController = useCardEditor(note.frontContent, true)
        const backContentController = useCardEditor(note.backContent, true)
        note['frontContentController'] = frontContentController
        note['backContentController'] = backContentController
        return note
    })]
    tableState.value.noteCount = count
}, { onError: () => notificationService.error('Failed to load cards') })

const cramSessionsLoadable = useLoadable(async () => {
    if (!deckLoadable.value) return []
    const result = await listCramSessions()
    return result
}, { onError: () => notificationService.error('Failed to load cram sessions') })

const quizzesLoadable = useLoadable(async () => {
    if (!deckLoadable.value) return []
    const result = await getQuizzes()
    return result.map(item => {
        let path = item.path.split('/')
        let quizId = path[path.length - 1]
        return {
            path: quizId,
            topics_list: item.topics_list
        }
    })
}, { onError: () => notificationService.error('Failed to load quizzes') })


const studySettingsLoadable = useLoadable(async (prevValue, deck) => {
    const result = await getStudySettings(deck.daily_new_limit, deck.daily_review_limit)

    if (result.todayNewLimit != null && result.todayReviewLimit != null) {
        settingsModal.state.newLimitContent = result.todayNewLimit
        settingsModal.state.reviewLimitContent = result.todayReviewLimit
        settingsModal.state.previousMode = null
        settingsModal.state.currentMode = 'today'

    }
    else {
        settingsModal.state.newLimitContent = result.defaultNewLimit
        settingsModal.state.reviewLimitContent = result.defaultReviewLimit
        settingsModal.state.previousMode = null
        settingsModal.state.currentMode = 'defaults'
    }
    return result
},{
    initialValue: {
        defaultNewLimit: 20,
        defaultReviewLimit: 200,
        todayNewLimit: null,
        todayReviewLimit: null
    },
    onError: () => notificationService.error('A problem occurred while loading study settings')
})

const saveSettings = async () => {
    const newSettings = settingsModal.state
    studySettingsLoadable.loadWithFunction(async () => {
        let updatedSettings = studySettingsLoadable.value
        if (newSettings.currentMode == 'defaults') {
            await setDeckStudySettings(Number(newSettings.newLimitContent), Number(newSettings.reviewLimitContent))
            updatedSettings.defaultNewLimit = Number(newSettings.newLimitContent)
            updatedSettings.defaultReviewLimit = Number(newSettings.reviewLimitContent)
        }
        else if (newSettings.currentMode == 'today') {
            await setTodayStudySettings(Number(newSettings.newLimitContent), Number(newSettings.reviewLimitContent))
            updatedSettings.todayNewLimit = Number(newSettings.newLimitContent)
            updatedSettings.todayReviewLimit = Number(newSettings.reviewLimitContent)
        }
        reloadDeckCount()

        notificationService.success('Study settings saved successfully!')
        return updatedSettings
    })
}


//Methods
function openSettingsDialog() { settingsModal.open() }
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
function beginStudy() {
    const query = { tags: tags.value.selected }
    if (studyFocusText.value) {
        query.focus = studyFocusText.value
    }
    router.push({ name: 'Study Deck', params: { deckId: route.params.deckId }, query })
}
function beginAudioStudy() {
    premiumFeature.execute(() => {
        router.push({ name: 'Audio Study', params: { deckId: route.params.deckId } })
    }, () => {})
}
function beginStudyFocusPremium() {
    premiumFeature.execute(() => beginStudy(), () => {})
}
function unlockStats() {
    premiumFeature.execute(() => {}, () => {})
}
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
            notificationService.success('Card reset successfully!')
        } catch(e) {
            notificationService.error(`An error occurred: ${e.message}`)
        }
        reloadDeckCount()
    })
}

function downloadMacOS() {
    window.open(import.meta.env.VITE_IMPORT_UTILITY_MACOS_URL)
}

function downloadWindows() {
    console.log('Coming Soon')
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

// Load stats reactively when pro status resolves
watch(isProSubscriber, (isPro) => {
    if (isPro) {
        dueReviewsLoadable.load()
        dailyActivityLoadable.load()
    }
}, { immediate: true })

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


.table-container {
    border-top: #EEE solid 3px;
    padding-top: 20px;
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

.info-tooltip {
    margin-left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #AAA;
    border-radius: 5px;
    transition: 0.2s;
}

.el-icon.el-tooltip__trigger {
    padding: 7px;
}

.info-tooltip:hover {
    cursor: pointer;
    background-color: #EEE;
}

/* ── Deck Top Layout ─────────────────────────────────────────── */
.deck-top-layout {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
}

.deck-left-column {
    flex: 2;
    display: flex;
    flex-direction: column;
}

.deck-right-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

/* ── Filter Row ──────────────────────────────────────────────── */
.filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
}


/* ── Study Focus Row ─────────────────────────────────────────── */
.study-focus-row {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
}

.study-focus-row--locked {
    cursor: pointer;
    transition: opacity 0.2s;
}

.study-focus-row--locked:hover {
    opacity: 0.8;
}

.study-focus-locked-input {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 1px solid #ddd;
    background: #f9f9f9;
    color: #aaa;
    font-size: 14px;
    opacity: 0.7;
}

.study-focus-lock-icon {
    font-size: 12px;
    color: #bbb;
}

/* ── Study Divider ───────────────────────────────────────────── */
.study-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
}

.study-divider__line {
    flex: 1;
    height: 1px;
    background: #e0e0e0;
}

.study-divider__text {
    font-size: 13px;
    color: #aaa;
    font-weight: 500;
    text-transform: lowercase;
}

/* ── Voice Study Section (compact, horizontal) ───────────────── */
.voice-study-section {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border: 1.5px solid #eee;
    border-radius: 12px;
    background: #fff;
}

.voice-study-section__header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.voice-study-section__icon {
    font-size: 18px;
    color: var(--el-color-primary);
}

.voice-study-section__title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.voice-study-section__subtitle {
    font-size: 13px;
    color: #888;
    margin: 0;
    flex: 1;
}

/* ── Stats Panel ─────────────────────────────────────────────── */
.stats-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.stats-content--blurred {
    filter: blur(3px);
    pointer-events: none;
    user-select: none;
}

.stats-section__title {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    margin: 0 0 4px 0;
}

.stats-blurred-wrapper {
    position: relative;
}

.stats-unlock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    z-index: 1;
}
</style>

<style>
.el-collapse-item__header {
    flex-direction: row-reverse;
}

.card-table td img {
    max-width: 70%;
    border: solid 1px #EEE;
}
</style>