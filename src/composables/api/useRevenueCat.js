import { ref } from 'vue'
import { Purchases } from '@revenuecat/purchases-js'
import useAuthUser from './UseAuthUser'
import useSupabase from './UseSupabase'

const { setAuthStateChangedListener } = useAuthUser()
const { getCurrentUserId } = useSupabase()

let currentUser = getCurrentUserId()
const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY

Purchases.configure({
    apiKey: apiKey,
    appUserId: currentUser ? currentUser : Purchases.generateRevenueCatAnonymousAppUserId()
})

// ── Cached pro status (module-level, shared across all consumers) ──
const _isProSubscriber = ref(null) // null = not yet checked

// A single in-flight refresh promise to prevent concurrent checks
let _refreshPromise = null

async function _refreshProStatus() {
    // If already refreshing, return the existing promise
    if (_refreshPromise) return _refreshPromise

    _refreshPromise = (async () => {
        try {
            _isProSubscriber.value = await Purchases.getSharedInstance().isEntitledTo('retain-pro')
        } catch (e) {
            console.warn('RevenueCat: failed to check entitlement', e)
            _isProSubscriber.value = false
        } finally {
            _refreshPromise = null
        }
    })()

    return _refreshPromise
}

// Kick off the very first check immediately at module load
const _initialReady = _refreshProStatus()

// Refresh when auth state changes (fires immediately on setup with current session)
setAuthStateChangedListener(async (event, session) => {
    if (session?.user?.id) {
        await Purchases.getSharedInstance().changeUser(session.user.id)
    } else {
        await Purchases.getSharedInstance().changeUser(null)
    }
    _refreshProStatus()
})

export default function useRevenueCat() {

    const getProOffering = async () => {
        const offerings = await Purchases.getSharedInstance().getOfferings()
        return offerings.current
    }

    /** Returns cached value, or waits for initial check to complete */
    const userIsProSubscriber = async () => {
        if (_isProSubscriber.value !== null) return _isProSubscriber.value
        await _initialReady
        return _isProSubscriber.value
    }

    const presentPaywall = async (ref) => {
        return await Purchases.getSharedInstance().presentPaywall({
            htmlTarget: ref,
            offering: await getProOffering()
        })
    }

    return {
        getProOffering,
        userIsProSubscriber,
        presentPaywall,
        refreshProStatus: _refreshProStatus,
        isProSubscriber: _isProSubscriber,   // reactive ref for template use
        proStatusReady: _initialReady        // promise that resolves when first check is done
    }
}