<template>
    <slot></slot>

    <SoftDialog :modal='paywallModal' size='large' @close='dismissPaywall'>
        <paywall @dismiss='dismissPaywall' @success='paywallSuccess'/>
    </SoftDialog>
</template>

<script setup>
import { provide } from 'vue'

import SoftDialog from './basic/soft-ui/SoftDialog.vue'
import Paywall from './Paywall.vue'

import useModal from '../composables/ui/useModal'

const paywallModal = useModal({ executeAfter: () => {}, onDismiss: () => {} })

function openPaywall(withPostFn, withDismissFn) {
    paywallModal.openWithState({ executeAfter: withPostFn || (() => {}), onDismiss: () => {
        withDismissFn()
    } })
}

function paywallSuccess() {
    paywallModal.state.executeAfter()
}



function dismissPaywall() {
    paywallModal.state.onDismiss()
    paywallModal.close()
}

provide('openPaywall', openPaywall)

</script>