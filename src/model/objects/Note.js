import useSupabase from '../../composables/api/UseSupabase'

const { supabase } = useSupabase()

export default class Note {
    constructor(data) {
        this.frontContent = data.front_content
        this.id = data.id
        this.backContent = data.back_content
        this.deckId = data.deck_id
        this.active = data.active
        this.createdAt = data.created_at
    }

    async getNextCard() {
         const { data, error } = await supabase.rpc('get_next_card', {
            given_deck_id: this.id
         })

    }

    export() {
        return {
            frontContent: this.frontContent,
            backContent: this.backContent,
            id: this.id,
            deckId: this.deckId,
            active: this.active,
            createdAt: this.createdAt
        }
    }
}