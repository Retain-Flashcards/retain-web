// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Context } from "https://edge.netlify.com";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

//TODO: Work on security for this
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string

const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

//const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, undefined)

const unwrapSupabaseResult = (result: any, error: string = 'Something went wrong') => {
  if (result.error) {
    console.error(result.error)
    throw new Error(error)
  }
  return result.data
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    SUPABASE_KEY, 
    {
      schema: 'auth'
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Must be logged in')

  const { email, deckId, role } = await req.json()
  
  const users = unwrapSupabaseResult( await supabaseAdmin.from('users').select('id').eq('email', email.toLowerCase()) )
  if (users.length == 0) throw new Error('Invalid email')

  const { id } = users[0]

  console.log(deckId)

  const { data, error } = await supabase.from('shared_decks').upsert({
    uid: id,
    owner: user.id,
    deck_id: deckId,
    access_level: role == 'Editor' ? 2:1
  })

  if (error) throw new Error(error.message)
  
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey'
      } 
    },
  )
}

export const config = { path: "/share-deck" }

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
