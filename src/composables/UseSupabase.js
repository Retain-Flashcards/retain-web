import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ynxnzcoflvceiwiorfic.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueG56Y29mbHZjZWl3aW9yZmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQ5MjA3NTcsImV4cCI6MTk4MDQ5Njc1N30.c6pq6LGAI_mx9CorbsDVwv5Ghak6-xQ6Axelfak8VBY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function useSupabase() {
    const makeSupabaseFetch = async (functionName, data) => {

        
        const result = await fetch(`https://app.retaincards.com/${functionName}`, {
            method: 'POST',  
            headers: {
                'Authorization': `Bearer ${supabase.auth.session().access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return await result.json()
        /*const result = await supabase.functions.invoke(functionName, {
            body: JSON.stringify(data)
        })

        if (result.error) throw result.error

        return result.data*/
    }

    return { supabase, makeSupabaseFetch }
}