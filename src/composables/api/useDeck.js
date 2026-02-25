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
        const { data, error } = await supabase.from('daily_review_counters').select('*').eq('deck', deckId).eq('day', standardDateString(new Date())).eq('uid', getCurrentUserId())
        if (error) throw error

        let settings = {
            defaultNewLimit: dailyNewLimit,
            defaultReviewLimit: dailyReviewLimit,
            todayNewLimit: null,
            todayReviewLimit: null,
        }

        if (data.length == 0 || (data[0].new_limit == null && data[0].review_limit == null)) {
            return settings
        }

        settings.todayNewLimit = data[0].new_limit
        settings.todayReviewLimit = data[0].review_limit

        return settings
    }

    const setTodayStudySettings = async (newLimit, reviewLimit) => {
        const { data, error } = await supabase.from('daily_review_counters').upsert({
            deck: deckId,
            new_limit: newLimit,
            review_limit: reviewLimit,
            uid: getCurrentUserId(),
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

    const getDueReviewCounts = async () => {
        // Calculate the boundaries (3 days ago to 3 days from now)
        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        
        const startDate = new Date(today)
        startDate.setUTCDate(today.getUTCDate() - 4)
        
        const endDate = new Date(today)
        endDate.setUTCDate(today.getUTCDate() + 5)
        endDate.setUTCHours(23, 59, 59, 999)

        // Generate the 10 date buckets
        const buckets = []
        for (let i = -4; i <= 5; i++) {
            const date = new Date(today)
            date.setUTCDate(today.getUTCDate() + i)
            const bucketDateStr = date.toISOString().split('T')[0]
            buckets.push({
                date: bucketDateStr,
                label: i === 0 ? 'Today' : '',
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                monthDay: `${date.getMonth()+1}/${date.getDate()}`,
                count: 0,
                isFuture: i > 0
            })
        }

        // Fetch counts via RPC to offload aggregation to the database
        const { data, error } = await supabase.rpc('get_due_review_counts_timeline', {
            given_deck_id: deckId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        })

        if (error) throw new Error('Could not fetch due review counts: ' + error.message)

        // Assign counts to buckets
        data.forEach(row => {
            const bucketDate = new Date(row.due_date).toISOString().split('T')[0]
            const bucket = buckets.find(b => b.date === bucketDate)
            if (bucket) {
                bucket.count = parseInt(row.review_count, 10) || 0
            }
        })

        return buckets
    }

    const getDailyActivityCounts = async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 9)

        // Generate 10 date buckets (last 9 days + today) using local time
        const buckets = []
        for (let i = -9; i <= 0; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            buckets.push({
                date: standardDateString(date),
                label: i === 0 ? 'Today' : '',
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                monthDay: `${date.getMonth() + 1}/${date.getDate()}`,
                newSeen: 0,
                reviewSeen: 0
            })
        }

        const { data, error } = await supabase
            .from('daily_review_counters')
            .select('day, new_seen, review_seen')
            .eq('deck', deckId)
            .eq('uid', getCurrentUserId())
            .gte('day', buckets[0].date)
            .lte('day', buckets[buckets.length - 1].date)
            .order('day', { ascending: true })

        if (error) throw new Error('Could not fetch daily activity: ' + error.message)

        // Assign data to buckets
        data.forEach(row => {
            const bucket = buckets.find(b => b.date === row.day)
            if (bucket) {
                bucket.newSeen = row.new_seen || 0
                bucket.reviewSeen = row.review_seen || 0
            }
        })

        return buckets
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
        setDeckStudySettings,
        getDueReviewCounts,
        getDailyActivityCounts
    }

}