<template>
    <div style='margin: 30px;'>
        <div id='homepage-header'>
            <h1>Your Decks</h1>
            <div class='flex-spacer'/>
            <el-button :icon='Plus' type='primary' style='margin-right: 20px;' @click='() => editDeckModal.openWithState(undefined)'>Create New Deck</el-button>
        </div>

        <LoadableProvider :loadable='homeScreenDecksLoadable'>
            <template #default='{ data, loading }'>
                <el-main v-loading='loading'>
                    <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                        <DeckCard :shared='deck.shared' :primaryColor='deck.primaryColor' :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' :pinned='deck.pinned' @click='() => onDeckSelected(deck)' :on-edit='() => editDeck(deck)' :on-share='() => shareDeckClicked(deck)' :title='deck.title' v-for='deck in data.pinnedDecks' :img-url='deck.coverImage' :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' :review-count='deck.reviewCount' :new-count='deck.newCount'/>
                        <el-divider v-if='data.pinnedDecks.length > 0'></el-divider>
                        <DeckCard :shared='deck.shared' :primaryColor='deck.primaryColor' :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' :pinned='deck.pinned' @click='() => onDeckSelected(deck)' :on-edit='() => editDeck(deck)' :on-share='() => shareDeckClicked(deck)' :title='deck.title' v-for='deck in data.otherDecks' :img-url='deck.coverImage' :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' :review-count='deck.reviewCount' :new-count='deck.newCount'/>
                    </div>
                    <div v-if='data.allDecks.length == 0' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'>
                        <el-result icon="info" title="No Decks" subTitle="Create your first one now!">
                        </el-result>
                        <el-button :icon='Plus' type='primary' @click='() => editDeckModal.open()' round>Create New Deck</el-button>
                    </div>
                </el-main>  
            </template>

            <template #error>
                ERROR
            </template>
        </LoadableProvider>

        <el-dialog
            :title="editDeckModal.state() ? 'Edit Deck': 'Create New Deck'"
            v-model="editDeckModal.isOpen.value"
            class='dialog'
            @close='() => editDeckModal.close()'>
            
            <EditDeckForm :on-complete='onNewDeckFormCompletion' :editing-deck='editDeckModal.state()'/>

        </el-dialog>

        <el-dialog
            :title="shareDeckModal.state().deck && `Sharing ${shareDeckModal.state().deck.title}`"
            v-model="shareDeckModal.isOpen.value"
            class='dialog'
            @close='resetShareDialog'>
            <LoadableStateProvider :loadable='shareDeckLoadable' v-slot='{ loading, data, error }'>
                <el-form v-loading='loading'>
                    <el-form-item label='Email'>
                        <el-input v-model='shareDeckModal.state().email' placeholder='Enter email to share to...'></el-input>
                    </el-form-item>
                    <el-form-item label='Role'>
                        <el-radio-group v-model='shareDeckModal.state().role'>
                            <el-radio-button label='Viewer'/>
                            <el-radio-button label='Editor'/>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button type='primary' @click='() => shareDeckLoadable.load()'>Share</el-button>
                    </el-form-item>
                </el-form>
            </LoadableStateProvider>
        </el-dialog>
    </div>
    
</template>

<script setup>
import { onMounted } from 'vue'
import LoadableProvider from '../components/basic/LoadableProvider.vue'
import LoadableStateProvider from '../components/basic/LoadableStateProvider.vue'
import { Plus } from '@element-plus/icons-vue'
import DeckCard from '../components/basic/DeckCard.vue'
import { setThemeColor } from '../utils'
import { ElMessage } from 'element-plus'
import EditDeckForm from '../components/basic/EditDeckForm.vue'

import useDecks from '../composables/useDecks'
import useLoadable from '../composables/useLoadable'
import useModal from '../composables/useModal'
import { useRouter } from 'vue-router'

const { fetchAllDecks, setPinned, shareDeck } = useDecks()
const router = useRouter()

const homeScreenDecksLoadable = useLoadable(
    async () => {
        const result = await fetchAllDecks()
        
        const data = {
            allDecks: result,
            pinnedDecks: [],
            otherDecks: []
        }

        for(let i = 0; i < result.length; i++) {
            if (result[i].pinned) data.pinnedDecks.push(result[i])
            else data.otherDecks.push(result[i])
        }
        return data
    },
    { pinnedDecks: [], otherDecks: [], allDecks: [] }
)

const shareDeckLoadable = useLoadable(async () => {
    const modalData = shareDeckModal.value()
    await shareDeck(modalData.deck.id, modalData.email, modalData.role)
    ElMessage({
        message: 'Your deck has been shared!',
        type: 'success'
    })
})

const pinDeckLoadable = useLoadable(async (prevValue, deckId, pinned) => {
    await setPinned(deckId, pinned)
    homeScreenDecksLoadable.load()
})

const editDeckModal = useModal(undefined)
const shareDeckModal = useModal({
    deck: null,
    email: '',
    role: 'Viewer'
})


function onDeckSelected(deck) {
    router.push({
        name: `View Deck`,
        params: {
            deckId: deck.id,
            deck: deck
        }
    })
}

function setDeckPinned(deckId, pinned) {
    pinDeckLoadable.load(deckId, pinned)
}

function editDeck(deck) {
    editDeckModal.openWithState(deck)
}

function onNewDeckFormCompletion(result) {
    editDeckModal.close()
    homeScreenDecksLoadable.load()
}

function shareDeckClicked(deck) {
    shareDeckModal.openWithState({
        deck,
        email: '',
        role: 'Viewer'
    })
}

onMounted(() => {
    homeScreenDecksLoadable.load()
    setThemeColor('#ffad33', document.documentElement)
});

</script>

<style scoped>

#homepage-header {
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
}

h1 {
    color: #303133;
}

.deck-review-count {
    color: var(--el-color-primary);
    text-align: center;
    font-size: 40px;
    background: white;
    border-radius: 15px;
    padding: 20px;
}

</style>