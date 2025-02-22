import { createApp } from 'vue'
import { createRouter, createWebHistory} from 'vue-router'

//Composables
import useAuthUser from './composables/UseAuthUser'

import LoadableProvider from './components/LoadableProvider.vue'

//Pages
import App from './App.vue'
import Home from './pages/Home.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import PasswordUpdateSuccess from './pages/PasswordUpdateSuccess.vue'
import VerifyEmail from './pages/VerifyEmail.vue'
import Deck from './pages/Deck.vue'
import CardBuilder from './pages/CardBuilder.vue'
import GoogleLogin from './pages/GoogleLogin.vue'
import Study from './pages/Study.vue'
import QuizBuilder from './pages/QuizBuilder.vue'
import Quiz from './pages/Quiz.vue'
import CramBuilder from './pages/CramBuilder.vue'
import Cram from './pages/Cram.vue'
import AiCardBuilder from './pages/AiCardBuilder.vue'

//UI Frameworks
import Equal from 'equal-vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VMdEditor from '@kangc/v-md-editor'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import hljs from 'highlight.js'
import enUS from '@kangc/v-md-editor/lib/lang/en-US'

import vueShortkey from 'vue-shortkey'

VMdEditor.lang.use('en-US', enUS)
VMdPreview.use(githubTheme, {
    Hljs: hljs
})


//Dark mode
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark()
isDark.value = false

//CSS
import 'equal-vue/dist/style.css'
import './styles/element-plus-theme.scss'
import './styles/index.css'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';
import StudyWrapper from './pages/StudyWrapper.vue'

//Auth functions
const { userIsLoggedIn, setAuthStateChangedListener } = useAuthUser()

//Vue Router routes
const routes = [
    { name: 'Home', path: '/', component: Home, meta: { requiresAuth: true } },
    { name: 'Login', path: '/login', component: Login },
    { name: 'Google Login', path: '/google', component: GoogleLogin },
    { name: 'Register', path: '/register', component: Register },
    { name: 'Verify Email', path: '/verify', component: VerifyEmail },
    { name: 'Password Updated Successfully', path: '/passwordupdated', component: PasswordUpdateSuccess },
    { name: 'View Deck', path: '/deck/:deckId', component: Deck },
    { name: 'Create Cards', path: '/deck/:deckId/cards/add', component: CardBuilder },
    { name: 'Edit Card', path: '/deck/:deckId/cards/:noteId/edit', component: CardBuilder},
    { name: 'Study Deck', path: '/deck/:deckId/study', component: StudyWrapper },
    { name: 'QuizBuilder', path: '/deck/:deckId/quiz', component: QuizBuilder },
    { name: 'Quiz', path: '/deck/:deckId/quiz/:quizPath', component: Quiz},
    { name: 'Cram Builder', path: '/deck/:deckId/cram', component: CramBuilder },
    { name: 'Cram', path: '/deck/:deckId/cram/:cramId', component: Cram },
    { name: 'AI Card Builder', path: '/deck/:deckId/cards/add-ai', component: AiCardBuilder }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

//Authentication nav guard
router.beforeEach((to) => {
    
    if (!userIsLoggedIn() && to.meta.requiresAuth && to.path != '/verify') return { path: '/login' }
    else if (userIsLoggedIn() && (to.path == '/login') ) return { path: '/' }
})

//Keep authentication up-to-date
setAuthStateChangedListener((event, session) => {
    if (event == 'SIGNED_OUT') router.go('/login')
})

//App creation
const app = createApp(App)

VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

VMdEditor.use( createKatexPlugin() )
VMdPreview.use( createKatexPlugin() )

//Using
app.use(router)
app.use(Equal)
app.use(ElementPlus)
app.use(VMdEditor)
app.use(VMdPreview)
app.use(vueShortkey)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.component('loadable-provider', LoadableProvider)

//Mount
app.mount('#app')
