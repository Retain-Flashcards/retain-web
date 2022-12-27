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
            <el-result v-if='deck.reviewCount == 0 && deck.newCount == 0' icon="success" title="Done for the Day!" subTitle="No Reviews Due">
                <template slot="extra">
                    <el-button type="primary" size="medium">Back</el-button>
                </template>
            </el-result>
            <div v-else class='due-container'>
                <h2>Due Now</h2>
                <div class='stats'>
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

                <el-pagination background layout='prev, pager, next' :total='table.noteCount' :page-size='20' @next-click='onTableNextClick' @prev-click='onTablePrevClick' @current-change='onTableCurrentPageChange' style='margin-top: 20px;'>

                </el-pagination>

            </div>
        </div>

    </div>
</template>

<script>
import useFlashcards from '../composables/UseFlashcards'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { setThemeColor } from '../utils'

const { getDeck, getDeckNotes, deleteNote, resetNote } = useFlashcards()

export default {
    setup() {
    },
    mounted() {
        this.loadDeck()
    },
    data() {
        return {
            deck: null,
            notesPage: 0,
            table: {
                loading: true,
                notes: {},
                noteCount: 0
            }
        }
    }, 
    methods: {
        loadDeck() {
            getDeck(this.$route.params.deckId).then(deck => {
                this.deck = deck
                setThemeColor(this.deck.primaryColor, document.documentElement)

                this.loadNotes()
            })
        },

        reloadDeckCount() {
            getDeck(this.$route.params.deckId).then(deck => {
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
    margin-top: 50px;
}



.stats {
    position: relative;
    border: #EEE solid 3px;
    margin-top: 20px;
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
</style>