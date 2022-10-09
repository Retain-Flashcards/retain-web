import useSupabase from '../composables/UseSupabase'
import { ref, readonly } from 'vue'

const { supabase } = useSupabase()

export default () => {

    //Data
    const invasions = ref(null)

    const getInvasions = async () => {
        const response = await supabase.from('invasions')
            .select(`*,
                    status_options (
                        name
                    )`).eq('user_id', supabase.auth.user().id)
        return response.data
    }

    const createNewInvasion = async (name, description, status) => {
        return await supabase.from('invasions').insert([
            {
                name: name,
                description: description,
                status: status,
                user_id: supabase.auth.user().id
            }
        ])
    }

    const loadStatusOptions = async () => {
        const response = await supabase.from('status_options').select('id, name, color')
        return response.data
    }

    return {
        getInvasions,
        createNewInvasion,
        loadStatusOptions
    }

}