import { h } from 'vue'
            
export default function(props, ctx) {
    const vNodeTree = props.content

    const spacer = h({ template: '&nbsp;' })

    //Our render will be based purely on the HTML of the element
    if (Symbol.iterator in Object(vNodeTree)) {
        if (vNodeTree.length == 0) return []
        return [...vNodeTree, spacer]
    }

    return [vNodeTree, spacer]
}