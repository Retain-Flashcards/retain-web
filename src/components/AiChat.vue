<template>
    <el-main :loading='props.loading' class='chat-box'>

        <div class='chat-container' ref='chatContainer' v-if='props.imageUrl'>
            <ImageMessage :imageUrl='props.imageUrl'/>
            <Message v-for='(message, i) in messages' :key='message.id' :side='message.type == "user" ? "right" : "left"' :label="message.type == 'user' ? 'You' : 'Suggested Cards'" :type='message.type == "cards" ? "cards" : "normal"'>
                <div v-if='message.type == "user"'>
                    {{ message.text }}
                </div>
                <CardMessage v-for='(card, j) in message.cards' :key='card.id' v-model='messages[i].cards[j]' :disabled='messages[i].disabled'/>
            </Message>
            <div class='loader' v-loading='aiIsLoading'>

            </div>
        </div>
        <div class='chat-container' v-else>
            <div style='text-align: center; margin-top: 20px; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;'>
                <div>
                    <el-icon :size='40' style='margin: 20px;'> 
                        <Crop/>
                    </el-icon>
                </div>
                <div>Select a portion of your notes to begin!</div>
            </div>
        </div>

        <div class='chat-input'>
            <brand-button type='primary' @click='acceptCards'>Accept Cards</brand-button>
            <el-input class='message-input' v-model='input' placeholder='Type a message...' @keyup.enter='() => sendMessage(input)' clearable>
                <template #append>
                    <el-button type='primary' @click='() => sendMessage(input)' :icon='Promotion'></el-button>
                </template>
            </el-input>
        </div>
</el-main>
</template>

<script setup>
import { ref, onMounted, onUpdated, watch } from 'vue'
import { Promotion, Crop } from '@element-plus/icons-vue'
import ImageMessage from './ImageMessage.vue'
import Message from './Message.vue'
import CardMessage from './CardMessage.vue'
import BrandButton from './basic/BrandButton.vue'
import useSupabase from '../composables/api/UseSupabase'
import useNotes from '../composables/api/useNotes'

const { makeSupabaseFetch } = useSupabase()


const props = defineProps(['loading', 'imageUrl', 'deckId'])

const { createNote } = useNotes(props.deckId)

const messages = ref([])
const aiIsLoading = ref(false)
const chatContainer = ref(null)
const input = ref('')

const scrollToBottom = () => {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}

const acceptCards = async () => {

    let cardPromises = []
    for (let message of messages.value) {
        message.disabled = true
        if (message.type == 'cards') {
            for (let card of message.cards) {
                if (card.selected) {
                    cardPromises.push(
                        createNote(card.frontContent, `![New Image](${props.imageUrl})`)
                    )
                }
            }
        }
    }

    await Promise.all(cardPromises)
}

const sendMessage = async (message) => {
    if (message) {
        messages.value.push({
            type: 'user',
            text: message
        })
    }

    scrollToBottom()

    // Send message to AI
    aiIsLoading.value = true
    const response = await makeSupabaseFetch('generate-cards', {
        imageUrl: props.imageUrl,
        messages: createOpenAIMessageList()
    })
    aiIsLoading.value = false

    if (response.cards) {
        messages.value.push({
            type: 'cards',
            cards: response.cards.map(card => {
                return {
                    frontContent: card,
                    selected: true
                }
            })
        })
    }
}

const createOpenAIMessageList = () => {
    let messageList = []
    messageList.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: props.imageUrl
            }
          },
          {
            type: "text",
            text: "This is the image"
          }
        ]
    })
    for (let message of messages.value) {
        if (message.type == 'user') {
            messageList.push({
                role: 'user',
                content: message.text
            })
        }
        if (message.type == 'cards') {
            let simpleCardsList = []
            for (let card of message.cards) {
                if (card.selected) {
                    simpleCardsList.push(card.frontContent)
                }
            }
            messageList.push({
                role: 'assistant',
                content: JSON.stringify(simpleCardsList)
            })
        }
    }

    return messageList
}

onMounted(() => {
    if (props.loading || !props.imageUrl) {
        return
    }

    sendMessage()
})

watch(() => props.imageUrl, () => {
    messages.value = []
})

onUpdated(() => {
    if (props.loading || !props.imageUrl) {
        return
    }

    sendMessage()
})


</script>

<style scoped>
.chat-box {
    width: 100%;
    height: 100%;
    padding: 0px;
    display: flex;
    flex-direction: column;
}
.chat-container {
    flex: 1;
    overflow-y: scroll;
}

.chat-input {
    width: 100%;
    padding: 10px;
    display: flex;
    border-top: 2px solid #f5f5f5;
}

.message-input {
    margin-right: 20px;
    margin-left: 10px;
}

.loader {
    height: 40px;
    margin-top: 20px;
}

</style>