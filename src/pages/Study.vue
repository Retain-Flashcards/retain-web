<template>
<div class='content-container'>

    <!--Header with Deck Info-->
    <LoadableProvider :loadable='deckLoadable'>

        <template #error>
            <error-page message='Failed to load deck. Please try again.'></error-page>
        </template>

        <template #default='{ loading, data: deck }'>
            <el-header v-loading='loading' v-if='deck' style='margin-bottom: 30px;'>
                <return-link @click='returnToDeck'>Return to deck</return-link>

                <section-layout>
                    <template #header>
                        <div style='display: flex; align-items: center; justify-content: space-between;'>
                            <span style='font-size: 30px;'>Studying:</span>
                            <span style='font-size: 30px; margin-left: 5px; color: var(--el-color-primary); font-weight: bold;'>{{ deck.title }}</span>
                            <LoadableStateProvider :loadable='tagOptionsLoadable' v-slot='{ loading, data: tagOptions }'>
                                <el-select-v2 v-model='selectedTags' 
                                    placeholder='Filter by Tags...' 
                                    style='width: 200px; margin-left: 20px;'
                                    multiple
                                    filterable
                                    :options='tagOptions || []'
                                    :props='{label: "name", value: "id"}'
                                    tag-type='danger'
                                    :loading='loading'
                                    @change='onTagsChanged'>
                                </el-select-v2>
                            </LoadableStateProvider>
                        </div>
                    </template>

                    <template #actions>
                        <brand-button v-if='currentCardLoadable.value' type='primary' :plain='true' style='margin-right: 30px;' @click='editCard'>Edit Card</brand-button>
                        <LoadableStateProvider :loadable='currentCardLoadable' v-slot='{ data: card }'>
                            <div v-if='card' style='font-size: 30px; display: flex;'>
                                <div v-if='counters.newLeft || counters.reviewsLeft' class='count' style='color: var(--el-color-primary); margin-right: 30px; text-align: center;'>
                                    <p>{{ counters.newLeft }}</p>
                                    <p :style="{ textDecoration: !card.lastReviewed ? 'underline':'none', fontSize: '15px' }">New</p>
                                </div>
                                <div v-if='counters.newLeft || counters.reviewsLeft' class='count' style='color: var(--el-color-primary-light-4); margin-right: 30px; text-align: center;'>
                                    <p >{{ counters.reviewsLeft }}</p>
                                    <p :style="{ textDecoration: card.lastReviewed ? 'underline':'none', fontSize: '15px' }">Review</p>
                                </div>
                            </div>
                        </LoadableStateProvider>
                    </template>
                </section-layout>
            </el-header>
        </template>
    </LoadableProvider>

    <!--Card View-->
    <LoadableProvider :loadable='currentCardLoadable'>
        <template #error>
            <error-page message='Failed to load card. Please try again.'></error-page>
        </template>

        <template #default='{ loading: loadingCard, data: card }'>
            <el-main v-loading='loadingCard || studyCardLoadable.isLoading' style='display: flex; flex-direction: column; align-items: stretch; justify-content: center; width: 50%; max-width: 50%; overflow-x: hidden; margin: auto; margin-bottom: 200px; margin-top: 20px;'>
                
                <!--Done with Cards-->
                <div style='text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;' v-if='done'>
                    <el-result icon="success" title="You're Finished!" subTitle="No more cards to review today!"></el-result>
                    <brand-button type="primary" size="medium" @click='goToDeck'>Back to Deck</brand-button>
                </div>

                <!--Main Content Display-->
                <card-study-view class='preview' v-if='card' :content="flipped ? card.backContent:card.frontContent" height='400px'></card-study-view>
                
                <!--Extra Content Display-->
                <el-divider v-if='card && flipped && card.extraContent.length > 0'></el-divider>
                <card-study-view class='preview' v-if='card && flipped && card.extraContent.length > 0' :content="card.extraContent" height='400px'></card-study-view>
            </el-main>


            <!--Toolbar-->
            <el-footer class='footer' style='position: fixed; bottom: 0px; width: 100%; padding: 0px; height: auto;'>
                
                <!--Flip Button-->
                <div v-if='!flipped' style='display: flex; align-items: center; width: 100%; background: #EEE; padding-bottom: 0px; padding-top: 15px;'>
                    <div class='flex-spacer'></div>
                    <brand-button type='primary' size='large' style='width: 50%;' @click='flipCard'>Flip</brand-button>
                    <div class='flex-spacer'></div>
                </div>
                
                <!--Review Actions-->
                <div v-if='flipped' style='display: flex; align-items: center; width: 100%; background: #EEE; padding-bottom: 5px; padding-top: 15px;'>
                    <div class='flex-spacer'></div>

                    <!--Again Button-->
                    <div class='action-item'>
                        <brand-button type='error' @click='() => studyCardLoadable.load("again")'>Again</brand-button>
                        <p class='action-item-time'>{{ times.again }}</p>
                    </div>
                    
                    <!--Hard Button-->
                    <div class='action-item'>
                        <brand-button type='warning' @click='() => studyCardLoadable.load("hard")'>Hard</brand-button>
                        <p class='action-item-time'>{{ times.hard }}</p>
                    </div>
                        
                    <!--Good Button-->
                    <div class='action-item'>
                        <brand-button type='success' @click='() => studyCardLoadable.load("good")'>Good</brand-button>
                        <p class='action-item-time'>{{ times.good }}</p>
                    </div>
                    
                    <div class='flex-spacer'></div>
                </div>
                
                <!--Key Binding Indicators-->
                <div style='width: 100%; text-align: center; font-size: 13px; margin-bottom: 10px; margin-top: 10px; color: #888;'>
                    <span v-if='!flipped'><KeyBindingIndicator>Spacebar</KeyBindingIndicator> to flip the card</span>
                    <span v-if='flipped'><KeyBindingIndicator>1</KeyBindingIndicator> = Again,  <KeyBindingIndicator>2</KeyBindingIndicator> = Hard,  <KeyBindingIndicator>3</KeyBindingIndicator> = Good</span>
                </div>
            </el-footer>
        </template>
    </LoadableProvider>
