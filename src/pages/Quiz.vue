<template>
<div>
    <div class='return-link' @click='returnToDeck' style='margin-top: 40px; margin-left: 30px;'>
        <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
    </div>
    <div class='page-container'>
        <div style='flex: 0.25;'></div>
        <el-col span='6' style='flex: 0.5;' v-loading='loading'>
            <div style='display: flex; flex-direction: row; align-items: center;'>
                <h1>View Quiz</h1>
                <div style='flex: 1;'></div>
                <el-button type='outline' @click='printQuiz'>Print Quiz</el-button>
            </div>
            <div v-for='question in questions' class='qa'>
                <div v-if='!question.hidden' class='answer-display'>
                    {{ question.answer }}
                </div>
                <div v-else class='question-display'>
                    {{ question.question }}
                </div>
                <div>
                    <el-button type='primary' @click='() => question.hidden = !question.hidden'>{{ question.hidden ? 'View':'Hide' }} Answer</el-button>
                </div>
            </div>
        </el-col>
        <div style='flex: 0.25;'></div>
    </div>
</div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import useFlashcards from '../composables/UseFlashcards'

const { getQuiz } = useFlashcards()

const route = useRoute()
const router = useRouter()

const questions = ref([])
const loading = ref(true)

const returnToDeck = () => {
    router.push({
        name: 'View Deck',
        params: {
            decKId: route.params.deckId
        }
    })
}

const loadQuiz = () => {
    getQuiz(decodeURIComponent(route.params.quizPath) + '.json').then((result) => {
        questions.value = result.qa.map(qa => { return { ...qa, hidden: true } })
    }).finally(() => {
        loading.value = false
    })
}

onMounted(() => {
    loadQuiz()
})

</script>

<style>
.page-container {
    display: flex;
    flex-direction: row;
}
</style>