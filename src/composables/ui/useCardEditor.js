import { ref, computed } from 'vue'
import { generateKey } from '../../utils'
import DOMPurify from 'dompurify'
import katex from 'katex'

const CLOZE_COLORS = [
    'clz-red',
    'clz-orange',
    'clz-yellow',
    'clz-green',
    'clz-blue',
    'clz-purple'
]

function clozeColorClass(n) { return n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red' }

export default function useCardEditor(initialContent = '', displayOnly = false) {

    const elId = ref(null)
    const nextClozeN = ref(1)
    const htmlContent = ref('')

    // --- Content rendering ---

    function renderContentToHtml(contentString, isDisplayOnly = false) {
        // Cloze format: {{cN::text::hint}}
        const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g

        let newString = contentString.replaceAll(clozeRegexp, (_, n, text, hint) => {
            const colorClass = n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red'
            const key = generateKey()
            return `<cloze-indicator n="${n}" color-class="${colorClass}" item-key="${key}" hint="${hint ?? ''}" text="${text}" ${isDisplayOnly ? 'display-only' : ''}></cloze-indicator>`
        })

        // KaTeX math rendering (display only)
        if (isDisplayOnly) {
            newString = newString.replaceAll(/\$\$(.+?)\$\$/g, (_, text) => {
                try {
                    let str = katex.renderToString(text, { throwOnError: false })
                    str = str.slice(0, 5) + ` data-source-str='${text}'` + str.slice(5)
                    return str
                } catch(e) {
                    return text
                }
            })
        }

        // Newlines
        newString = newString.replaceAll(/\n/g, '<br>')

        // Markdown images
        newString = newString.replaceAll(/!\[(.+?)\]\((.+?)\)/g, (_, alt, src) => {
            return `<img src='${src}' alt='${alt}'>`
        })

        return DOMPurify.sanitize(newString, {
            ADD_TAGS: ['cloze-indicator'],
            ADD_ATTR: ['n', 'color-class', 'item-key', 'hint', 'display-only', 'contenteditable', 'text']
        })
    }

    function updateNextClozeN(parentEl) {
        const clozes = parentEl.querySelectorAll('cloze-indicator')
        let max = 0
        for (const cloze of clozes) {
            const n = Number(cloze.getAttribute('n'))
            if (n > max) max = n
        }
        nextClozeN.value = Math.max(1, max + 1)
    }

    // --- Public API ---

    function setContent(contentString) {
        const html = renderContentToHtml(contentString, displayOnly)
        htmlContent.value = html

        if (elId.value) {
            const el = document.getElementById(elId.value)
            if (el) {
                el.innerHTML = html
                updateNextClozeN(el)
            }
        }
    }

    function getHtml(contentString) {
        if (contentString !== undefined) {
            return renderContentToHtml(contentString, true)
        }
        return htmlContent.value
    }

    function getClozeContent() {
        if (!elId.value) return ''

        const el = document.getElementById(elId.value)
        if (!el) return ''

        // Collect data from the live elements (Shadow DOM is only accessible on originals)
        const clozeData = new Map()
        el.querySelectorAll('cloze-indicator').forEach(cloze => {
            const key = cloze.getAttribute('item-key')
            clozeData.set(key, {
                n: cloze.getAttribute('n'),
                text: cloze.text,
                hint: cloze.hint || ''
            })
        })

        // Now clone and replace using the pre-collected data
        const clone = el.cloneNode(true)
        clone.querySelectorAll('cloze-indicator').forEach(cloze => {
            const key = cloze.getAttribute('item-key')
            const data = clozeData.get(key)
            if (!data) return
            const replacement = data.hint
                ? `{{c${data.n}::${data.text}::${data.hint}}}`
                : `{{c${data.n}::${data.text}}}`
            cloze.replaceWith(document.createTextNode(replacement))
        })

        return clone.innerHTML.replaceAll(/<!--.*?-->/gs, '')
    }

    function addCloze(n) {
        const selection = window.getSelection()

        // Ensure selection is inside the editor
        const anchorParent = selection.anchorNode.parentElement.closest('.card-editor')
        const focusParent = selection.focusNode.parentElement.closest('.card-editor')
        if (!anchorParent || !focusParent) return
        if (anchorParent != focusParent) return
        if (!anchorParent.classList.contains('cloze-enabled')) return

        if (selection.rangeCount == 0) return

        const range = selection.getRangeAt(0)
        if (range.collapsed) return

        const rangeContents = range.extractContents()
        if (rangeContents.textContent.trim() == '') return

        // Create the Custom Element
        const clozeEl = document.createElement('cloze-indicator')
        clozeEl.setAttribute('n', n)
        clozeEl.setAttribute('color-class', n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red')
        clozeEl.setAttribute('item-key', generateKey())
        clozeEl.setAttribute('hint', '')

        // Set selected text as attribute
        clozeEl.setAttribute('text', rangeContents.textContent.trim())
        range.insertNode(clozeEl)

        const parent = anchorParent.closest('.card-editor')
        updateNextClozeN(parent)
    }

    function removeCloze(key) {
        if (!elId.value) return

        const el = document.getElementById(elId.value)
        if (!el) return

        const clozeEl = el.querySelector(`cloze-indicator[item-key="${key}"]`)
        if (!clozeEl) return

        const text = clozeEl.text
        const parent = clozeEl.parentNode
        const newNode = document.createTextNode(text)
        parent.replaceChild(newNode, clozeEl)
        updateNextClozeN(el)
    }

    function setElId(id) {
        elId.value = id
    }

    // --- Initialize ---
    setContent(initialContent)

    return {
        htmlContent,
        setContent,
        getHtml,
        getClozeContent,
        addCloze,
        removeCloze,
        nextClozeN,
        clozeColorClass,
        setElId
    }
}