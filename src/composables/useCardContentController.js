import { ref, computed } from 'vue'
import { generateKey } from '../utils'

const ALLOWED_TAGS = ['p', 'br', 'ol', 'ul', 'li','h1','h2','h3','h4','h5','h6','i','em','b','strong','span','div','table','tfoot','thead','tbody','th','tr','td','hr','blockquote','details','summary','a','img','sub','sup','code','q']

const parseClozeContent = (clozeFormatContent) => {
    const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g

    const matches = clozeFormatContent.matchAll(clozeRegexp)

    const parsed = []

    let currentIndex = 0
    for (const match of matches) {
        const n = match[1]
        const text = match[2]
        const hint = match[3]

        parsed.push(
            {
                type: 'text',
                content: clozeFormatContent.slice(currentIndex, match.index)
            },
            {
                type: 'cloze',
                key: generateKey(),
                content: {
                    n,
                    text,
                    hint
                }
            }
        )

        currentIndex = match.index + match[0].length
    }

    if (currentIndex < clozeFormatContent.length - 1) {
        parsed.push({
            type: 'text',
            content: clozeFormatContent.slice(currentIndex, clozeFormatContent.length)
        })
    }

    return parsed
}

const parseHtmlContent = (element) => {
    const nodes = element.childNodes
    const parsed = []
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.nodeType == Node.TEXT_NODE && node.textContent.length > 0) {
            parsed.push({
                type: 'text',
                content: node.textContent
            })
        }
        else if (node.classList && node.classList.contains('cloze-indicator')) {
            const n = node.getElementsByClassName('cloze-indicator-num')[0].textContent
            const text = node.getElementsByClassName('cloze-indicator-text')[0].textContent
            const hint = node.getElementsByClassName('cloze-indicator-hint')[0].value
            const key = node.getAttribute('itemKey')

            parsed.push({
                type: 'cloze',
                key,
                content: {
                    n,
                    text,
                    hint
                }
            })
        }
        else {
            if (node.nodeType == Node.ELEMENT_NODE && node.getAttribute('data-cloze') == 'true') {
                parsed.push({
                    type: 'cloze',
                    key: generateKey(),
                    content: {
                        text: node.innerHTML,
                        hint: undefined,
                        n: -1
                    }
                })
            } else
            if (node.nodeType == Node.ELEMENT_NODE && ALLOWED_TAGS.includes(node.tagName.toLowerCase())) {
                parsed.push({
                    type: 'text',
                    content: node.outerHTML
                })
            }
        }
    }

    return parsed
}

const parsedToCloze = (parsedContent) => {
    let finalString = ''

    for (const item of parsedContent) {
        if (item.type == 'text') finalString += item.content
        if (item.type == 'cloze') finalString += `{{c${item.content.n}::${item.content.text}` + (item.content.hint ? `::${item.content.hint}}}`:'}}')
    }

    return finalString
}

const useCardContentController = (initialContent) => {
    //Initial content will come in the actual, raw card format with cloze format such as:
    //This is a {{c1::blank::hint}}.
    //The rawHtmlContent replaces these cloze deletions with html wrappers
    const parsedContent = ref([])
    const renderKey = computed(() => {
        const bytes = new TextEncoder().encode(JSON.stringify(parsedContent.value))
        return window.btoa( String.fromCharCode(...bytes) )
    })

    const nextClozeN = computed(() => {
        let currentN = 1
        for (const item of parsedContent.value) {
            if (item.type == 'cloze' && Number(item.content.n) >= currentN) currentN = Number(item.content.n) + 1
        }
        return currentN
    })

    if (initialContent) {
        parsedContent.value = parseClozeContent(initialContent)
    }

    const updateContent = (element) => {
        const elements = parseHtmlContent(element)
        parsedContent.value = elements
    }

    const renderContent = () => {
        return parsedToCloze(parsedContent.value)
    }

    const setContent = (content) => {
        parsedContent.value = parseClozeContent(content)
    }

    const addCloze = (n, selection, el) => {
        let html = ''

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            
            //const clonedContents = range.cloneContents()
            
            // Create a container to hold the DocumentFragment
            const tempContainer = document.createElement('div')
            tempContainer.setAttribute('data-cloze', 'true')
            //tempContainer.appendChild(clonedContents)
            range.surroundContents(tempContainer)
                        
            // Get the HTML content from the container
            html = tempContainer.innerHTML
        }

        const parsed = parseHtmlContent(el)
        
        for (const item of parsed) {
            if (item.type == 'cloze' && item.content.n == -1) {
                item.content.n = n
            }
        } 
        
        parsedContent.value = parsed
    }

    return {
        parsedContent,
        updateContent,
        renderContent,
        setContent,
        addCloze,
        renderKey,
        nextClozeN
    }
    
}

export default useCardContentController