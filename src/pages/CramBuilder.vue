<template>
    <div>
        <div class='return-link' @click='returnToDeck' style='margin-top: 40px; margin-left: 30px;'>
            <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
        </div>
        <div class='page-container'>
            <div style='flex: 0.25;'></div>
            <el-col style='flex: 0.5;' class='content' v-loading='loading' justify='center'>
                <h1>Build Your Cramming Study Set</h1>
                <p>Here's a timeline of your notes as you've added them.</p>
                <p id="paragraph-that-needs-more-space-on-the-bottom">Select the notes you'd like to study!</p>
                <div class='search-bar'>
                    <el-input v-model='searchValue' prefix-icon='search' size='large' placeholder='Search'/>
                </div>
                <div class='table-container' style='margin-top: 20px;'>
                    <div class='table' v-for='(noteGroup, index) in noteGroups'>
                        <h2>{{ new Date(noteGroup[0].createdAt).toDateString() }} - {{ new Date(noteGroup[noteGroup.length - 1].createdAt).toDateString() }}</h2>
                        <div class='colored-divider'></div>
                        <el-table :ref='(el) => tables[index] = el' @selection-change='(notes) => handleChange(index, notes) ' :data='noteGroup.filter(item => {const search = searchValue.toLowerCase().trim();return item.frontContent?.toLowerCase().includes(search) || item.backContent?.toLowerCase().includes(search)})' style='width: 100%;' stripe max-height='500'>
                            <el-table-column type='selection'></el-table-column>
                            <el-table-column label='Front Content' style='flex: 1'>
                                <template v-slot='scope'>
                                    <p v-html='scope.row.frontContent'></p>
                                </template>
                            </el-table-column>
                            <el-table-column label='Back Content' style='flex: 1' prop='backContent'>
                                
                            </el-table-column>
                        </el-table>
                        <div class='timeline-graphic'>
                            <div class='flex-spacer'></div>
                            <div class='timeline'></div>
                            <div class='flex-spacer'></div>
                        </div>
                    </div>
                </div>
            </el-col>
            <div style='flex: 0.25;'></div>
        </div>
        <div class='bottom-bar'>
            <div class='flex-spacer'></div>
            <el-button type='primary' size='large' @click='startStudy'>Let's Study!<el-icon class="el-icon--right"><b><Right /></b></el-icon></el-button>
        </div>
    </div>
    </template>
    
<script setup>
import useFlashcards from '../composables/UseFlashcards'
import { Right } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { setThemeColor } from '../utils'
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router' 
import { generate } from '@vue/compiler-core'
import Note from '../model/objects/Note'

const { getNoteGroups, getDeck, createCramSession } = useFlashcards()

const router = useRouter()
const route = useRoute()

const noteGroups = ref([])

const selectedNotes = reactive({})
const tables = ref({})
const numSelected = ref(0)

const handleChange = (noteGroupIndex, notes) => {
    selectedNotes[noteGroupIndex] = notes
}

const searchValue = ref('')

const deck = ref(null)
const loading = ref(true)

const loadDeck = () => {
    getDeck(route.params.deckId).then(_deck => {
        deck.value = _deck
        setThemeColor(deck.value.primaryColor, document.documentElement)

        loadNotes().finally(() => {
            loading.value = false
        })
    })
}

const loadNotes = async () => {
    await getNoteGroups(deck.value.id).then(result => {
        noteGroups.value = []

        let temp = []
        for (let i = 0; i < result.length; i++) {
            if (result[i].group_label == null) temp.push(new Note(result[i]))
            else {
                noteGroups.value.push(temp)
                temp = [ new Note(result[i])  ]
            }
        }

        noteGroups.value.push(temp)
    })
}

const startStudy = () => {
    let consolidatedArray = []
    for (let i in selectedNotes) {
        consolidatedArray.push(...selectedNotes[i])
    }

    loading.value = true
    
    createCramSession(deck.value.id, consolidatedArray.map(item => item.id)).then(result => {
        router.push({
            name: 'Cram',
            params: {
                deckId: deck.value.id,
                cramId: result
            }
        })
    }).finally(() => {
        loading.value = false
    })
    /**/
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

<style>

.table {
    text-align: left;
}

h2 { 
    margin-bottom: 0px;
}

.colored-divider {
    background: var(--el-color-primary);
    height: 3px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.timeline-graphic {
    display: flex;
    flex-direction: row;
    height: 150px;
    margin: 30px;
}

.timeline {
    background: #EEE;
    width: 3px;
}

.bottom-bar {
    position: fixed; 
    bottom: 0px; 
    left: 0px;
    right: 0px;
    display: flex; 
    flex-direction: row; 
    align-items: center; 
    padding: 20px; 
    background: white; 
    border-top: 2px #EEE solid; 
    z-index: 20; 
    max-width: 100%;
}

.bottom-bar h2 {
    margin-top: 0px;
    color: var(--el-color-primary);
}

.content {
    display:flex;
    flex-direction: column;
    align-items:center;
    width: 100%;
}

p {
    padding-bottom: 10px;
}

#paragraph-that-needs-more-space-on-the-bottom {
    padding-bottom: 20px;
}

.search-bar {
    width: 100%;
}

.table-container {
    width: 100%;
}

</style>