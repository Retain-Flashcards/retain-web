<template>
<div>
    <div class='return-link' @click='returnToDeck' style='margin-top: 40px; margin-left: 30px;'>
        <el-icon style='padding-right: 10px;'><ArrowLeft /></el-icon>Return to deck
    </div>
    <div class='page-container'>
        <div style='flex: 0.25;'></div>
        <el-col span='6' style='flex: 0.5;' v-loading='loading'>
            <div style='display: flex; flex-direction: row; align-items: center;'>
                <h1>Viewing Quiz</h1>
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
                    <el-button type='primary' :plain="!question.hidden" @click='() => question.hidden = !question.hidden'>{{ question.hidden ? 'View':'Hide' }} Answer</el-button>
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

const printQuiz = () => {
    let htmlContent = `<!DOCTYPE html><html><body>`
    for (let i = 0; i < questions.value.length; i++) {
        htmlContent += '<b>' + questions.value[i].question + '</b><br>'
        htmlContent += questions.value[i].answer + '<br><br>'
    }
    htmlContent += '</body></html>'

    const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

    WinPrint.document.write(htmlContent);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
}

onMounted(() => {
    loadQuiz()
})

</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: row;
}

.qa {
    white-space: pre-line;
    background: #EEE;
    border-radius: 20px;
    padding: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
    line-height: 25px;
}

.question-display,.answer-display {
    margin-bottom: 20px;
}

.return-link:hover {
    cursor: pointer;
    text-decoration: underline;
}
</style>