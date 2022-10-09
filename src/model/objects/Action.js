import { ref, readonly } from 'vue'
import useSupabase from '../../composables/UseSupabase'

const { supabase } = useSupabase()

export default class Action {
    constructor(id, name, description) {
        this.id = readonly( ref(id) )
        this.name = ref(name)
        this.description = ref(description)
    }

    static createFromJsonResponse(jsonObject) {
        return new Action(jsonObject['id'], jsonObject['name'], jsonObject['description'])
    }

    updateLocal(newAction) {
        this.name.value = newAction.name.value
        this.description.value = newAction.description.value
    }

    async update(name, description) {
        let updateObject = {}
        if (name) updateObject['name'] = name
        if (description) updateObject['description'] = description

        const { data, error } = await supabase.from('actions').update(updateObject).eq('id', this.id)

        if (error) throw new Error(error.message)

        return data
    }

}