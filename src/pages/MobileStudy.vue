<template>
    <div>
        <card-study-view class='preview' :content="flipped ? card.backContent:card.frontContent" v-if='card' height='400px'></card-study-view>
        <div v-if='card && flipped && card.extraContent.length > 0' style='height: 2px; width: 100%; background: #EEE; margin-top: 20px; margin-bottom: 20px;'></div>
        <card-study-view class='preview' :content="card.extraContent" v-if='card && flipped && card.extraContent.length > 0' height='400px'></card-study-view>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CardStudyView from '../components/basic/cards/CardStudyView.vue'

const card = ref({})
const flipped = ref(true)

onMounted(() => {
    window.flipCard = () => flipped.value = true
    window.setCard = (data) => {
        card.value = data
    }

    StudyChannel.postMessage('ready')
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
</style>