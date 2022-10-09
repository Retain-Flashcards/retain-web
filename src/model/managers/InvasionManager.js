import useSupabase from '../../composables/UseSupabase'
import Invasion from '../objects/Invasion'
import NotFoundError from '../errors/NotFoundError'

const { supabase } = useSupabase()

class InvasionManager {
    constructor() {
        this.invasionsCache = {}
    }

    mergeIntoCache(invasion) {

        let invasionId = invasion.id.value
        
        if (this.invasionsCache.hasOwnProperty(invasionId)) this.invasionsCache[invasionId].updateLocal(invasion)
        else this.invasionsCache[invasionId] = invasion

    }

    async getAllInvasions() {
        let invasions = []

        const { data, error } = await supabase.from('invasions')
            .select(`*,
                    status_options (
                        name,
                        color
                    )`).eq('user_id', supabase.auth.user().id).order('created_at', { ascending: true })

        if (error) throw new Error(error.message)

        for (let i = 0; i < data.length; i++) {

            let invasion = Invasion.createFromJsonResponse(data[i])
            this.mergeIntoCache(invasion)
            invasions.push(invasion)
            
        }

        return invasions
    }

    async getInvasion(invasionId) {

        //Check the cache first
        if (this.invasionsCache.hasOwnProperty(invasionId)) return this.invasionsCache[invasionId]

        //If not present, get from database
        const { data, error } = await supabase.from('invasions')
                                                .select(`*,
                                                        status_options (
                                                            name,
                                                            color
                                                        )`).eq('id', invasionId)
        if (error) throw new Error(error.message)

        if (data.length > 0) {
            let invasion = Invasion.createFromJsonResponse(data[0])
            this.mergeIntoCache(invasion)
            return invasion
        }

        throw new NotFoundError('The requested invasion does not exist')
    }

    async createNewInvasion(name, status, description) {

        let { data, error } = await supabase.from('invasions').insert([
            {
                name: name,
                description: description,
                status: status,
                user_id: supabase.auth.user().id
            }
        ])

        if (error) throw new Error(error.message)
        
        const response = await supabase.from('invasions')
            .select(`*, 
                    status_options (
                        name
                    )`).eq('id', data[0]['id'])
        
        if (response.error) throw new Error(response.error.message)

        if (response.data.length > 0) {
            let invasion = Invasion.createFromJsonResponse(response.data[0])
            this.invasionsCache[invasion.id.value] = invasion
            return invasion
        }

        throw new Error('Unknown Error')

    }

    async deleteInvasion(invasion) {
        if (this.invasionsCache.hasOwnProperty(invasion.id.value)) delete this.invasionsCache[invasion.id.value]
        return await invasion.delete()
    }

}

const invasionManager = new InvasionManager()

export default function useInvasionManager() {
    return invasionManager
}