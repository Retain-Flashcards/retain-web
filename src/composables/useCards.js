import { ref } from 'vue'
import useSupabase from './UseSupabase'
import Card from '../model/objects/Card'

const { supabase, makeSupabaseFetch } = useSupabase()

export default function useCards(deckId) {

    const fetchNextCard = async (filterTags) => {
        const result = await makeSupabaseFetch('get-next-card-v3', {
            deckId,
            filterTags: filterTags,
            userJwt: supabase.auth.session().access_token,
            localTimestamp: new Date().toLocaleDateString('en-US')
        })

        if (!result.card) return result

        result.card = new Card(result.card)

        return result
    }

    const studyCard = async (cardId, category) => {
        const todayDate = new Date()
        if (todayDate.getHours() < 3) todayDate.setDate(todayDate.getDate() - 1)

        return await makeSupabaseFetch('study-card', {
            cardId,
            category,
            localTimestamp: new Date().toLocaleDateString('en-US')
        })
    }

    const createCards = async (cards) => {
        const { data, error } = await supabase.from('cards').insert(cards)

        if (error) throw new Error('Could not create cards')

        return data
    }

    return {
        fetchNextCard,
        studyCard,
        createCards
    }
}