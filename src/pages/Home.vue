<script setup>
import { Plus, Upload } from '@element-plus/icons-vue'
import DeckCard from '../components/basic/DeckCard.vue'
</script>

<template>
    <div style='margin: 30px;'>
        <div id='homepage-header'>
            <h1>Your Decks</h1>
            <div class='flex-spacer'/>
            <el-button :icon='Plus' type='primary' style='margin-right: 20px;' @click='state.isEditingDeck = !state.isEditingDeck'>Create New Deck</el-button>
        </div>

        <el-main v-loading='loadingDecks'>
            <DeckCard @click='() => onDeckSelected(deck)' :title='deck.title' v-for='deck in decks' :img-url='deck.coverImage' :style='{ float: "left", width: "250px", height: "225px", marginRight: "30px", marginBottom: "30px" }' :review-count='deck.reviewCount' :new-count='deck.newCount'/>
            <div v-if='decks.length == 0' style='width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'>
                <el-result icon="info" title="No Decks" subTitle="Create your first one now!">
                </el-result>
                <el-button :icon='Plus' type='primary' @click='state.isEditingDeck = !state.isEditingDeck' round>Create New Deck</el-button>
            </div>
        </el-main>  

        <el-dialog
            title="Create New Deck"
            v-model="state.isEditingDeck"
            class='dialog'>
            
            <EditDeckForm :on-complete='onNewDeckFormCompletion'/>

        </el-dialog>
    </div>
    
</template>

<script>
import EditDeckForm from '../components/basic/EditDeckForm.vue'

import useAuthUser from '../composables/UseAuthUser'
import useFlashcards from '../composables/UseFlashcards'


const { logout, userIsLoggedIn } = useAuthUser()
const { getDecks, createDeck } = useFlashcards()

export default {
    mounted() {
        this.loadDecks()
    },
    data() {
        return {
            decks: [],
            state: {
                isEditingDeck: false
            },
            newDeckForm: {
                title: '',
                coverImageFiles: []
            },
            loadingDecks: false
        }
    },
    methods: {
        logout() { logout().then(() => this.$router.push('/login')) },
        onNewDeckFormCompletion(result) {
            this.isEditingDeck = false
            this.loadDecks()
        },
        loadDecks() {
            this.loadingDecks = true
            getDecks().then(result => {
                this.decks = result
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