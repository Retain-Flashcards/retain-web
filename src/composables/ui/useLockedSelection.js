import { ref } from 'vue'

const useLockedSelection = () => {

    const selectedRange = ref(null)
    
    const lockWindowSelection = () => {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            selectedRange.value = selection.getRangeAt(0)
        }
    }
    
    const unlockWindowSelection = () => {
        const selection = window.getSelection()
        if (!selectedRange.value) return
        selection.removeAllRanges()
        selection.addRange(selectedRange.value)
    }
    
    return {
        lockWindowSelection,
        unlockWindowSelection
    }
}

export default useLockedSelection