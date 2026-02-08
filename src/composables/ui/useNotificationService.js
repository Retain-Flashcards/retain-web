import { onMounted, onUnmounted } from 'vue'
import { generate_uuid } from '../../utils'

const notificationServiceListeners = {}

export default function useNotificationService() {
    
    const addListener = (listener) => {
        const id = generate_uuid()
        notificationServiceListeners[id] = listener
    }

    const removeListener = (id) => {
        if (!notificationServiceListeners[id]) return
        delete notificationServiceListeners[id]
    }

    const registerListener = (listener) => {
        const id = generate_uuid()
        notificationServiceListeners[id] = listener
        onUnmounted(() => {
            removeListener(id)
        })
    }

    const notify = (notification) => {
        Object.values(notificationServiceListeners).forEach(listener => listener(notification))
    }

    const info = (message) => {
        notify({
            message,
            type: 'info'
        })
    }

    const success = (message) => {
        notify({
            message,
            type: 'success'
        })
    }

    const error = (message) => {
        notify({
            message,
            type: 'error'
        })
    }

    const warning = (message) => {
        notify({
            message,
            type: 'warning'
        })
    }

    return {
        addListener,
        removeListener,
        registerListener,
        notify,
        info,
        success,
        error,
        warning
    }
}