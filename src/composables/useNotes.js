import { ref } from 'vue'
import useSupabase from './UseSupabase'
import useCards from '../composables/useCards'
import Note from '../model/objects/Note'

const { supabase, makeSupabaseFetch } = useSupabase()

export default function useNotes(deckId) {
    const { createCards } = useCards(deckId)

    const fetchDeckNotes = async (page) => {
        const PAGE_SIZE = 20
        const { data, error, count } = await supabase.from('notes').select('*', { count: 'exact' }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1).eq('deck_id', deckId).eq('active', true)
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

    const setNote = async (noteId, frontContent, backContent) => {
        //Create the note
        let noteContent = {
            front_content: frontContent,
            back_content: backContent,
            deck_id: deckId
        }
        if (noteId) {
            noteContent['id'] = noteId
            await deleteNote(noteId)
        }



        //Create or set the note
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

        return await createCards(cards)

    }

    const createNote = async (frontContent, backContent) => {
        return await setNote(null, frontContent, backContent)
    }

    const editNote = async (noteId, frontContent, backContent) => {
        return await setNote(noteId, frontContent, backContent)
    }

    const resetNote = async (noteId) => {
        const { data, error } = await supabase.rpc('reset_note', { given_note_id: noteId})
        if (error) throw error
        else return data
    }

    const fetchNote = async (noteId) => {
        const { data, error } = await supabase.from('notes').select('*').eq('id', noteId)

        if (error || data.length == 0) throw new Error('Could not load note')

        return new Note(data[0])
    }

    const loadTags = async (noteId) => {
        const { data, error } = await supabase.from('note_tags').select(`tags (
            name,
            id
        )`).eq('note', noteId)

        if (error) throw new Error('Could not load note tags')

        return data.map(item => item.tags)
    }

    const addTag = async (noteId, tagId) => {
        const { data, error } = await supabase.from('note_tags').insert({
            note: noteId,
            tag: tagId
        })

        if (error) throw new Error('Could not add tag to note')

        return data
    } 

    const removeTag = async (noteId, tagId) => {
        const { data, error } = await supabase.from('note_tags').delete().eq('note', noteId).eq('tag', tagId)

        if (error) throw new Error('Could not delete tag from note')

        return data
    }

    return {
        fetchDeckNotes,
        fetchNote,
        deleteNote,
        createNote,
        editNote,
        resetNote,
        loadTags,
        addTag,
        removeTag
    }

}