import { ref, h, computed, Text } from 'vue'
import ClozeIndicator from '../../components/basic/cards/ClozeIndicator.vue'
import { generateKey } from '../../utils'
import DOMPurify from 'dompurify'
import { ElDialog } from 'element-plus'
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

    const contentTree = ref(undefined)
    const nextClozeN = ref(1)
    const elId = ref(null)
    const renderKey = computed(() => {
        const bytes = new TextEncoder().encode(JSON.stringify(contentTree.value))
        return window.btoa( String.fromCharCode(...bytes) )
    })

    function vNodesFromHtml(el, displayOnly = false) {
        let newEl = undefined

        if (el.nodeType == Node.ELEMENT_NODE && el.classList && el.classList.contains('cloze-indicator')) {
            const n = el.getElementsByClassName('cloze-indicator-num')[0].textContent
            const text = el.getElementsByClassName('cloze-indicator-text')[0].textContent
            const hint = el.getElementsByClassName('cloze-indicator-hint')[0]?.value ?? ''
            const key = el.getAttribute('data-itemkey')
            newEl = h(ClozeIndicator, {
                colorClass: n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red',
                n,
                hint,
                displayOnly,
                itemKey: key,
                onRemoveCloze: (key) => {
                    removeCloze(key)
                }
            }, {
                default: () => h({ template: text })
            })
        } 

        else if (el.nodeType == Node.TEXT_NODE) {
            let text = el.textContent
            if (text.endsWith('\u00A0')) text = text.slice(0, -1)
            if (text.length > 0) newEl = h(Text, text)
        }

        else if (el.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            if (el.childNodes) {
                newEl = []
                for (const child of el.childNodes) {
                    const item = vNodesFromHtml(child, displayOnly)
                    if (item) newEl.push(item)
                }
            }
        }
        
        else if (el.nodeType == Node.ELEMENT_NODE) {
            if (el.tagName.toUpperCase() == 'SPAN' && el.classList.contains('nbsp')) return newEl

            if (el.tagName == 'TEMPLATE') {
                return vNodesFromHtml(el.content, displayOnly)
            }

            const children = []

            if (el.childNodes) {
                for (const child of el.childNodes) {
                    let childEl = vNodesFromHtml(child, displayOnly)
                    if (childEl) children.push(childEl)
                }
            }

            const attrs = {}
            for (let attr of el.attributes) {
                attrs[attr.name] = attr.value
            }

            newEl = h(el.tagName, attrs, children)
        }

        return newEl
    }

    function vNodesFromCloze(contentString, displayOnly = false) {
        //Cloze format: {{cN::text::hint}}
        const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g
        
        let newString = contentString.replaceAll(clozeRegexp, (_, n, text, hint) => {
            const colorClass = n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red'
            const key = generateKey()
            return `<span class="cloze-indicator ${colorClass}" contenteditable="false" data-itemkey="${key}"><span class="cloze-indicator-control"><span class="cloze-indicator-num" contenteditable="false">${n}</span><span class="cloze-indicator-close" contenteditable="false">x</span></span><span class="cloze-indicator-text" contenteditable="plaintext-only" style="outline: none; font-weight: normal;">${text}</span><span class="cloze-indicator-hint-wrapper" contenteditable="false">[<input type="text" class="cloze-indicator-hint" placeholder="hint" value='${hint ?? ""}'>]</span></span>`
        })
        
        if (displayOnly) {
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

        //Newlines
        newString = newString.replaceAll(/\n/g, '<br>')

        //Images
        newString = newString.replaceAll(/\!\[(.+?)\]\((.+?)\)/g, (_, alt, src) => {
            return `<img src='${src}' alt='${alt}'>`
        })

        const wrapper = document.createElement('template')
        wrapper.innerHTML = DOMPurify.sanitize(newString)
        const vNodeTree = vNodesFromHtml(wrapper, displayOnly)
        if (!displayOnly) updateNextClozeN(wrapper.content)
        return vNodeTree

    }

    function findClozeWithKey(key, parentEl) {
        if (parentEl.classList && parentEl.classList.contains('cloze-indicator')) {
            if (parentEl.getAttribute('data-itemkey') == key) return parentEl
            return undefined
        }

        if (!parentEl.childNodes) return undefined

        for (const child of parentEl.childNodes) {
            const node = findClozeWithKey(key, child)
            if (node) return node
        }

        return undefined
    }

    function updateNextClozeN(parent) {
        const clozes = parent.querySelectorAll('.cloze-indicator-num')
        let max = 0
        for (const cloze of clozes) {
            const n = Number(cloze.textContent)
            if (n > max) {
                max = n
            }
        }
        nextClozeN.value = Math.max(1, max + 1)
    }

    function setContent(contentString) {
        contentTree.value = vNodesFromCloze(contentString, displayOnly)
    }

    function removeCloze(key) {
        const parentEl = document.querySelector(`span[data-itemkey='${key}']`).parentNode
        const clozeElement = findClozeWithKey(key, parentEl)
        if (!clozeElement) return

        const text = clozeElement.getElementsByClassName('cloze-indicator-text')[0].textContent

        const parent = clozeElement.parentNode
        const newNode = document.createTextNode(text)
        parent.replaceChild(newNode, clozeElement)
        const editorNode = parentEl.closest('.card-editor')
        const newTree = vNodesFromHtml(editorNode)
        contentTree.value = newTree.children
        updateNextClozeN(editorNode)
    }

    function addCloze(n) {
        //First, we grab the selection
        const selection = window.getSelection()

        //Ensure selection is inside the editor
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

        //Create a container to hold the DocumentFragment
        const clozeContainer = document.createElement('span')
        clozeContainer.className = `cloze-indicator ${n > 0 ? CLOZE_COLORS[n - 1] : 'clz-red'}`
        clozeContainer.setAttribute('data-itemkey', generateKey())
        clozeContainer.contentEditable = 'false'
        clozeContainer.innerHTML = `<span class="cloze-indicator-control"><span class="cloze-indicator-num" contenteditable="false">${n}</span><span class="cloze-indicator-close" contenteditable="false">x</span></span><span class="cloze-indicator-text" contenteditable="plaintext-only" style="outline: none; font-weight: normal;"></span><span class="cloze-indicator-hint-wrapper" contenteditable="false">[<input type="text" class="cloze-indicator-hint" placeholder="hint">]</span>`
        const textElement = clozeContainer.querySelector('.cloze-indicator-text')
        textElement.appendChild(rangeContents)
        range.insertNode(clozeContainer)
        
        const parent = anchorParent.closest('.card-editor')
        const newTree = vNodesFromHtml(parent)
        contentTree.value = newTree.children
        updateNextClozeN(parent)
    }

    function setElId(id) {

        elId.value = id

    }

    function getClozeContent() {
        if (!elId.value) return ''

        const parentEl = document.getElementById(elId.value)

        const html = parentEl.innerHTML
        const regex = /<span class="cloze\-indicator.*?".*?data-itemkey="(.*?)".*?><span class="cloze\-indicator\-control"><span class="cloze\-indicator\-num" contenteditable="false">([0-9])<\/span><span class="cloze\-indicator\-close" contenteditable="false">x<\/span><\/span><span class="cloze\-indicator\-text" contenteditable="plaintext\-only".*?>(.*?)<\/span><span class="cloze\-indicator\-hint\-wrapper" contenteditable="false">\[<input type="text" class="cloze\-indicator\-hint" placeholder="hint">\]<\/span><\/span>/g
        const newString = html.replaceAll(regex, (_, itemKey, n, text) => {
            const hint = document.querySelector(`[data-itemKey="${itemKey}"]`).querySelector('input').value
            if (!hint) return `{{c${n}::${text}}}`
            return `{{c${n}::${text}::${hint}}}`
        }).replaceAll(/<!--.*?-->/gs, '')

        return newString
        
    }

    setContent(initialContent)


    return {
        contentTree,
        setContent, 
        removeCloze,
        addCloze,
        nextClozeN,
        renderKey,
        clozeColorClass,
        setElId,
        getClozeContent
    }

}