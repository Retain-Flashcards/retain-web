<script setup>
import { Plus, Upload } from '@element-plus/icons-vue'
import DeckCard from '../components/basic/DeckCard.vue'
import { setThemeColor } from '../utils'
import { ElMessage } from 'element-plus'
</script>

<template>
    <div style='margin: 30px;'>
        <div id='homepage-header'>
            <h1>Your Decks</h1>
            <div class='flex-spacer'/>
            <el-button :icon='Plus' type='primary' style='margin-right: 20px;' @click='state.isEditingDeck = !state.isEditingDeck'>Create New Deck</el-button>
        </div>

        <el-main v-loading='loadingDecks'>
            <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                <DeckCard :shared='deck.shared' :primaryColor='deck.primaryColor' :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' :pinned='deck.pinned' @click='() => onDeckSelected(deck)' :on-edit='() => editDeck(deck)' :on-share='() => shareDeckClicked(deck)' :title='deck.title' v-for='deck in pinnedDecks' :img-url='deck.coverImage' :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' :review-count='deck.reviewCount' :new-count='deck.newCount'/>
                <el-divider v-if='pinnedDecks.length > 0'></el-divider>
                <DeckCard :shared='deck.shared' :primaryColor='deck.primaryColor' :setPinned='(pinned) => setDeckPinned(deck.id, pinned)' :pinned='deck.pinned' @click='() => onDeckSelected(deck)' :on-edit='() => editDeck(deck)' :on-share='() => shareDeckClicked(deck)' :title='deck.title' v-for='deck in otherDecks' :img-url='deck.coverImage' :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' :review-count='deck.reviewCount' :new-count='deck.newCount'/>
            </div>
            <div v-if='decks.length == 0' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'>
                <el-result icon="info" title="No Decks" subTitle="Create your first one now!">
                </el-result>
                <el-button :icon='Plus' type='primary' @click='state.isEditingDeck = !state.isEditingDeck' round>Create New Deck</el-button>
            </div>
        </el-main>  

        <el-dialog
            :title="state.deck ? 'Edit Deck': 'Create New Deck'"
            v-model="state.isEditingDeck"
            class='dialog'
            @close='resetDialog'>
            
            <EditDeckForm v-if='state.isEditingDeck' :on-complete='onNewDeckFormCompletion' :editing-deck='state.deck'/>

        </el-dialog>

        <el-dialog
            :title="share.deck && `Sharing ${share.deck.title}`"
            v-model="share.open"
            class='dialog'
            @close='resetShareDialog'>
            <el-form v-loading='share.loading'>
                <el-form-item label='Email'>
                    <el-input v-model='share.email' placeholder='Enter email to share to...'></el-input>
                </el-form-item>
                <el-form-item label='Role'>
                    <el-radio-group v-model='share.role'>
                        <el-radio-button label='Viewer'/>
                        <el-radio-button label='Editor'/>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-button type='primary' @click='shareDeckRequest'>Share</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
    
</template>

<script>
import EditDeckForm from '../components/basic/EditDeckForm.vue'

import useAuthUser from '../composables/UseAuthUser'
import useFlashcards from '../composables/UseFlashcards'


const { logout, userIsLoggedIn } = useAuthUser()
const { getDecks, createDeck, setPinned, shareDeck } = useFlashcards()

export default {
    mounted() {
        this.loadDecks()
        setThemeColor('#ffad33', document.documentElement)
    },
    data() {
        return {
            pinnedDecks: [],
            otherDecks: [],
            decks: [],
            state: {
                isEditingDeck: false,
                deck: null
            },
            newDeckForm: {
                title: '',
                coverImageFiles: []
            },
            loadingDecks: false,
            share: {
                open: false,
                deck: null,
                email: '',
                role: 'Viewer',
                loading: false
            }
        }
    },
    methods: {
        logout() { logout().then(() => this.$router.push('/login')) },
        resetDialog() {
            this.state.deck = null
        },
        resetShareDialog() {
            this.share.deck = null
        },
        shareDeckRequest() {
            this.share.loading = true
            shareDeck(this.share.email, this.share.role, this.share.deck.id).then((result) => {
                ElMessage({
                    message: 'Your Deck Has Been Shared!',
                    type: 'success'
                })
            }).catch((error) => {
                ElMessage({
                    message: 'Something Went Wrong',
                    type: 'error'
                })
            }).finally(() => {
                this.share.loading = false
            })
        },
        onNewDeckFormCompletion(result) {
            this.state.isEditingDeck = false
            this.loadDecks()
        },
        loadDecks() {
            this.loadingDecks = true
            getDecks().then(result => {
                this.decks = result

                let pinnedDecks = []
                let otherDecks = []

                for(let i = 0; i < result.length; i++) {
                    if (result[i].pinned) pinnedDecks.push(result[i])
                    else otherDecks.push(result[i])
                }

                this.pinnedDecks = pinnedDecks
                this.otherDecks = otherDecks

            }).catch(console.error).finally(() => this.loadingDecks = false)
        },
        onDeckSelected(deck) {
            this.$router.push({
                name: `View Deck`,
                params: {
                    deckId: deck.id,
                    deck: deck
                }
            })
        },
        editDeck(deck) {
            this.state.deck = deck
            this.state.isEditingDeck = true
        },
        shareDeckClicked(deck) {
            this.share.open = true
            this.share.deck = deck
        },
        setDeckPinned(deckId, pinned) {
            setPinned(deckId, pinned).then(result => {
                console.log('test')
                this.loadDecks()
            }).catch(console.error)
        }
    },
    components: {
    }
}

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