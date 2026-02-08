import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ynxnzcoflvceiwiorfic.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueG56Y29mbHZjZWl3aW9yZmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQ5MjA3NTcsImV4cCI6MTk4MDQ5Njc1N30.c6pq6LGAI_mx9CorbsDVwv5Ghak6-xQ6Axelfak8VBY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// v2: Cache user and session from auth state changes (sync access)
let cachedUser = null
let cachedSession = null

supabase.auth.onAuthStateChange((event, session) => {
    cachedSession = session
    cachedUser = session?.user ?? null
})

// Initialize cache from existing session
supabase.auth.getSession().then(({ data: { session } }) => {
    cachedSession = session
    cachedUser = session?.user ?? null
})

// Helper for sync access to current user ID
const getCurrentUserId = () => cachedUser?.id

export default function useSupabase() {
    const makeSupabaseFetch = async (functionName, data) => {
        // v2: session() → use cached session or fetch async
        const token = cachedSession?.access_token
        
        const result = await fetch(`https://app.retaincards.com/${functionName}`, {
            method: 'POST',  
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return await result.json()
    }

    return { supabase, makeSupabaseFetch, getCurrentUserId }
}