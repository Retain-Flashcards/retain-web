<template>
<div class='formatting-toolbar'>
    <formatting-button v-for='tool in tools' :hint-text='tool.hintText' :sub-items='tool.subItems' :icon='tool.icon' @action='tool.action'></formatting-button>
</div>
</template>

<style>
.formatting-toolbar {
    display: flex;
    background: white;
    padding: 5px;
}
</style>

<script setup>
import { onMounted, reactive } from 'vue'
import FormattingButton from './FormattingButton.vue'
import { useKeyDownBinding, useKeyUpBinding } from '../../../composables/keybindings'
import useLockedSelection from '../../../composables/ui/useLockedSelection'

const props = defineProps(['linkHandler', 'imageHandler'])

const lockedSelection = useLockedSelection()

function generateSpecialCharItems(chars) {
    return chars.map((char) => {
        return {
            icon: char,
            action: () => document.execCommand('insertHTML', false, char)
        }
    })
}

const tools = reactive([
   /* {
        icon: 'fa-heading',
        hintText: 'Heading',
        action: (e) => document.execCommand('formatBlock', false, '<H2>')
    },*/
    {
        icon: 'fa-bold',
        hintText: 'Bold',
        action: (e) => document.execCommand('bold', false, true)
    },
    {
        icon: 'fa-italic',
        hintText: 'Italics',
        action: () => document.execCommand('italic', false, true)
    },
    {
        icon: 'fa-underline',
        hintText: 'Underline',
        action: () => document.execCommand('underline', false, true)
    },
    {
        icon: 'fa-strikethrough',
        hintText: 'Strikethrough',
        action: () => document.execCommand('strikeThrough', false, true)
    },
    {
        icon: 'fa-superscript',
        hintText: 'Superscript',
        hotKey: 'CMD|.',
        action: () => {
            document.execCommand('superscript', false)
        }
    },
    {
        icon: 'fa-subscript',
        hintText: 'Subscript',
        hotKey: 'CMD|,',
        action: () => {
            document.execCommand('subscript', false)
        }
    },
    {
        icon: 'fa-list-ol',
        hintText: 'Ordered List',
        action: () => document.execCommand('insertOrderedList', false)
    },
    {
        icon: 'fa-list-ul',
        hintText: 'Unordered List',
        action: () => document.execCommand('insertUnorderedList', false)
    },
    {
        icon: 'fa-link',
        hintText: 'Link',
        action: () => {
            lockedSelection.lockWindowSelection()
            props.linkHandler().then((link) => {
                if (link) {
                    lockedSelection.unlockWindowSelection()
                    document.execCommand('createLink', false, link)
                }
            })
        }
    },
    {
        icon: 'fa-image',
        hintText: 'Upload Image',
        action: () => {
            props.imageHandler().then(imageUrl => {
                if (imageUrl) document.execCommand('insertImage', false, imageUrl)
            })
        }
    },
    {
        icon: 'fa-plus-minus',
        hintText: 'Math Symbols',
        subItems: generateSpecialCharItems([
            '&plusmn;',
            '&deg;',
            '&times;',
            '&sdot;',
            '&divide;',
            '&sum;',
            '&radic;',
            '&infin;',
            '&cap;',
            '&cup;',
            '&int;',
            '&there4;',
            '&ne;',
            '&le;',
            '&ge;',
            '&Delta;',
            '&Psi;',
            '&Omega;',
            '&alpha;',
            '&beta;',
            '&gamma;',
            '&delta;',
            '&epsilon;',
            '&eta;',
            '&theta;',
            '&kappa;',
            '&lambda;',
            '&mu;',
            '&pi;',
            '&rho;',
            '&sigma;',
            '&tau;',
            '&phi;',
            '&omega;'
        ])
    },
])

onMounted(() => {
    for (let tool of tools) {
        if (tool.hotKey) {
            useKeyUpBinding(tool.hotKey, () => {}, true)
            useKeyDownBinding(tool.hotKey, (e) => {
                tool.action()
            }, true)
        }
    }
})



</script>