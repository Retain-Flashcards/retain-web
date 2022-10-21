<template>

<div class='content-container'>
    <el-header v-loading='loadingDeck' v-if='deck'>
        <div class='return-link' @click='returnToDeck' style='margin-top: 20px;'>
            <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
        </div>
        <div style='display: flex; align-items: center; margin-top: 20px;'>
            
            <span style='font-size: 30px;'>Studying:</span>
            <span style='font-size: 30px; margin-left: 5px; color: var(--el-color-primary); font-weight: bold;'>{{ deck.title }}</span>
            <div class='flex-spacer'></div>
            <el-button v-if='card' type='primary' plain style='margin-right: 30px;' @click='editCard'>Edit Card</el-button>
            <div style='font-size: 30px; display: flex;'>
                <div v-if='newLeft || reviewsLeft' class='count' style='color: var(--el-color-primary); margin-right: 30px; text-align: center;'>
                    <p>{{ newLeft }}</p>
                    <p :style="{ textDecoration: !card.lastReviewed ? 'underline':'none', fontSize: '15px' }">New</p>
                </div>
                <div v-if='newLeft || reviewsLeft' class='count' style='color: var(--el-color-primary-light-4); margin-right: 30px; text-align: center;'>
                    <p >{{ reviewsLeft }}</p>
                    <p :style="{ textDecoration: card.lastReviewed ? 'underline':'none', fontSize: '15px' }">Review</p>
                </div>
            </div>
        </div>
    </el-header>
    <el-main v-loading='loadingCard' style='display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; margin: auto; margin-bottom: 100px;'>
        <div style='text-align: center;' v-if='done'>
            <el-result icon="success" title="You're Finished!" subTitle="No more cards to review today!"></el-result>
            <el-button type="primary" size="medium" @click='goToDeck'>Back to Deck</el-button>
        </div>
        <v-md-preview class='preview' :text="flipped ? card.backContent:card.frontContent" v-if='card' height='400px'></v-md-preview>
        <el-divider v-if='card && flipped && card.extraContent.length > 0'></el-divider>
        <v-md-preview class='preview' :text="card.extraContent" v-if='card && flipped && card.extraContent.length > 0' height='400px'></v-md-preview>
    </el-main>
    <el-footer class='footer' style='position: fixed; bottom: 0px; width: 100%; padding-bottom: 10px; padding-top: 15px;height: auto;'>
        <div v-if='flipped' style='display: flex; align-items: center; width: 100%;'>
            <div class='flex-spacer'></div>

            <div class='action-item'>
                <el-button type='danger' @click='() => this.studyCard("again")'>Again</el-button>
                <p class='action-item-time'>{{ againTime }}</p>
            </div>
            <div class='action-item'>
                <el-button type='warning' @click='() => this.studyCard("hard")'>Hard</el-button>
                <p class='action-item-time'>{{ hardTime }}</p>
            </div>
            <div class='action-item'>
                <el-button type='success' @click='() => this.studyCard("good")'>Good</el-button>
                <p class='action-item-time'>{{ goodTime }}</p>
            </div>
            
            <div class='flex-spacer'></div>
        </div>
    </el-footer>
</div>

</template>

<script>
import useFlashcards from '../composables/UseFlashcards'
import { setThemeColor } from '../utils'

const { getNextCard, getDeck, studyCard } = useFlashcards()

export default {
    mounted() {
        this.getDeck()
        this.getNextCard()
    },
    created() {
        window.addEventListener('keyup', this.keyListener)
    },
    destroyed() {
        window.removeEventListener('keyup', this.keyListener)
    },
    data() {
        return {
            deckId: this.$route.params.deckId,
            loadingCard: false,
            card: undefined,
            deck: undefined,
            deckLoading: false,
            flipped: false,
            againTime: '',
            hardTime: '',
            goodTime: '',
            reviewsLeft: 0,
            newLeft: 0,
            done: false
        }
    },
    methods: {
        keyListener(e) {
            
            if (e.key == ' ' && !this.flipped) {
                this.flipCard()
            }

            else if (this.flipped) {
                if (e.key == ' ') this.studyCard('good')
                else if (e.key == '1') this.studyCard('again')
                else if (e.key == '2') this.studyCard('hard')
                else if (e.key == '3') this.studyCard('good')
            }

        }, 
        flipCard() {
            this.flipped = true

        },
        returnToDeck() {
            this.$router.push({
                name: 'View Deck',
                params: {
                    deckId: this.deckId
                }
            })
        },
        getDeck() {
            this.deckLoading = true
            getDeck(this.deckId).then(deck => {
                this.deck = deck
                setThemeColor(this.deck.primaryColor, document.documentElement)
            }).catch(error => {

            }).finally(() => this.deckLoading = false)
        },
        getNextCard() {
            this.loadingCard = true
            this.flipped = false
            getNextCard(this.deckId).then(result => {
                if (!result.card) this.done = true
                
                this.card = result.card
                this.againTime = result.againTime
                this.hardTime = result.hardTime
                this.goodTime = result.goodTime
                this.reviewsLeft = result.reviewsLeft
                this.newLeft = result.newLeft
            }).catch(error => {
                console.log(error)
            }).finally(() => {
                this.loadingCard = false
            })
        },
        studyCard(category) {
            this.loadingCard = true
            studyCard(this.card.id, category).then(result => {
                this.getNextCard()
            })
        },
        goToDeck() {
            this.$router.push({
                name: 'View Deck',
                params: {
                    deckId: this.deckId
                }
            })
        },
        editCard() {
            if (this.card) {
                this.$router.push({
                    name: 'Edit Card',
                    params: {
                        deckId: this.deckId,
                        noteId: this.card.noteId
                    }
                })
            }
        }
    }
}

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
</style>