import { ref, readonly } from 'vue'
import useSupabase from '../../composables/UseSupabase'

const { supabase } = useSupabase()

export default class Invasion {
    constructor(id, created_at, name, status, statusColor, status_id, description, user_id) {
        this.id = readonly( ref(id) )
        this.created_at = readonly( ref(created_at) )
        this.name = ref(name)
        this.status = ref(status)
        this.status_id = ref(status_id)
        this.statusColor = ref(statusColor)
        this.description = ref(description)
        this.user_id = ref(user_id)

        //Not necessary
        this.hosts = ref([])
        this.action_history = ref([])
        this.scans = ref([])
    }

    static createFromJsonResponse(jsonData) {
        console.log(jsonData['name'])
        return new Invasion(jsonData['id'], jsonData['created_at'], jsonData['name'], jsonData['status_options']['name'], jsonData['status_options']['color'], jsonData['status'], jsonData['description'], jsonData['user_id'])
    }

    updateLocal(newInvasion) {
        this.name.value = newInvasion.name.value
        this.status.value = newInvasion.status.value
        this.status_id.value = newInvasion.status_id.value
        this.statusColor.value = newInvasion.statusColor.value
        this.description.value = newInvasion.description.value
        this.user_id.value = newInvasion.user_id.value
    }

    updateLocalFromJson(newInvasionJson) {
        try {
            this.name = newInvasionJson.name
            this.status = newInvasionJson.status_options.name
            this.status_id = newInvasionJson.status
            this.statusColor = newInvasionJson.status_options.color
            this.description = newInvasionJson.description
            this.user_id = newInvasionJson.user_id
        } catch(error) {
            throw new Error('Invalid JSON format provided')
        }
    }

    async update(updateObject) {

        let verifiedUpdateObject = {}
        verifiedUpdateObject['name'] = updateObject['name'] || this.name
        verifiedUpdateObject['status'] = updateObject['status_id'] || this.status
        verifiedUpdateObject['description'] = updateObject['description'] || this.description
        
        const response = await supabase.from('invasions').update(verifiedUpdateObject).eq('id', this.id)
        
        if (response.error) throw new Error(response.error.message)

        const { data, error } = await supabase.from('invasions')
                                                .select(`*,
                                                        status_options (
                                                            name,
                                                            color
                                                        )`).eq('id', this.id)
        
       
        if (error) throw new Error(error)
        if (data.length > 0) this.updateLocalFromJson(data[0])

    }

    async delete() {
        const { data, error } = await supabase.from('invasions').delete().eq('id', this.id)

        if (error) throw new Error(error.message)

        return data
    }

}