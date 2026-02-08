import { h } from "vue"

export default function (props, ctx) {
    if (!props.html) return h('')
    
    return h({ template: props.html })
}