import { ref } from 'vue'

const zIndex = ref(20000)

export default function useZIndex() {
    const nextZIndex = () => {
        zIndex.value++
        return zIndex.value
    }

    return {
        nextZIndex
    }
}
