import {  Purchases } from '@revenuecat/purchases-js'
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

setAuthStateChangedListener((event, session) => {
    if (session.user.id) {
        Purchases.getSharedInstance().changeUser(session.user.id)
    } else {
        Purchases.getSharedInstance().changeUser(null)
    }
})

export default function useRevenueCat() {
    
    const getProOffering = async () => {
        const offerings = await Purchases.getSharedInstance().getOfferings()
        return offerings.current
    }

    const userIsProSubscriber = async () => {
        return await Purchases.getSharedInstance().isEntitledTo('retain-pro')
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
        presentPaywall
    }

}
    