<template>
    <div style='margin: 30px;'>

        <!--Header-->
        <div id='homepage-header'>
            <h1>Your Decks</h1>
            <div class='flex-spacer'/>
            <brand-button icon='fa-add' type='primary' style='margin-right: 20px;' @click='() => editDeckModal.openWithState(undefined)'>Create New Deck</brand-button>
        </div>


        <!--Decks-->
        <LoadableProvider :loadable='homeScreenDecksLoadable'>

            <template #default='{ data, loading }'>
                <el-main>
                    <loading-overlay v-if='loading'/>
                    <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                        <!--Pinned Decks-->
                        <DeckCard 
                            :shared='deck.shared' 
                            :primaryColor='deck.primaryColor' 
                            :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' 
                            :pinned='deck.pinned' 
                            @click='() => onDeckSelected(deck)' 
                            :on-edit='() => editDeck(deck)' 
                            :on-share='() => shareDeckClicked(deck)' 
                            :title='deck.title' 
                            v-for='deck in data.pinnedDecks' 
                            :img-url='deck.coverImage' 
                            :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' 
                            :review-count='deck.reviewCount' 
                            :new-count='deck.newCount'/>
                        
                        <!--Divider, if there are pinned decks-->
                        <el-divider v-if='data.pinnedDecks.length > 0'></el-divider>
                        
                        <!--Other Decks-->
                        <DeckCard 
                            :shared='deck.shared' 
                            :primaryColor='deck.primaryColor' 
                            :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' 
                            :pinned='deck.pinned' 
                            @click='() => onDeckSelected(deck)' 
                            :on-edit='() => editDeck(deck)' 
                            :on-share='() => shareDeckClicked(deck)' 
                            :title='deck.title' 
                            v-for='deck in data.otherDecks' 
                            :img-url='deck.coverImage' 
                            :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' 
                            :review-count='deck.reviewCount' 
                            :new-count='deck.newCount'/>
                    </div>

                    <!--No Decks Placeholder-->
                    <div v-if='data.allDecks.length == 0' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'>
                        <el-result icon="info" title="No Decks" subTitle="Create your first one now!">
                        </el-result>
                        <brand-button icon='fa-add' type='primary' @click='() => editDeckModal.open()'>Create New Deck</brand-button>
                    </div>
                </el-main>  
            </template>

            <!--Error-->
            <template #error>
                <error-page message='A problem occurred while loading your decks.'></error-page>
            </template>
        </LoadableProvider>

        <!--Edit Deck Modal-->
        <SoftDialog
            :title="editDeckModal.state ? 'Edit Deck': 'Create New Deck'"
            :modal='editDeckModal'
            class='dialog'
            @close='() => editDeckModal.close()'>
            
            <!--Form-->
            <EditDeckForm :on-complete='onNewDeckFormCompletion' :editing-deck='editDeckModal.state'/>

        </SoftDialog>

        <!--Share Deck Modal-->
        <SoftDialog
            :title="shareDeckModal.state.deck && `Sharing ${shareDeckModal.state.deck.title}`"
            :modal='shareDeckModal'
            class='dialog'
            @close='() => shareDeckModal.close()'>

            <!--Loadable to handle sharing state-->
            <LoadableStateProvider :loadable='shareDeckLoadable' v-slot='{ loading, data, error }'>
                <SoftForm v-loading='loading' :model='shareDeckModal.state'>
                    <!--Email-->
                    <SoftFormItem label='Email'>
                        <el-input v-model='shareDeckModal.state.email' placeholder='Enter email to share to...'></el-input>
                    </SoftFormItem>
                    <!--Role-->
                    <SoftFormItem label='Role'>
                        <el-radio-group v-model='shareDeckModal.state.role'>
                            <el-radio-button label='Viewer'/>
                            <el-radio-button label='Editor'/>
                        </el-radio-group>
                    </SoftFormItem>
                    <!--Share Button-->
                    <SoftFormItem>
                        <brand-button type='primary' @click='() => shareDeckLoadable.load()'>Share</brand-button>
                    </SoftFormItem>
                </SoftForm>
            </LoadableStateProvider>
        </SoftDialog>
    </div>
    
</template>

<script setup>
import { onMounted } from 'vue'
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import LoadableStateProvider from '../components/basic/providers/LoadableStateProvider.vue'
import DeckCard from '../components/basic/DeckCard.vue'
import EditDeckForm from '../components/basic/EditDeckForm.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import AppSpinner from '../components/basic/AppSpinner.vue'
import LoadingOverlay from '../components/basic/LoadingOverlay.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import SoftDialog from '../components/basic/soft-ui/SoftDialog.vue'
import SoftForm from '../components/basic/soft-ui/SoftForm.vue'
import SoftFormItem from '../components/basic/soft-ui/SoftFormItem.vue'

import { setThemeColor } from '../utils'
import { ElMessage } from 'element-plus'


import useDecks from '../composables/api/useDecks'
import useLoadable from '../composables/ui/useLoadable'
import useModal from '../composables/ui/useModal'
import { useRouter } from 'vue-router'
import useNotificationService from '../composables/ui/useNotificationService'

const { fetchAllDecks, setPinned, shareDeck } = useDecks()
const router = useRouter()
const notificationService = useNotificationService()

//Loadables
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
    { initialValue: { pinnedDecks: [], otherDecks: [], allDecks: [] } }
)

const shareDeckLoadable = useLoadable(async () => {
    const modalData = shareDeckModal.value()

    await shareDeck(modalData.deck.id, modalData.email, modalData.role)

    notificationService.success('Your deck has been shared!')
}, {
    onError: (error) => notificationService.error(error)
})

const pinDeckLoadable = useLoadable(async (prevValue, deckId, pinned) => {
    await setPinned(deckId, pinned)
    homeScreenDecksLoadable.load()
}, {
    onError: (error) => notificationService.error(error)
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