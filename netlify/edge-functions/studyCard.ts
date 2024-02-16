// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Context } from "https://edge.netlify.com";
 
const learningSteps = [1, 10]

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

//TODO: Work on security for this
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

//const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, undefined)

const unwrapSupabaseResult = (result: any, error: string = 'Something went wrong') => {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export default async (req: Request, context: Context): Promise<Response> => {
  
  console.log('testing')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No user') 

  const { cardId, category, localTimestamp } = await req.json()
  console.log(localTimestamp)
  const todayTimestamp = new Date(localTimestamp)
  console.log(todayTimestamp.getDate())
  todayTimestamp.setHours(3)
  todayTimestamp.setMinutes(0)
  todayTimestamp.setSeconds(0)
  todayTimestamp.setMilliseconds(0)
  const tomorrowTimestamp = new Date(todayTimestamp.getTime())
  tomorrowTimestamp.setDate(todayTimestamp.getDate() + 1)

  //Get the card
  const card = unwrapSupabaseResult( await supabase.rpc('get_card', {
    given_card_id: cardId
  }) )[0]

  //Get the card's note
  const note = unwrapSupabaseResult( await supabase.from('notes').select('*').eq('id', card.note_id) )[0]

  //Bury cards that are:
  //- not this card
  //- not a new card
  //- haven't already been reviewed today
  //- are from this note
  const result = await supabase.from('card_reviews').update({
    buried_until: tomorrowTimestamp.toISOString()
  }).not('card_id', 'eq', cardId).not('last_reviewed', 'is', null).lt('last_reviewed', todayTimestamp.toISOString()).eq('note_id', note.id)

  console.log(user)

  let updatedCard: any = {
    'card_id': cardId,
    'uid': user.id,
    'ease_factor': 2.5
  }

  //Is this card in the learning phase?
  //If so...
  //Category: 
  //- "Again" => step 1
  //- "Hard" => step down
  //- "Good" => step up
  if (card.learning != false) {
    switch(category) {
      case 'again':
        updatedCard['learning_step'] = 0
        break
      case 'hard':
        updatedCard['learning_step'] = card.learning_step > 0 ? (card.learning_step - 1) : 0
        break
      case 'good':
        updatedCard['learning_step'] = card.learning_step + 1
        break
      default:
        updatedCard['learning_step'] = card.learning_step
    }

    if (updatedCard['learning_step'] > learningSteps.length - 1) {
      updatedCard['learning'] = false
      updatedCard['current_interval'] = 1440 //(1 day)
    } else {
      updatedCard['current_interval'] = learningSteps[ updatedCard['learning_step'] ]
    }
  }
  
  //If the card wasn't in the learning phase...
  //Category: 
  //- "Again" => learning phase, last step; ease_factor -= 0.2
  //- "Hard" => multiply by 1.2
  //- "Good" => new_interval = current_interval * ease_factor
  else {

    switch(category) {
      case 'again':
        updatedCard['learning'] = true
        updatedCard['learning_step'] = learningSteps.length - 1
        updatedCard['current_interval'] = learningSteps[ updatedCard['learning_step'] ]
        updatedCard['ease_factor'] = Math.max((card.ease_factor && card.ease_factor != 0 ? card.ease_factor : 2.5) - 0.2, 1.3)
        break
      case 'hard':
        updatedCard['current_interval'] = card.current_interval * 1.2
        break
      case 'good':
        updatedCard['current_interval'] = card.current_interval * (card.ease_factor && card.ease_factor != 0 ? card.ease_factor : 2.5)
        break
      default:
        break
    }

  }

  updatedCard['last_reviewed'] = todayTimestamp
  updatedCard['precise_last_reviewed'] = new Date()
  updatedCard['current_interval'] = Math.round(updatedCard['current_interval'])

  console.log(updatedCard)
  const finalResult = unwrapSupabaseResult( await supabase.from('card_reviews').upsert(updatedCard) )

  return new Response(
    JSON.stringify({
      status: 'success',
      card: finalResult
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
}

export const config = { path: "/study-card" }

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
