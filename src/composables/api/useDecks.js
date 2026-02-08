import useSupabase from './UseSupabase'
import useStorage from './useStorage'
import Deck from '../../model/objects/Deck'

const { supabase, makeSupabaseFetch, getCurrentUserId } = useSupabase()
const { uploadAndGetPublicUrl } = useStorage()

export default function useDecks() {

    const fetchAllDecks = async () => {
        const { data, error } = await supabase.from('decks_with_new_review_counts').select('*').order('created_at', { ascending: false })
        if (error) throw new Error(error)
        return data.map(deck => new Deck(deck))
    }

    const setDeck = async (title, file, primaryColor, deckId) => {
        let publicURL = undefined
        
        if (file) {
            //First, upload the file and get the link
            const extension = file.name.split('.').pop().toLowerCase()
            if (!(['jpeg', 'jpg', 'png'].includes(extension))) throw new Error('File must be PNG or JPG')
            const fileName = generate_uuid() + '.' + extension
            const filePath = `${getCurrentUserId()}/deck_images/${fileName}`

            publicURL = await uploadAndGetPublicUrl('card-images', filePath, file)
        }

        //Next, INSERT a new deck row or UPDATE existing one
        if (deckId) {
            let updateObject = {
                title: title
            }

            if (primaryColor != '') updateObject['primary_color'] = primaryColor
            if (publicURL) updateObject['cover_image'] = publicURL
            
            const result = await supabase.from('decks').update(updateObject).eq('deck_id', deckId)

            if (result.error) {
                throw new Error(`Could not create deck: ${result.error}`)
            }

            return result.data
        }

        let updateObject = {
            title: title,
            uid: getCurrentUserId(),
            cover_image: publicURL
        }

        if (primaryColor != '') updateObject['primary_color'] = primaryColor

        const { result, error } = await supabase.from('decks').insert([
            updateObject
        ])

        if (error) throw new Error('Could not create deck')

        return result
    }

    const createDeck = async (title, file, primaryColor) => setDeck(title, file, primaryColor)
    const updateDeck = async (deckId, title, file, primaryColor) => setDeck(title, file, primaryColor, deckId)

    const fetchDeck = async (deckId, tagFilter = []) => {
        const { data, error } = await supabase.rpc('get_deck_with_tag_filter', {
            given_deck_id: deckId,
            filter_tags: tagFilter
        })

        if (error) throw new Error('Could not fetch deck')

        return new Deck(data[0])
    }

    const setPinned = async (deckId, pinnedStatus) => {
        const { data, error } = await supabase.rpc('set_pinned_status', {
            pinned_status: pinnedStatus,
            given_deck_id: deckId
        })
        if (error) throw new Error('Could not set pin status')
        return data
    }

    const shareDeck = async (deckId, email, role) => {
        
        const result = await makeSupabaseFetch('share-deck', {
            email,
            role,
            deckId
        })

        return result

    }

    const deleteDeck = async (deckId) => {
        const { data, error } = await supabase.from('decks').delete().eq('deck_id', deckId)
        if (error) throw new Error('Could not delete deck')
        return data
    }

    return {
        fetchAllDecks,
        setDeck,
        createDeck,
        updateDeck,
        fetchDeck,
        setPinned,
        shareDeck,
        deleteDeck
    }

}