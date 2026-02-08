<template>
<div>
    <div class='return-link' @click='returnToDeck' style='margin-top: 40px; margin-left: 30px;'>
        <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
    </div>
    <div class='page-container'>
        <div style='flex: 0.25;'></div>
        <el-col span='12' class='content' v-if='buildingQuiz' v-loading='generating' justify='center' element-loading-text="We're getting your quiz ready as we speak!">
            <h1>Select Reference Notes</h1>
            <p>Select up to 5 notes to use as a reference, and we'll generate an all-new quiz based off of those cards!</p>
            <h2 class='selection-count'>{{ numSelected }}/5 selected</h2>
            <div class='search-bar'>
                <el-input v-model='searchValue' prefix-icon='search' size='large' placeholder='Search'/>
            </div>

            <div class='table-container'>

                <div class='table-header' style='display: flex; align-items: center; margin-bottom: 5px;'>
                    <h3>All Notes ({{ table.noteCount }})</h3>
                    
                    <div class='flex-spacer'></div>
                    
                    
                </div>

                <el-table :data='displayedNotes.slice(notesPage * 20, notesPage * 20 + 20)' v-loading='table.loading' style='width: 100%;' stripe height='400'>
                    <el-table-column label='Active?' width='90'>
                            <template v-slot='scope'>
                                <el-checkbox v-model='selectedNotes[scope.row.id]' :disabled='!selectedNotes[scope.row.id] && numSelected >= 5' size='large'></el-checkbox>
                            </template>
                        </el-table-column>
                    <el-table-column label='Note ID' v-slot='scope' width='180'>
                        <p style='color: #AAA;'>{{ scope.row.id }}</p>
                    </el-table-column>
                    <el-table-column prop='frontContent' label='Front Content' style='flex: 1'>
                    </el-table-column>
                    <el-table-column prop='backContent' label='Back Content' style='flex: 1'></el-table-column>
                </el-table>

                <el-pagination background layout='prev, pager, next' :total='table.noteCount' :page-size='20' @current-change='onTableCurrentPageChange' style='margin-top: 20px; margin-bottom: 20px'>

                </el-pagination>

                
            </div>

            <div class='submitter'>
                <el-button @click='generateQuiz' size='large' type='primary' :disabled='numSelected < 1'>Generate Quiz!</el-button>
            </div>
        </el-col>
        <div style='flex: 0.25;'></div>
    </div>
</div>
</template>

<script setup>
import useDecks from '../composables/api/useDecks'
import useDeck from '../composables/api/useDeck'
import useNotes from '../composables/api/useNotes'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { setThemeColor } from '../utils'
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router' 
import { generate } from '@vue/compiler-core'

const router = useRouter()
const route = useRoute()

const buildingQuiz = ref(true)
const generating = ref(false)

const { fetchDeck } = useDecks()
const deckOperations = useDeck(route.params.deckId)
const notesOperations = useNotes(route.params.deckId)

const searchValue = ref('')
const deck = ref(null)
const table = reactive({
    loading: false,
    notes: [],
    noteCount: 0
})


const selectedNotes = reactive({})
const numSelected = computed(() => {
    let n = 0
    for (let item in selectedNotes) {
        if (selectedNotes[item]) n++
    }
    return n
})

const displayedNotes = computed(() => {
    return table.notes.filter(note => {
        const search = searchValue.value.toLowerCase().trim()

        return note.frontContent?.toLowerCase().includes(search) || note.backContent?.toLowerCase().includes(search) || note.extraContent?.toLowerCase().includes(search)
    })
})

const notesPage = ref(0)



const onTableCurrentPageChange = (newPage) => {
    notesPage.value = newPage - 1
}

const loadDeck = () => {
    fetchDeck(route.params.deckId).then(_deck => {
        deck.value = _deck
        setThemeColor(deck.value.primaryColor, document.documentElement)

        loadNotes().finally(() => {
            table.loading = false
        })
    })
}

const notesCount = () => {
    let count = 0
    for (const [key, value] of Object.entries(table.notes)) {
        count += value.length
    }
    return count
}

const pagesLoaded = () => Math.ceil(table.notes.length /20)
const pagesToLoad = () => Math.ceil(table.noteCount/20) - pagesLoaded()

const loadNotes = async () => {
    if (!deck.value) return
    
    table.loading = true

    let page = 0

    

    do {
        try {
            let result = await notesOperations.fetchDeckNotes(page)
            const { notes, count } = result
            table.notes.push(...notes.map( item => item.export() ))
            table.noteCount = count

            page++
        } catch(err) {
            break;
        }
    } while (true)
}

function processCompletion(completion) {
    let string = completion.choices[0].text.trim()
    string = string.slice(string.indexOf('1.'), string.length)
    let arrs = string.split('\n')
    arrs = arrs.filter(item => {
        return item[0] in ('123456789'.split(''))
    })
    return arrs
}

const generateQuiz = () => {
    generating.value = true

    let referenceNoteIds = Object.keys(selectedNotes).filter(note => {
        return selectedNotes[note]
    })
    
    deckOperations.generateAIQuiz(referenceNoteIds).then((result) => {

        const filePath = result.qaFilePath
        router.push({
            name: 'Quiz',
            params: {
                quizPath: encodeURIComponent(filePath).replace('.json', ''),
                deckId: deck.value.id
            }
        })

    }).finally(() => {
        generating.value = false
    })
}

const returnToDeck = () => {
    router.push({
        name: 'View Deck',
        params: {
            decKId: deck.value.id
        }
    })
}


onMounted(() => {
    loadDeck()
})

</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: row;
}

.content {
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    font-size: 40px;
}

.search-bar {
    width: 70%;
    margin-top: 15px;
}

.table-container {
    width: 100%;
}

.selection-count {
    color: var(--el-color-primary);
}

.submitter {
    margin: 25px;
}

.qa {
    white-space: pre-line;
    background: #EEE;
    border-radius: 20px;
    padding: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.question-display,.answer-display {
    margin-bottom: 20px;
}

.return-link:hover {
    cursor: pointer;
    text-decoration: underline;
}
</style>