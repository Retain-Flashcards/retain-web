import { inject } from 'vue'
import useRevenueCat from './useRevenueCat'

export default function usePremiumFeature() {
    const openPaywall = inject('openPaywall')
    const { userIsProSubscriber } = useRevenueCat()

    const execute = async (fn, onDismissFn) => {
        const isPro = await userIsProSubscriber()
        if (isPro) {
            fn()
        } else {
            openPaywall(fn, onDismissFn)
        }
    }

    const executeWithoutPaywall = async (fn) => {
        const isPro = await userIsProSubscriber()
        if (isPro) {
            fn()
        }
    }

    return {
        execute,
        executeWithoutPaywall
    }
}