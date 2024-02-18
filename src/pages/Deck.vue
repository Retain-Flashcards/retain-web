<template>
    <div v-if='deck' style='height: 100%; width: 100%;'>
        
        <div class='main-header' :style='{ backgroundImage: `url(${deck.coverImage})` }'>
            <div class='flex-spacer background-overlay' :style="{ backgroundColor: 'var(--el-color-primary-overlay)' }">
                <div class='return-link' @click='() => { this.$router.push({ name: "Home" }) }'>
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
                    @change='onTagsChanged'>
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

                        <el-table :data='crams.sessions' v-loading='crams.loading' style='width: 100%;' stripe>
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
                    <div class='table-container'>

                        <el-table :data='quizzes' v-loading='loadingQuizzes' style='width: 100%;' stripe>
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
                </el-collapse-item>
            </el-collapse>

            <div class='due-container' style='margin-top: 0px; margin-bottom: 50px;'>
                
            </div>

            <div class='table-container'>

                <div class='table-header' style='display: flex; align-items: center; margin-bottom: 5px;'>
                    <h3>All Notes ({{ table.noteCount }})</h3>
                    <el-button v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1' type='primary' style='margin-left: 30px;' @click='createNotes'>
                        <el-icon style='margin-right: 5px;'><Plus /></el-icon> Add Notes
                    </el-button>
                    <div class='flex-spacer'></div>
                </div>

                <el-table :data='table.notes[this.notesPage]' v-loading='table.loading' style='width: 100%;' stripe>
                    <el-table-column label='Note ID' v-slot='scope' width='180'>
                        <p style='color: #AAA;'>{{ scope.row.id }}</p>
                    </el-table-column>
                    <el-table-column prop='frontContent' label='Front Content' style='flex: 1'>
                    </el-table-column>
                    <el-table-column prop='backContent' label='Back Content' style='flex: 1'></el-table-column>
                    <el-table-column label='Active?' width='90'>
                        <template v-slot='scope'>
                            <el-checkbox v-model='scope.row.active'></el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label='Edit' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                        <template v-slot='scope'>
                            <el-button  @click='() => editNote(scope.row.id)'>Edit</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label='Reset' width='105'>
                        <template v-slot='scope'>
                            <el-button :loading='scope.row.loadingReset || false' plain type='warning' @click='() => resetNote(scope.$index, scope.row.id)'>Reset</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label='Delete' width='90' v-if='deck.accessLevel == undefined || deck.accessLevel == null || deck.accessLevel > 1'>
                        <template v-slot='scope'>
                            <el-button type='danger' plain @click='deleteNote(scope.$index, scope.row.id)'>Delete</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <el-pagination background layout='prev, pager, next' :total='table.noteCount' :page-size='20' @next-click='onTableNextClick' @prev-click='onTablePrevClick' @current-change='onTableCurrentPageChange' style='margin-top: 20px; margin-bottom: 100px;'>

                </el-pagination>

                <el-dialog 
                    v-model='deckSettings.editing' title='Study Settings'>
                    <loadable-provider :loadable='deckSettingsLoadable'>
                        <template #data='data'>
                            <div style='display: flex; flex-direction: column; align-items: center;'>
                                <el-form label-position='top' style='width: 100%;'>
                                    <el-form-item label='New Limit'>
                                        <el-input v-model='deckSettings.newLimit' type='number'></el-input>
                                    </el-form-item>
                                    <el-form-item label='Review Limit'>
                                        <el-input v-model='deckSettings.reviewLimit' type='number'></el-input>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-radio-group v-model='deckSettings.mode'>
                                            <el-radio-button label='defaults'>Set as Deck Defaults</el-radio-button>
                                            <el-radio-button label='today'>Just For Today</el-radio-button>   
                                        </el-radio-group>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button type='primary' @click='saveStudySettings'>Save</el-button>
                                    </el-form-item>
                                </el-form>
                            </div>
                        </template>
                    </loadable-provider>
                </el-dialog>

            </div>
        </div>

    </div>
</template>

