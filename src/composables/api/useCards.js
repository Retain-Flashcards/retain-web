import { ref } from 'vue'
import useSupabase from './UseSupabase'
import useAuthUser from './UseAuthUser'
import Card from '../../model/objects/Card'

const { supabase, makeSupabaseFetch } = useSupabase()
const { getUser } = useAuthUser()


const learningSteps = [1, 10]

export default function useCards(deckId) {

    const fetchNextCard = async (filterTags) => {

        //Card placeholder
        let card = null
        let againTime = null
        let hardTime = null
        let goodTime = null

        //First get updated counts that include the deck limits
        const { data: deck, error: deckError } = await supabase.from('decks_with_new_review_counts').select('new_left, review_left').eq('deck_id', deckId).single()
        if (deckError) throw new Error('Could not fetch deck')

        //If the limits have been reached for the day, return null
        if (deck.new_left === 0 && deck.review_left === 0) return { card, reviewsLeft: deck.review_left, newLeft: deck.new_left, againTime, hardTime, goodTime }

        // Fast path: if no tag filter, use pre-computed counts from the view
        if (!filterTags || filterTags.length === 0) {
            // deck counts are already set from the view
        } else {
            // Tag-filtered path: run count queries in parallel
            const [newRes, reviewRes] = await Promise.all([
                supabase.from('new_card_schedule').select('id', { count: 'exact', head: true, distinct: true }).eq('deck_id', deckId).overlaps('tags', filterTags),
                supabase.from('review_card_schedule').select('id', { count: 'exact', head: true, distinct: true }).eq('deck_id', deckId).overlaps('tags', filterTags)
            ])

            //The numbers we show are the mins
            deck.review_left = Math.min(deck.review_left, reviewRes.count)
            deck.new_left = Math.min(deck.new_left, newRes.count)
        }

        //Now, time to select the card
        if (deck.review_left > 0) {
            //First, check if we have an eligible card in the learning phase; this trumps everything because it's time-sensitive
            let learningCardQuery = supabase.from('review_card_schedule').select('*').eq('deck_id', deckId).eq('learning', true)
            if (filterTags && filterTags.length > 0) learningCardQuery = learningCardQuery.overlaps('tags', filterTags)
            const { data: learningCard, error: learningCardError } = await learningCardQuery.order('last_review_timestamp', { ascending: true }).limit(1)
            if (learningCard && learningCard.length > 0) card = new Card(learningCard[0])

            if (!card) {
                //Now, attempt to pull a random review card
                let reviewCardQuery = supabase.from('randomized_reviews').select('*').eq('deck_id', deckId)
                if (filterTags && filterTags.length > 0) reviewCardQuery = reviewCardQuery.overlaps('tags', filterTags)
                const { data: reviewCard, error: reviewCardError } = await reviewCardQuery.limit(1)
                if (reviewCard && reviewCard.length > 0) card = new Card(reviewCard[0])
            }
        }

        //If no review card has been found, we check for a new card
        //Also, 60% of the time we prioritize new cards over reviews
        if (!card || Math.random() >= 0.4) {
            let newCardQuery = supabase.from('new_card_schedule').select('*').eq('deck_id', deckId)
            if (filterTags && filterTags.length > 0) newCardQuery = newCardQuery.overlaps('tags', filterTags)
            const { data: newCard, error: newCardError } = await newCardQuery.order('created_at', { ascending: true }).limit(1)
            if (newCard.length > 0) {
                card = new Card(newCard[0])
            }
        }

        // const result = await makeSupabaseFetch('get-next-card-v3', {
        //     deckId,
        //     filterTags: filterTags,
        //     userJwt: supabase.auth.session().access_token,
        //     localTimestamp: new Date().toLocaleDateString('en-US')
        // })

        //if (!card) return { card }

        // card = new Card(card)

        //  again: result.againTime,
        // hard: result.hardTime,
        // good: result.goodTime

        //Calculate next scheduled times for the card
        if (card) {
            if (card.learning != false) {
                againTime = `${learningSteps[0]} min`
                hardTime = `${Math.round( (learningSteps[card.learningStep + 0] + (card.learningStep < learningSteps.length - 1 ? learningSteps[card.learningStep + 1]:0))/2)} min`
                goodTime = (card.learningStep < learningSteps.length - 1) ? `${learningSteps[card.learningStep + 1]} min` : `1 day`
            }
            else {
                againTime = `${learningSteps[learningSteps.length - 1]} min`
                hardTime = `${Math.round((card.currentInterval * 1.2) / 1440)} days`
                goodTime = `${Math.round((card.currentInterval * (card.easeFactor ? card.easeFactor : 2.5)) / 1440)} days`
            }
        }

        return { card, reviewsLeft: deck.review_left, newLeft: deck.new_left, againTime, hardTime, goodTime }
    }

    // Constants for spaced repetition algorithm
    const DEFAULT_EASE_FACTOR = 2.5
    const MINIMUM_EASE_FACTOR = 1.3
    const EASE_PENALTY = 0.2
    const HARD_MULTIPLIER = 1.2
    const GRADUATION_INTERVAL = 1440 // 1 day in minutes

    /**
     * Calculate scheduling update for cards in the learning phase
     */
    const calculateLearningUpdate = (card, category) => {
        const stepAdjustments = {
            again: 0,
            hard: Math.max(0, card.learningStep - 1),
            good: card.learningStep + 1
        }

        const newStep = stepAdjustments[category]

        // Graduate from learning phase
        if (newStep >= learningSteps.length) {
            return {
                learning: false,
                learning_step: newStep,
                current_interval: GRADUATION_INTERVAL
            }
        }

        // Hard at step 0 uses average of first two steps
        if (category === 'hard' && newStep === 0) {
            return {
                learning_step: newStep,
                current_interval: Math.round((learningSteps[0] + learningSteps[1]) / 2)
            }
        }

        return {
            learning_step: newStep,
            current_interval: learningSteps[newStep]
        }
    }

    /**
     * Calculate scheduling update for cards in the review phase
     */
    const calculateReviewUpdate = (card, category) => {
        const easeFactor = card.easeFactor ?? card.ease_factor ?? DEFAULT_EASE_FACTOR
        const currentInterval = card.currentInterval ?? card.current_interval

        switch (category) {
            case 'again':
                return {
                    learning: true,
                    learning_step: learningSteps.length - 1,
                    current_interval: learningSteps[learningSteps.length - 1],
                    ease_factor: Math.max(easeFactor - EASE_PENALTY, MINIMUM_EASE_FACTOR)
                }
            case 'hard':
                return {
                    current_interval: Math.round(currentInterval * HARD_MULTIPLIER)
                }
            case 'good':
                return {
                    current_interval: currentInterval * easeFactor
                }
            default:
                return {}
        }
    }

    const studyCard = async (card, category) => {
        const now = new Date()

        // Build base update object
        const baseUpdate = {
            card_id: card.id,
            uid: getUser().id,
            ease_factor: DEFAULT_EASE_FACTOR,
            note_id: card.noteId
        }

        // Calculate scheduling based on learning vs review phase
        const isLearning = card.learning !== false
        const schedulingUpdate = isLearning
            ? calculateLearningUpdate(card, category)
            : calculateReviewUpdate(card, category)

        // Merge updates and add timestamps
        const cardUpdate = {
            ...baseUpdate,
            ...schedulingUpdate,
            last_reviewed: now,
            precise_last_reviewed: now,
            last_review_timestamp: now,
            current_interval: Math.round(schedulingUpdate.current_interval ?? 0)
        }

        //Now, send the card
        const { data: newCard, error } = await supabase.from('card_reviews').upsert(cardUpdate)

        if (error) throw new Error('Could not update card review')
        
        return {
            status: 'success',
            card: newCard
        }
    }   

    const createCards = async (cards) => {
        const { data, error } = await supabase.from('cards').insert(cards)

        if (error) throw new Error('Could not create cards')

        return data
    }

    const generateCards = async (imageDataUrl) => {
        const messages = [{
            role: "user",
            content: [
            {
                type: "image_url",
                image_url: {
                url: imageDataUrl
                }
            },
            {
                type: "text",
                text: "This is the image"
            }
            ]
        }]

        const result = await makeSupabaseFetch('generate-cards', {
            imageUrl: imageDataUrl,
            messages: messages,
            localTimestamp: new Date().toLocaleDateString('en-US')
        })

        if (result.cards && result.cards.length > 0) return result.cards


        return []
    }

    return {
        fetchNextCard,
        studyCard,
        createCards,
        generateCards
    }
}