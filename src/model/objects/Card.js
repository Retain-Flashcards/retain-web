import useSupabase from '../../composables/UseSupabase'

const { supabase } = useSupabase()

export default class Card {
    constructor(data) {
        this.id = data.id
        this.lastReviewed = data.last_reviewed
        this.learning = data.learning
        this.learningStep = data.learning_step
        this.noteId = data.note_id
        this.frontContent = data.front_content
        this.backContent = data.back_content
        this.extraContent = data.extra_content
        this.easeFactor = data.ease_factor
        this.currentInterval = data.current_interval
        this.buriedUntil = data.buried_until
    }
}