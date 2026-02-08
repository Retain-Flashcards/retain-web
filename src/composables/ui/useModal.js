import { ref } from 'vue'

export default function useModal(initialState) {
    const state = ref(initialState)
    const isOpen = ref(false)

    const close = () => isOpen.value = false
    const open = () => {
        isOpen.value = true
    }
    const openWithState = (newState) => {
        state.value = newState
        isOpen.value = true
    }

    const value = () => state.value

    return {
        get state() { return state.value },
        close,
        open,
        openWithState,
        get isOpen() { return isOpen.value },
        set isOpen(value) { isOpen.value = value },
        value
    }
}