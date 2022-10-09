import Manager from './Manager';
import useSupabase from '../../composables/UseSupabase'
import Action from '../objects/Action';

const { supabase } = useSupabase()

class ActionManager extends Manager {
    updateItem(oldItem, newItem) {
        oldItem.updateLocal(newItem)
    }

    async loadItem(identifier) {
        const { data, error } = await supabase.from('actions').select('*').eq('id', identifier)
        if (error) throw new Error(error.message)

        return data
    }

    async loadAction(identifier) { return await this.loadItem(identifier) }

    saveAction(action) {
        this.mergeIntoCache(action.id, action)
    }

    async loadActionHistoryForInvasion(invasionId) {
        console.log(invasionId)
        const response = await supabase.from('action_history').select('performed_at, invasion, notes, action (id, name, description)').eq('invasion', invasionId)
        if (response.error) throw new Error(response.error.message)
        console.log(response)
        const history = response.data

        for (let i = 0; i < history.length; i++) {
            let actionData = history[i].action
            let action = Action.createFromJsonResponse(actionData)
            this.saveAction(action)
            history[i].action = action
        }

        return history
    }

}

const actionManager = new ActionManager()

export default function useActionManager() {
    return actionManager
}