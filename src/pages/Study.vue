<template>
<div class='content-container'>
    <LoadableStateProvider :loadable='deckLoadable' v-slot='{ loading, data: deck }'>
        <el-header v-loading='loading' v-if='deck' style='margin-bottom: 30px;'>
            <div class='return-link' @click='returnToDeck' style='margin-top: 20px;'>
                <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
            </div>
            <div style='display: flex; align-items: center; margin-top: 20px; margin-bottom: 20px;'>
                
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
                <div class='flex-spacer'></div>
                <el-button v-if='currentCardLoadable.value()' type='primary' plain style='margin-right: 30px;' @click='editCard'>Edit Card</el-button>
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
            </div>
        </el-header>
    </LoadableStateProvider>
    <LoadableStateProvider :loadable='currentCardLoadable' v-slot='{ loading: loadingCard, data: card }'>
        <el-main v-loading='loadingCard || studyCardLoadable.isLoading()' style='display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; margin: auto; margin-bottom: 200px;'>
            <div style='text-align: center;' v-if='done'>
                <el-result icon="success" title="You're Finished!" subTitle="No more cards to review today!"></el-result>
                <el-button type="primary" size="medium" @click='goToDeck'>Back to Deck</el-button>
            </div>
            <v-md-preview class='preview' :text="flipped ? card.backContent:card.frontContent" v-if='card' height='400px'></v-md-preview>
            <el-divider v-if='card && flipped && card.extraContent.length > 0'></el-divider>
            <v-md-preview class='preview' :text="card.extraContent" v-if='card && flipped && card.extraContent.length > 0' height='400px'></v-md-preview>
        </el-main>
        <el-footer class='footer' style='position: fixed; bottom: 0px; width: 100%; padding: 0px; height: auto;'>
            <div v-if='!flipped' style='display: flex; align-items: center; width: 100%; background: #EEE; padding-bottom: 0px; padding-top: 15px;'>
                <div class='flex-spacer'></div>
                <el-button type='primary' size='large' style='width: 50%;' @click='flipCard'>Flip</el-button>
                <div class='flex-spacer'></div>
            </div>
            
            <div v-if='flipped' style='display: flex; align-items: center; width: 100%; background: #EEE; padding-bottom: 5px; padding-top: 15px;'>
                <div class='flex-spacer'></div>

                <div class='action-item'>
                    <el-button type='danger' @click='() => studyCardLoadable.load("again")'>Again</el-button>
                    <p class='action-item-time'>{{ times.again }}</p>
                </div>
                <div class='action-item'>
                    <el-button type='warning' @click='() => studyCardLoadable.load("hard")'>Hard</el-button>
                    <p class='action-item-time'>{{ times.hard }}</p>
                </div>
                <div class='action-item'>
                    <el-button type='success' @click='() => studyCardLoadable.load("good")'>Good</el-button>
                    <p class='action-item-time'>{{ times.good }}</p>
                </div>
                
                <div class='flex-spacer'></div>
            </div>
            <div style='width: 100%; text-align: center; font-size: 13px; margin-bottom: 10px; margin-top: 10px; color: #888;'>
                <span v-if='!flipped'><KeyBindingIndicator>Spacebar</KeyBindingIndicator> to flip the card</span>
                <span v-if='flipped'><KeyBindingIndicator>1</KeyBindingIndicator> = Again,  <KeyBindingIndicator>2</KeyBindingIndicator> = Hard,  <KeyBindingIndicator>3</KeyBindingIndicator> = Good</span>
            </div>
        </el-footer>
    </LoadableStateProvider>
</div>
</template>

<script setup>
//Composables
import { onMounted, ref } from 'vue'
import useCards from '../composables/useCards'
import useDeck from '../composables/useDeck'
import { useRoute, useRouter } from 'vue-router'
import { setThemeColor } from '../utils'
import KeyBindingIndicator from '../components/basic/KeyBindingIndicator.vue'
import useLoadable from '../composables/useLoadable'
import { useKeyUpBinding } from '../composables/keybindings'
const route = useRoute()
const router = useRouter()

const {
    fetchNextCard,
    studyCard
} = useCards(route.params.deckId)
const {
    fetchData,
    loadTags
} = useDeck(route.params.deckId)

//Components
import LoadableProvider from '../components/basic/LoadableProvider.vue'
import LoadableStateProvider from '../components/basic/LoadableStateProvider.vue'

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
})
const currentCardLoadable = useLoadable(async () => {
    flipped.value = false

    const result = await fetchNextCard(selectedTags.value)
    if (!result.card) {
        done.value = true
        return
    }

    times.value = {
        again: result.againTime,
        hard: result.hardTime,
        good: result.goodTime
    }
    console.log(result)
    counters.value = {
        reviewsLeft: result.reviewsLeft,
        newLeft: result.newLeft
    }
    console.log(counters.value)

    return {
        ...result.card,
        backContent: result.card.backContent.replaceAll('>$$', '> $$')
                        .replaceAll('$$<', '$$ <')
                        .replaceAll('>$', '> $')
                        .replaceAll('$<', '$ <')
    }
})
const studyCardLoadable = useLoadable(async (_, category) => {
    const currentCard = currentCardLoadable.value()
    if (!currentCard) return
    await studyCard(currentCard.id, category)
    currentCardLoadable.load()
})

//Methods
function flipCard() { flipped.value = true }
function returnToDeck() { router.push({ name: 'View Deck', params: { deckId: route.params.deckId } }) }
function onTagsChanged(value) {
    selectedTags.value = value
    currentCardLoadable.load()
}
function goToDeck() { router.push({ name: 'View Deck', params: { deckId: route.params.deckId } }) }
function editCard() {
    const currentCard = currentCardLoadable.value()
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