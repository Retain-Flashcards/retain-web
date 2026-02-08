<template>
    <div class='content-container'>
        <loadable-provider :loadable='pageLoadable'>
            <template #default='{loading}'>
                <el-header v-loading='loading' v-if='deck' style='padding: 0px;'>
                    <div style='display: flex; align-items: center; margin-top: 20px; padding-bottom: 20px;'>
                        <div class='flex-spacer'>
                            <return-link @click='returnToDeck'>Return to deck</return-link>
                        </div>

                        <!--Progress Indicator-->
                        <span style='font-size: 20px; font-weight: bold;'>Cramming:</span>
                        <span style='font-size: 20px; margin-left: 5px; color: var(--el-color-primary); font-weight: bold;'>{{ deck.title }}</span>
                        <div class='flex-spacer' style='display: flex; flex-direction: row; justify-content: flex-end; padding-right: 30px;'>
                            <h2 class='progress-text'>{{ studyLog.studied.length }} / {{  cards.length  }}</h2>
                        </div>
                    </div>

                    <!--Progress Bar-->
                    <div class='progress-container'>
                        <div class='progress' :style='{width: `${progress * 100}%`}'></div>
                    </div>
                </el-header>
                
                <el-main style='display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; margin: auto; margin-bottom: 100px;'>
                    
                    <!--Finish Screen-->
                    <div style='text-align: center;' v-if='studyLog.toReview.length == 0'>
                        <el-result icon="success" title="You're Finished!"></el-result>
                        <brand-button type="primary" @click='resetCram'>Go again?</brand-button>
                    </div>

                    <!--Card Display-->
                    <card-study-view class='preview' v-if='card' :content="flipped ? card.backContent:card.frontContent" height='400px'></card-study-view>
                    <el-divider v-if='card && flipped && card.extraContent.length > 0'></el-divider>
                    <card-study-view class='preview' v-if='card && flipped && card.extraContent.length > 0' :content="card.extraContent" height='400px'></card-study-view>
                </el-main>

                <!--Bottom Bar-->
                <footer class='bottom-bar'>
                    <!--Flip Button-->
                    <div v-if='!flipped' style='display: flex; align-items: center; width: 100%; background: #EEE; padding-bottom: 0px; padding-top: 15px;'>
                        <div class='flex-spacer'></div>
                        <brand-button type='primary' size='large' style='width: 50%;' @click='flipCard'>Flip</brand-button>
                        <div class='flex-spacer'></div>
                    </div>

                    <!--Result Score-->
                    <div class='check-boxes' v-if='flipped'>
                        <div class='flex-spacer'></div>
                        <brand-button style='flex: 1;' type='success' size='large' @click='() => studyCard(true)'><el-icon class="el-icon--right"><b><Check /></b></el-icon></brand-button>
                        <div style='width: 10px;'></div>
                        <brand-button style='flex: 1;' type='error' size='large' @click='() => studyCard(false)'><el-icon class="el-icon--right"><b><Close /></b></el-icon></brand-button>
                        <div class='flex-spacer'></div>
                    </div>

                    <!--Key Binding Indicators-->
                    <div style='width: 100%; text-align: center; font-size: 13px; margin-bottom: 0px; margin-top: 10px; color: #888;'>
                        <span v-if='!flipped'><KeyBindingIndicator>Spacebar</KeyBindingIndicator> to flip the card</span>
                        <span v-if='flipped'><KeyBindingIndicator>1</KeyBindingIndicator> = Correct,  <KeyBindingIndicator>2</KeyBindingIndicator> = Incorrect</span>
                    </div>
                </footer>
            </template>
            <template #loading>
                <el-skeleton style='margin: 50px;'></el-skeleton>
            </template>
            <template #error>
                <error-page message='There was a problem loading the deck. Please try again.'></error-page>
            </template>
        </loadable-provider>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive, watch, onBeforeMount, onBeforeUnmount } from 'vue'

//UI Components
import KeyBindingIndicator from '../components/basic/KeyBindingIndicator.vue'
import Card from '../model/objects/Card'
import CardStudyView from '../components/basic/cards/CardStudyView.vue'
import ReturnLink from '../components/basic/ReturnLink.vue'
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import BrandButton from '../components/basic/BrandButton.vue'

//Composables
import { useRoute, useRouter } from 'vue-router'
import useDeck from '../composables/api/useDeck'
import useDecks from '../composables/api/useDecks'
import useNotificationService from '../composables/ui/useNotificationService'
import useLoadable from '../composables/ui/useLoadable'

//Utils
import { setThemeColor } from '../utils'

const route = useRoute()
const router = useRouter()

const { fetchDeck } = useDecks()
const deckOperations = useDeck(route.params.deckId)

const notificationService = useNotificationService()

const loading = ref(true)
const progressBar = ref(null)

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

const pageLoadable = useLoadable(async () => {
    const result = await fetchDeck(route.params.deckId)
    deck.value = result
    setThemeColor(result.primaryColor, document.documentElement)
    const cramSession = await deckOperations.getCramSession(route.params.cramId)
    const cardsList = cramSession.map(item => new Card(item.cards))
    cards.value = cardsList
    studyLog.studied = []
    studyLog.toReview = cardsList.slice(0)
    setNextCard()
}, {
    autoload: true
})

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

        notificationService.success('Moved to Back of Deck!')
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

onBeforeMount(() => {
    window.addEventListener('keyup', keyListener)
})

onBeforeUnmount(() => {
    window.removeEventListener('keyup', keyListener)
})
</script>

<style scoped>

.preview {
    text-align: left;
    background: #EEE;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 32px;
    padding-bottom: 32px;
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
    flex-direction: column; 
    padding: 10px; 
    background: #EEE; 
    border-top: 2px #EEE solid; 
    z-index: 20; 
    max-width: 100%;
}

.check-boxes {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.progress-text {
    margin: 0px;
    color: var(--el-color-primary);
}
</style>