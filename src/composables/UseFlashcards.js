import Deck from '../model/objects/Deck'
import useSupabase from './UseSupabase'
import { generate_uuid } from '../utils'
import Note from '../model/objects/Note'
import Card from '../model/objects/Card'

const { supabase, makeSupabaseFetch } = useSupabase()

export default () => {

    const getDecks = async () => {

        const { data, error } = await supabase.from('decks_with_new_review_counts').select(`*`)

        if (error) throw new Error(error)
        console.log(data)
        return data.map(deck => new Deck(deck))
    }

    const createDeck = async (title, file, primaryColor, deckId) => {
        let publicURL = undefined

        if (file) {
            //First, upload the file and get the link
            const extension = file.name.split('.').pop().toLowerCase()
            if (!(['jpeg', 'jpg', 'png'].includes(extension))) throw new Error('File must be PNG or JPG')
            const fileName = generate_uuid() + '.' + extension
            const test = await supabase.storage.from('card-images').upload(`${supabase.auth.user().id}/deck_images/${fileName}`, file)
            if (test.error) throw new Error('Could not upload file')

            const { data, er } = supabase.storage.from('card-images').getPublicUrl(`${supabase.auth.user().id}/deck_images/${fileName}`)
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
            
            const result = await supabase.from('decks').update(updateObject).eq('deck_id', deckId)

            if (result.error) {
                console.log(result)
                throw new Error(`Could not create deck: ${result.error}`)
            }

            return result.data
        }

        let updateObject = {
            title: title,
            uid: supabase.auth.user().id,
            cover_image: publicURL
        }

        if (primaryColor != '') updateObject['primary_color'] = primaryColor

        const { result, error } = await supabase.from('decks').insert([
           updateObject
        ])

        if (error) throw new Error('Could not create deck')

        return result
    }

    const getDeck = async (deckId) => {
        const { data, error } = await supabase.from('decks_with_new_review_counts').select('*').eq('deck_id', deckId)

        if (error || data.length == 0) throw new Error('Could not fetch deck')

        return new Deck(data[0])
    }

    const getDeckNotes = async (deck, page) => {
        const PAGE_SIZE = 20
        const { data, error, count } = await supabase.from('notes').select('*', { count: 'exact' }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1).eq('deck_id', deck.id).eq('active', true)
        console.log(data)
        if (error) throw new Error('Could not get notes')

        return {
            notes: data.map(item => new Note(item)), 
            count
        }
    }

    const deleteNote = async (noteId) => {
        const { data, error } = await supabase.rpc('delete_note', {
            given_note_id: noteId
        })

        if (error) throw new Error('Could not delete note')

        return
    }

    const uploadImage = async (file) => {

        console.log(file)

        let publicURL = undefined

        if (file) {
            //First, upload the file and get the link
            const extension = file.name.split('.').pop().toLowerCase()
            if (!(['jpeg', 'jpg', 'png'].includes(extension))) throw new Error('File must be PNG or JPG')
            const fileName = generate_uuid() + '.' + extension
            const filePath = `${supabase.auth.user().id}/card_images/${fileName}`
            const uploadInitial = await supabase.storage.from('card-images').upload(filePath, file)

            if (uploadInitial.error) throw new Error('Could not upload file')

            const { data, error } = supabase.storage.from('card-images').getPublicUrl(filePath)
            
            if (error) throw new Error('Could not get file URL')

            publicURL = data.publicURL
        }

        return publicURL

    }

    const createNote = async (deckId, frontContent, backContent, noteId) => {
        //Create the note
        let noteContent = {
            front_content: frontContent,
            back_content: backContent,
            deck_id: deckId
        }
        if (noteId) noteContent['id'] = noteId

        const { data, error } = await supabase.from('notes').insert([
            noteContent
        ])

        if (error) throw new Error('Could not create note')

        //Get the note
        const note = data[0]

        //Generate the necessary cards
        let cards = []

        const clozeRegexp = /{{c(\d)::(.+?)(?:(?:::)([^:]+)?)?}}/g
        const occurences = [...frontContent.matchAll(clozeRegexp)]
        const clozeNums = occurences.map(match => Number(match[1]))
        
        //How many cloze deletions do we have?
        let maxNum = 0
        if (clozeNums.length > 0) {
            maxNum = Math.max(...clozeNums)
            console.log(maxNum)
            for (let i = 1; i <= maxNum; i++) {
                const regex = new RegExp(`{{c${i}::(.+?)(?:(?:::)([^:]+)?)?}}`, 'g')
                const antiRegex = new RegExp(`{{c[^${i}]::(.+?)(?:(?:::)([^:]+)?)?}}`, 'g')
                let cardFrontContent = frontContent.replaceAll(regex, (full, content, hint) => {
                    return `<span style='color: var(--el-color-primary);font-weight: bold;'>[${hint ? hint : '...'}]</span>`
                })
                cardFrontContent = cardFrontContent.replaceAll(antiRegex, (full, content, hint) => {
                    return content
                })

                let cardBackContent = frontContent.replaceAll(regex, (full, content, hint) => {
                    return `<span style='color: var(--el-color-primary);font-weight: bold;'>${content}</span>`
                })
                cardBackContent = cardBackContent.replaceAll(antiRegex, (full, content, hint) => {
                    return content
                })

                cards.push({
                    front_content: cardFrontContent,
                    back_content: cardBackContent,
                    extra_content: backContent,
                    note_id: note.id,
                    current_interval: 0
                })
            }
        } else {

            cards.push({
                front_content: frontContent,
                back_content: backContent,
                note_id: note.id,
                current_interval: 0
            })

        }

        console.log(cards)
        const newData = await supabase.from('cards').insert(cards)
        if (newData.error) throw new Error('Something went wrong while creating cards')
        
        return newData.data

    }

    const loadNote = async (noteId) => {
        const { data, error } = await supabase.from('notes').select('*').eq('id', noteId)

        if (error || data.length == 0) throw new Error('Could not load note')

        return new Note(data[0])
    }

    const getNextCard = async (deckId) => {
        
        const result = await makeSupabaseFetch('get-next-card-new', {
            deckId,
            userJwt: supabase.auth.session().access_token
        })

        console.log(result)

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
            localTimestamp: new Date().toLocaleDateString()
        })
        
    }

    const deleteDeck = async (deckId) => {
        const { data, error } = await supabase.from('decks').delete().eq('deck_id', deckId)
        if (error) throw new Error('Could not delete deck')
        return data
    }

    const setPinned = async (deckId, pinned) => {
        const { data, error } = await supabase.from('decks').update({
            pinned: pinned
        }).eq('deck_id', deckId)
        if (error) throw new Error('Could not set pin status')
        console.log('testing')
        return data
    }

    return {
        getDecks,
        createDeck,
        getDeck,
        getDeckNotes,
        deleteNote,
        uploadImage,
        createNote,
        loadNote,
        getNextCard,
        studyCard,
        deleteDeck,
        setPinned
    }

}