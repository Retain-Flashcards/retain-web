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
        this.daily_new_limit = data.daily_new_limit
        this.daily_review_limit = data.daily_review_limit
    }

    async getNextCard() {
         const { data, error } = await supabase.rpc('get_next_card', {
            given_deck_id: this.id
         })
    }
}