<script>
import useFlashcards from '../composables/UseFlashcards'
import LoadableProvider from '../components/LoadableProvider.vue'
import Loadable from '../model/loadable.js'
import { Plus, ArrowLeft, InfoFilled, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { setThemeColor } from '../utils'

const { getDeck, getDeckNotes, deleteNote, resetNote, getQuizzes, getQuizPath, listCramSessions, loadDeckTags, getDeckStudySettings, setDeckStudySettings, setTodayStudySettings } = useFlashcards()

export default {
    setup() {
    },
    mounted() {
        this.loadDeck().then(() => {
            this.deckSettingsLoadable.loadWithFuture(async () => {
                const settings = await getDeckStudySettings(this.deck)
                this.deckSettings.newLimit = settings.newLimit
                this.deckSettings.reviewLimit = settings.reviewLimit
                if (settings.today) this.deckSettings.mode = 'today'
                return settings
            })
        })
        
    },
    data() {
        return {
            deck: null,
            notesPage: 0,
            table: {
                loading: true,
                notes: {},
                noteCount: 0
            },
            crams: {
                loading: true,
                sessions: []
            },
            quizzes: [],
            loadingQuizzes: true,
            tags: {
                loading: true,
                options: [],
                selected: []
            },
            deckSettings: {
                editing: false,
                newLimit: 20,
                reviewLimit: 20,
                mode: 'defaults'
            }, 
            deckSettingsLoadable: new Loadable()
        }
    }, 
    methods: {
        async loadDeck() {
            const deck = await getDeck(this.$route.params.deckId)
            this.deck = deck
            console.log(this.deck)
            setThemeColor(this.deck.primaryColor, document.documentElement)

            this.loadNotes()
            this.loadQuizzes()
            this.loadCramSessions()

            const result = await loadDeckTags(this.$route.params.deckId)
            this.tags.options = result
            this.tags.loading = false
        },

        onTagsChanged(selectedTags) {
            this.reloadDeckCount()
        },

        openSettingsDialog() {
            this.deckSettings.editing = true
        },

        saveStudySettings() {
            this.deckSettingsLoadable.loadWithFuture(async () => {
                if (this.deckSettings.mode == 'defaults')
                    await setDeckStudySettings(this.deck, this.deckSettings.newLimit, this.deckSettings.reviewLimit)
                else if (this.deckSettings.mode == 'today')
                    await setTodayStudySettings(this.deck, this.deckSettings.newLimit, this.deckSettings.reviewLimit)
            })
        },

        enterCramMode() {
            this.$router.push({
                name: 'Cram Builder',
                params: {
                    deckId: this.deck.id
                }
            })
        },

        openCramSession(cramId) {
            this.$router.push({
                name: 'Cram',
                params: {
                    deckId: this.deck.id,
                    cramId: cramId
                }
            })
        },

        createQuiz() {
            this.$router.push({
                name: 'QuizBuilder',
                params: {
                    deckId: this.deck.id
                }
            })
        },

        reloadDeckCount() {
            getDeck(this.$route.params.deckId, this.tags.selected).then(deck => {
                this.deck = deck
            })
        },

        editNote(noteId) {
            this.$router.push({
                name: 'Edit Card',
                params: {
                    deckId: this.deck.id,
                    noteId: noteId
                }
            })
        },

        loadNotes() {
            if (!this.deck) return
            
            this.table.loading = true
            const pagesLoaded = this.notesCount() / 20
            const pagesToLoad = this.notesPage - pagesLoaded

            getDeckNotes(this.deck, this.notesPage).then(result => {
                const { notes, count } = result
                this.table.notes[this.notesPage] = [...notes.map( item => item.export() )]
                this.table.noteCount = count
            }).catch(error => {
                console.log(error)
            }).finally(() => {
                this.table.loading = false
            })
        },

        loadQuizzes() {
            if (!this.deck) return
            this.loadingQuizzes = true
            getQuizzes(this.deck.id).then(result => {
                console.log(result)
                this.quizzes = result.map(item => { 
                    let path = item.path.split('/') 
                    let quizId = path[path.length - 1]
                    return {
                        path: quizId,
                        topics_list: item.topics_list
                    }
                })
            }).finally(() => {
                this.loadingQuizzes = false
            })

        },

        loadCramSessions() {
            if (!this.deck) return
            this.crams.loading = true
            listCramSessions(this.deck.id).then(result => {
                this.crams.sessions = result
            }).finally(() => {
                this.crams.loading = false
            })
        },

        openQuiz(quizName) {

            const quizPath = getQuizPath(quizName, this.deck.id)

            this.$router.push({
                name: 'Quiz',
                params: {
                    deckId: this.deck.id,
                    quizPath: quizPath
                }
            })

        },

        notesCount() {
            let count = 0
            for (const [key, value] of Object.entries(this.table.notes)) {
                count += value.length
            }
            return count
        },  

        onTableNextClick(currentPage) {
            const pagesLoaded = this.notesCount() / 20
            if (currentPage > pagesLoaded) {
                this.notesPage = currentPage - 1
                this.loadNotes()
            }
        },

        onTablePrevClick(currentPage) {
            const pagesLoaded = this.notesCount() / 20
            if (currentPage > 0) {
                this.notesPage = currentPage - 1
            }
        },

        onTableCurrentPageChange(currentPage) {
            const pagesLoaded = this.notesCount() / 20
            console.log(currentPage)
            if (currentPage > pagesLoaded) {
                console.log('test')
                this.notesPage = currentPage - 1
                this.loadNotes()
            }
            else if (currentPage > 0 && currentPage != this.notesPage + 1) {
                this.notesPage = currentPage - 1
            }
        },

        deleteNote(index, noteId) {
            this.table.loading = true
            deleteNote(noteId).then(() => {

                //Reload current page
                this.table.notes[this.notesPage].splice(index, 1)

            }).catch(error => {

            }).finally(() => this.table.loading = false)
        },

        resetNote(index, noteId) {

            this.table.notes[this.notesPage][index].loadingReset = true
            resetNote(noteId).then((result) => {
                ElMessage({
                    message: 'Card reset successfully!',
                    type: 'success'
                })
            }).catch(error => {
                ElMessage({
                    message: `An error occurred: ${error.message}`,
                    type: 'error'
                })
            }).finally(() => {
                this.table.notes[this.notesPage][index].loadingReset = false
                this.reloadDeckCount()
            })

        },

        beginStudy() {

            //TODO
            console.log('Beginning study')
            this.$router.push({
                name: 'Study Deck',
                params: {
                    deckId: this.deck.id
                },
                query: {
                    tags: this.tags.selected
                }
            })

        },

        createNotes() {
            this.$router.push({
                name: 'Create Cards',
                params: {
                    deckId: this.deck.id
                }
            })
        }
    }
}

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