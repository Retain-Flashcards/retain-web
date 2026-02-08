import useSupabase from './UseSupabase'
import Deck from '../../model/objects/Deck'
import { standardDateString } from '../../utils'
const { supabase, makeSupabaseFetch, getCurrentUserId } = useSupabase()

export default function useDeck(deckId) {

    const fetchData = async (tagFilter = []) => {
        //First, fetch the deck
        const { data: deck, error: deckError } = await supabase.from('decks_with_new_review_counts').select('*').eq('deck_id', deckId).single()
        if (deckError) throw new Error('Could not fetch deck')

        // Fast path: if no tag filter, trust pre-computed counts from the view
        if (tagFilter.length === 0) {
            return new Deck(deck)
        }

        // Tag-filtered path: run count queries in parallel
        const [newRes, reviewRes] = await Promise.all([
            supabase.from('new_card_schedule').select('id', { count: 'exact', head: true, distinct: true }).eq('deck_id', deckId).overlaps('tags', tagFilter),
            supabase.from('review_card_schedule').select('id', { count: 'exact', head: true, distinct: true }).eq('deck_id', deckId).overlaps('tags', tagFilter)
        ])

        if (newRes.error) throw new Error('Could not fetch deck')
        if (reviewRes.error) throw new Error('Could not fetch deck')

        return new Deck({
            ...deck,
            new_left: Math.min(newRes.count, deck.new_left),
            review_left: Math.min(reviewRes.count, deck.review_left)
        })
    }

    const loadTags = async () => {
        const { data, error } = await supabase.from('tags').select('*').eq('deck', deckId)

        if (error) throw new Error('Could not load deck tags')

        return data
    }

    const createTag = async (tagName) => {
        const { data, error } = await supabase.from('tags').insert({
            name: tagName,
            deck: deckId
        })

        if (error) throw new Error('Could not create tag')

        return data
    }

    const generateAIQuiz = async (selectedNotes) => {
        
        const result = await makeSupabaseFetch('generate-quiz', {
            notes: selectedNotes,
            deckId
        })

        return result

    }

    const getQuiz = async (quizPath) => {
        const { data, error } = await supabase.storage.from('quizzes').download(quizPath)
        if (error) throw new Error('Could not retrieve quiz')

        const json = await data.text()

        return JSON.parse(json)
    }

    const getQuizzes = async () => {
        const { data, error } = await supabase.from('quizzes').select('path, topics_list').eq('uid', getCurrentUserId()).eq('deck_id', deckId)
        return data
    }

    const getQuizPath = (quizName) => {
        return `${getCurrentUserId()}/${deckId}/${quizName.replace('.json', '')}`
    }

    //TODO: Get rid of timeline RPC
    const getNoteGroups = async () => {
        const { data, error } = await supabase.rpc('get_timeline', {
            given_deck_id: deckId
        })
        return data
    }

    //TODO: Look into replacing RPC with select
    const createCramSession = async (noteIds) => {
        const { data, error } = await supabase.rpc('create_cram_session', {
            given_deck_id: deckId,
            note_ids: noteIds
        })

        return data
    }

    const getCramSession = async (cramId) => {
        const { data, error } = await supabase.from('cram_cards').select(`cards (id, front_content, back_content, extra_content)`).eq('cram_id', cramId)

        return data
    }

    const listCramSessions = async () => {
        const { data, error } = await supabase.rpc('get_cram_sessions', {
            given_deck_id: deckId
        })

        return data
    }

    const getStudySettings = async (dailyNewLimit, dailyReviewLimit) => {
        const { data, error } = await supabase.from('daily_review_counters').select('*').eq('deck', deckId).eq('day', new Date().toISOString().split('T')[0])
        if (error) throw error

        if (data.length == 0 || (data[0].new_limit == null && data[0].review_limit == null)) {
            return {
                newLimit: dailyNewLimit,
                reviewLimit: dailyReviewLimit, 
                today: false
            }
        }

        return {
            newLimit: data[0].new_limit || dailyNewLimit,
            reviewLimit: data[0].review_limit || dailyReviewLimit,
            today: true
        }
    }

    const setTodayStudySettings = async (newLimit, reviewLimit) => {
        const { data, error } = await supabase.from('daily_review_counters').upsert({
            deck: deckId,
            new_limit: newLimit,
            review_limit: reviewLimit,
            day: standardDateString(new Date())
        }).select()

        if (error) throw error

        return data
    }

    const setDeckStudySettings = async (newLimit, reviewLimit) => {
        const { data, error } = await supabase.from('decks').update({
            daily_new_limit: newLimit,
            daily_review_limit: reviewLimit
        }).eq('deck_id', deckId)

        if (error) throw error

        return data
    }

    return {
        fetchData,
        loadTags,
        createTag,
        generateAIQuiz,
        getQuiz,
        getQuizzes,
        getQuizPath,
        getNoteGroups,
        createCramSession,
        getCramSession,
        listCramSessions,
        getStudySettings,
        setTodayStudySettings,
        setDeckStudySettings
    }

}