</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

//UI Components
import ReturnLink from '../components/basic/ReturnLink.vue'
import SectionLayout from '../components/basic/SectionLayout.vue'
import CardStudyView from '../components/basic/cards/CardStudyView.vue'
import KeyBindingIndicator from '../components/basic/KeyBindingIndicator.vue'
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import LoadableStateProvider from '../components/basic/providers/LoadableStateProvider.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import BrandButton from '../components/basic/BrandButton.vue'

//Composables
import useCards from '../composables/api/useCards'
import useDeck from '../composables/api/useDeck'
import { useRoute, useRouter } from 'vue-router'
import { setThemeColor } from '../utils'
import useLoadable from '../composables/ui/useLoadable'
import { useKeyUpBinding } from '../composables/keybindings'
import useNotificationService from '../composables/ui/useNotificationService'


const route = useRoute()
const router = useRouter()

const notificationService = useNotificationService()

const {
    fetchNextCard,
    studyCard
} = useCards(route.params.deckId)
const {
    fetchData,
    loadTags
} = useDeck(route.params.deckId)



//KeyListeners
useKeyUpBinding(' ', () => {
    if (!flipped.value) flipCard()
    else studyCardLoadable.load('good')
})
useKeyUpBinding('1', () => {
    if (flipped.value) studyCardLoadable.load('again')
})
useKeyUpBinding('2', () => {
    if (flipped.value) studyCardLoadable.load('hard')
})
useKeyUpBinding('3', () => {
    if (flipped.value) studyCardLoadable.load('good')
})


//Data
const selectedTags = ref(route.query.tags ? ( Array.isArray(route.query.tags) ? route.query.tags : route.query.tags.split(',')) : [])
const flipped = ref(false)
const times = ref({
    again: '',
    hard: '',
    good: ''
})
const counters = ref({
    reviewsLeft: 0,
    newLeft: 0
})
const done = ref(false)



//Loadables
const deckLoadable = useLoadable(async () => {
    const deck = await fetchData(selectedTags.value)
    setThemeColor(deck.primaryColor, document.documentElement)
    return deck
})

const tagOptionsLoadable = useLoadable(async () => {
    const tags = await loadTags()
    return tags
}, { onError: () => notificationService.error('Failed to load tag options') })

const currentCardLoadable = useLoadable(async () => {
    flipped.value = false

    const result = await fetchNextCard(selectedTags.value)

    //If we didn't get a card, we're done!
    if (!result.card) {
        done.value = true
        return
    }

    //Update times
    times.value = {
        again: result.againTime,
        hard: result.hardTime,
        good: result.goodTime
    }

    //Update counters
    counters.value = {
        reviewsLeft: result.reviewsLeft,
        newLeft: result.newLeft
    }

    return {
        ...result.card,
        backContent: result.card.backContent.replaceAll('>$$', '> $$')
                        .replaceAll('$$<', '$$ <')
                        .replaceAll('>$', '> $')
                        .replaceAll('$<', '$ <')
    }
})


const studyCardLoadable = useLoadable(async (_, category) => {
    const currentCard = currentCardLoadable.value
    if (!currentCard) return
    await studyCard(currentCard, category)

    currentCardLoadable.load()
}, { onError: () => notificationService.error('A problem occurred while updating the card') })




//Methods
function flipCard() { flipped.value = true }
function returnToDeck() { router.push({ name: 'View Deck', params: { deckId: route.params.deckId } }) }
function onTagsChanged(value) {
    selectedTags.value = value
    currentCardLoadable.load()
}
function goToDeck() { router.push({ name: 'View Deck', params: { deckId: route.params.deckId } }) }
function editCard() {
    const currentCard = currentCardLoadable.value
    if (currentCard) {
        router.push({
            name: 'Edit Card',
            params: {
                deckId: route.params.deckId,
                noteId: currentCard.noteId
            }
        })
    }
}

//Lifecycle
onMounted(async () => {
    await deckLoadable.load()
    tagOptionsLoadable.load()
    currentCardLoadable.load()
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
    padding-top: 10px; 
    background: #EEE;
}

.return-link:hover {
    text-decoration: underline;
    cursor: pointer;
}
</style>