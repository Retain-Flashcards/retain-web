const CLOZE_COLORS = {
    'clz-red': { bg: '#ffe1e1', fg: '#ff5f5f' },
    'clz-orange': { bg: '#ffefe1', fg: '#ffa555' },
    'clz-yellow': { bg: '#fff6c8', fg: '#ffbf00' },
    'clz-green': { bg: '#d8ffda', fg: '#1ec724' },
    'clz-blue': { bg: '#e1f6ff', fg: '#00b3ff' },
    'clz-purple': { bg: '#f0e1ff', fg: '#9123ff' },
}

import katexCss from 'katex/dist/katex.min.css?inline'

const STYLES = `
:host {
    display: inline;
    padding: 2px 4px;
    border-radius: 5px;
    white-space: nowrap;
    background-color: #EEE;
    color: #AAA;
    cursor: default;
}

.control {
    width: 12px;
    display: inline-grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    text-align: center;
    margin-right: 3px;
}

.num {
    grid-area: 1 / 1;
    z-index: 1;
    user-select: none;
    margin-right: 5px;
}

.close {
    display: inline-block;
    margin-right: 5px;
    opacity: 0;
    grid-area: 1 / 1;
    z-index: 2;
    user-select: none;
    cursor: pointer;
}

:host(:not([display-only])) .control:hover {
    cursor: pointer;
}

:host(:not([display-only])) .control:hover .num {
    opacity: 0;
}

:host(:not([display-only])) .control:hover .close {
    opacity: 1;
    z-index: 4;
}

.text {
    color: black !important;
    font-weight: normal !important;
    font-style: normal !important;
    text-decoration: none !important;
    font-size: inherit !important;
    vertical-align: baseline !important;
    outline: none;
}

.hint-wrapper {
    margin-left: 7px;
    border: none;
    background: none;
    min-width: none;
    font-size: 16px;
    user-select: none;
}

.hint {
    color: inherit;
    border: none;
    background: none;
    min-width: none;
    field-sizing: content;
    font-size: inherit;
    user-select: none;
}

:host(:not([display-only])) .hint:hover,
:host(:not([display-only])) .hint:focus {
    color: #555;
}

.hint:focus::placeholder {
    opacity: 0;
    width: 0px;
}

.hint:hover::placeholder,
.hint:focus::placeholder {
    color: inherit;
}

.hint::placeholder {
    color: inherit;
}

.hint:focus {
    outline: none;
}
`

class ClozeIndicatorElement extends HTMLElement {
    static observedAttributes = ['n', 'color-class', 'hint', 'item-key', 'display-only', 'text']

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this.contentEditable = 'false'
        this._render()
    }

    attributeChangedCallback(name) {
        // Don't re-render for attribute changes that would destroy editable text
        if (this.shadowRoot && name !== 'hint' && name !== 'text') {
            this._updateStyles()
        }
    }

    _updateStyles() {
        const colorClass = this.getAttribute('color-class') || 'clz-red'
        const colors = CLOZE_COLORS[colorClass] || CLOZE_COLORS['clz-red']
        const hostStyle = this.shadowRoot.querySelector('#host-style')
        if (hostStyle) {
            hostStyle.textContent = `:host { background-color: ${colors.bg}; color: ${colors.fg}; }`
        }
    }

    _render() {
        const n = this.getAttribute('n') || '1'
        const colorClass = this.getAttribute('color-class') || 'clz-red'
        const hint = this.getAttribute('hint') || ''
        const initialText = this.getAttribute('text') || ''
        const displayOnly = this.hasAttribute('display-only')
        const colors = CLOZE_COLORS[colorClass] || CLOZE_COLORS['clz-red']

        const hintHtml = (!displayOnly || hint) ? `<span class="hint-wrapper">[<input type="text" class="hint" placeholder="hint" value="${hint}" ${displayOnly ? 'readonly' : ''}>]</span>` : ''
        const closeHtml = !displayOnly ? '<span class="close">x</span>' : ''

        this.shadowRoot.innerHTML = `<style>${katexCss}</style><style>${STYLES}</style><style id="host-style">:host{background-color:${colors.bg};color:${colors.fg};}</style><span class="control"><span class="num">${n}</span>${closeHtml}</span><span class="text" ${!displayOnly ? 'contenteditable="plaintext-only"' : ''}>${initialText}</span>${hintHtml}`

        // Attach close button handler
        const closeBtn = this.shadowRoot.querySelector('.close')
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                this.dispatchEvent(new CustomEvent('remove-cloze', {
                    bubbles: true,
                    composed: true,
                    detail: { key: this.getAttribute('item-key') }
                }))
            })
        }
    }

    // --- Clean property getters ---

    get n() {
        return this.getAttribute('n') || '1'
    }

    get text() {
        // Read from the shadow DOM text span (where edits happen)
        const textSpan = this.shadowRoot?.querySelector('.text')
        return textSpan?.textContent?.trim() || this.getAttribute('text') || ''
    }

    get hint() {
        const input = this.shadowRoot?.querySelector('.hint')
        return input?.value || ''
    }

    get itemKey() {
        return this.getAttribute('item-key') || ''
    }
}

// Register the element
customElements.define('cloze-indicator', ClozeIndicatorElement)

export default ClozeIndicatorElement
