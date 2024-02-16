import { createApp } from 'vue'

//UI Frameworks
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import hljs from 'highlight.js'

VMdPreview.use(githubTheme, {
    Hljs: hljs
})

//CSS
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/cdn';

//App creation
const app = createApp(MobileStudy)

VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

VMdEditor.use( createKatexPlugin() )
VMdPreview.use( createKatexPlugin() )

//Using
app.use(VMdPreview)

//Mount
app.mount('#app')
