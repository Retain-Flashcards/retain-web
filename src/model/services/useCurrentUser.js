import { randomizeFilename } from '../../utils'
import Deck from '../objects/Deck'
import useSupabase from '../../composables/UseSupabase'

const { supabase, makeSupabaseFetch } = useSupabase()

const uid = supabase.auth.user().id

export default () => {

    const getAllDecks = async () => {
        const { data, error } = await supabase.from('decks_with_new_review_counts_new').select(`*`)
        if (error) throw new Error(error)
        return data.map(deck => new Deck(deck))
    }

    const getDeckById = async (id) => {
        const { data, error } = await supabase.from('decks_with_new_review_counts_new').select(`*`).eq('deck_id', id)
        if (error || data.length == 0) throw new Error(error)
        return new Deck(data[0])
    }

    const createDeck = async (title, file, primaryColor, deckId) => {
        let publicURL = undefined

        if (file) {
            //First, upload the file and get the link
            const fileName = randomizeFilename(file.name)
            const uploadResult = await supabase.storage.from('card-images').upload(`${uid}/deck_images/${fileName}`, file)
            if (uploadResult.error) throw new Error('Could not upload file')

            const { data, er } = supabase.storage.from('card-images').getPublicUrl(`${uid}/deck_images/${fileName}`)
            if (er) throw new Error('Could not get file URL')

            publicURL = data.publicURL
        }

        //Next, INSERT a new deck row or UPDATE existing one
        if (deckId) {
            let updateObject = {
                title: title
            }

            if (primaryColor != '') updateObject['primary_color'] = primaryColor
            if (publicURL) updateObject['cover_image'] = publicURL
            
            const deckUpdateResult = await supabase.from('decks').update(updateObject).eq('deck_id', deckId)

            if (deckUpdateResult.error) {
                throw new Error(`Could not create deck: ${deckUpdateResult.error}`)
            }

            return deckUpdateResult.data
        }

        let updateObject = {
            title: title,
            uid: uid,
            cover_image: publicURL
        }

        if (primaryColor != '') updateObject['primary_color'] = primaryColor

        const { deckInsertResult, error } = await supabase.from('decks').insert([
           updateObject
        ])

        if (error) throw new Error('Could not create deck')

        return deckInsertResult
    }

}