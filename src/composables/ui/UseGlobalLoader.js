import { ref, readonly } from 'vue'

const globalLoading = ref(false)

export default function useGlobalLoader() {

    const startGlobalLoading = () => globalLoading.value = true
    const stopGlobalLoading = () => globalLoading.value = false

    return {
        startGlobalLoading,
        stopGlobalLoading,
        globalLoading: globalLoading
    }
}