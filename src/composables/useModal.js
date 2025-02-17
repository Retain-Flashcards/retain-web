import { ref } from 'vue'

export default function useModal(initialState) {
    const state = ref(initialState)
    const isOpen = ref(false)

    const close = () => isOpen.value = false
    const open = () => {
        console.log('Opening modal')
        isOpen.value = true
    }
    const openWithState = (newState) => {
        state.value = newState
        isOpen.value = true
    }

    const value = () => state.value

    return {
        state: () => state.value,
        close,
        open,
        openWithState,
        isOpen,
        value
    }
}