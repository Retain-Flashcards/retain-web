<template>

    <div class='content-container'>
        <el-header v-loading='loading' v-if='deck' style='padding: 0px;'>
            <div style='display: flex; align-items: center; margin-top: 20px; padding-bottom: 20px;'>
                <div class='flex-spacer'>
                    <div class='return-link' @click='returnToDeck' style='margin-left: 10px; display: flex; flex-direction: row; align-items: center;'>
                        <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
                    </div>
                </div>
                <span style='font-size: 20px; font-weight: bold;'>Cramming:</span>
                <span style='font-size: 20px; margin-left: 5px; color: var(--el-color-primary); font-weight: bold;'>{{ deck.title }}</span>
                <div class='flex-spacer' style='display: flex; flex-direction: row; justify-content: flex-end; padding-right: 30px;'>
                    <h2 class='progress-text'>{{ studyLog.studied.length }} / {{  cards.length  }}</h2>
                </div>
            </div>
            <div class='progress-container'>
                <div class='progress' ref='progressBar'></div>
            </div>
        </el-header>
        
        <el-main style='display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; margin: auto; margin-bottom: 100px;'>
            
            <div style='text-align: center;' v-if='studyLog.toReview.length == 0'>
                <el-result icon="success" title="You're Finished!"></el-result>
                <el-button type="primary" @click='resetCram'>Go again?</el-button>
            </div>
            <v-md-preview class='preview' :text="flipped ? card.backContent:card.frontContent" v-if='card' height='400px'></v-md-preview>
            <el-divider v-if='card && flipped && card.extraContent.length > 0'></el-divider>
            <v-md-preview class='preview' :text="card.extraContent" v-if='card && flipped && card.extraContent.length > 0' height='400px'></v-md-preview>
        </el-main>
        <div class='bottom-bar'>
            <div class='flex-spacer'></div>
            <el-button style='flex: 1;' type='success' v-if='flipped' size='large' @click='() => studyCard(true)'><el-icon class="el-icon--right"><b><Check /></b></el-icon></el-button>
            <el-button style='flex: 1;' type='danger' v-if='flipped' size='large' @click='() => studyCard(false)'><el-icon class="el-icon--right"><b><Close /></b></el-icon></el-button>
            <div class='flex-spacer'></div>
        </div>
    </div>
    
</template>

<script setup>
import { onMounted, ref, computed, reactive, watch, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useFlashcards from '../composables/UseFlashcards'
import { setThemeColor } from '../utils'
import { ElMessage } from 'element-plus'
import Card from '../model/objects/Card'

const { getDeck, getCramSession } = useFlashcards()

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const progressBar = ref()

const deck = ref(null)

const cards = ref([])
const card = ref(null)

const flipped = ref(false)

const studyLog = reactive({
    studied: [],
    toReview: []
})

const progress = computed(() => {
    if (cards.value.length == 0) return 1
    return studyLog.studied.length / cards.value.length
})

watch(studyLog, (value, oldValue) => {
    progressBar.value.style.width = `${progress.value * 100}%`
})

const loadDeck = () => {
    loading.value = true
    getDeck(route.params.deckId).then(result => {
        deck.value = result
        setThemeColor(deck.value.primaryColor, document.documentElement)

        loadCramSession()
    }).finally(() => {
        loading.value = false
    })
}

const loadCramSession = () => {
    getCramSession(route.params.cramId).then(result => {
        const cardsList = result.map(item => new Card(item.cards))
        cards.value = cardsList
        studyLog.studied = []
        studyLog.toReview = cardsList.slice(0)
        setNextCard()
    })
}

const setNextCard = () => {
    flipped.value = false
    card.value = studyLog.toReview[0]
}

const studyCard = (correct) => {
    if (correct) {
        studyLog.studied.push( studyLog.toReview.shift() )
    }
    else {
        const currentCard = studyLog.toReview.shift()
        studyLog.toReview.push(currentCard)

        ElMessage.success({
            message: 'Moved to Back of Deck!'
        })
    }
    
    setNextCard()
}

const returnToDeck = () => {
    router.push({
        name: 'View Deck',
        params: {
            deckId: route.params.deckId
        }
    })
}

function keyListener(e) {
    if (e.key == ' ' && !flipped.value) {
        flipCard()
    }

    else if (flipped.value) {
        if (e.key == ' ' || e.key == '1') {
            studyCard(true)
        } else if (e.key == '2') {
            studyCard(false)
        }
    }

}

const flipCard = () => {
    flipped.value = true
}

const resetCram = () => {
    studyLog.studied = []
    studyLog.toReview = cards.value.slice(0)
    setNextCard()
}

onMounted(() => {
    loadDeck()
}) 

onBeforeMount(() => {
    window.addEventListener('keyup', keyListener)
})

onBeforeUnmount(() => {
    window.removeEventListener('keyup', keyListener)
})
</script>

<style>

.preview {
    text-align: left;
    background: #EEE;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 32px;
    width: 100%;
}

.action-item {
    margin-left: 20px;
    margin-right: 20px;
    font-size: 15px;
    text-align: center;
}

.action-item-time {
    margin-top: 5px;
}

.footer {
    background: #EEE;
    padding-top: 10px;
}

.return-link:hover {
    text-decoration: underline;
    cursor: pointer;
}
.progress-container {
    background: var(--el-color-primary-light-6);
    height: 5px;
    position: relative;
    left: 0px;
    top: 0px;
    width: 100%;
    border-radius: 200px;
    margin-bottom: 30px;
}

.progress {
    background: var(--el-color-primary);
    height: 100%;
    width: 50%;
    position: relative;
    left: 0px;
    top: 0px;
    border-radius: 200px;
    transition: 0.1s;
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

.progress-text {
    margin: 0px;
    color: var(--el-color-primary);
}
</style>