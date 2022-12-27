import useSupabase from '../../composables/UseSupabase'

const { supabase } = useSupabase()

export default class Deck {
    constructor(data) {
        this.title = data.title
        this.id = data.deck_id
        this.reviewCount = data.review_count
        this.newCount = data.new_count
        this.coverImage = data.cover_image
        this.pinned = data.pinned
        this.primaryColor = data.primary_color
        this.accessLevel = data.access_level
        this.shared = data.shared
    }

    async getNextCard() {
         const { data, error } = await supabase.rpc('get_next_card', {
            given_deck_id: this.id
         })

         console.log(data)
    }
}