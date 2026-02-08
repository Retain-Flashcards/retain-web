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
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
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
  console.log('test')
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


  const { deckId, userJwt } = await req.json()

  const todayTimestamp = new Date()
  
  todayTimestamp.setHours(3)
  const tomorrowTimestamp = new Date()
  tomorrowTimestamp.setDate(todayTimestamp.getDate() + 1)
  tomorrowTimestamp.setHours(3)


  const reviewCards = unwrapSupabaseResult( await supabase.rpc('get_review_cards_new', {
    given_deck_id: deckId
  }) )
  
  if (!reviewCards || reviewCards.length < 1) return new Response(
    JSON.stringify({
      card: null,
    }),
    { 
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey'
      } 
    },
  )

  let card = reviewCards[0]
  for (let i = 0; i < reviewCards.length; i++) {
    if (reviewCards[i].last_reviewed && reviewCards[i].learning && reviewCards[i].precise_last_reviewed) {
      let msDiff = new Date().getTime() - new Date(reviewCards[i].precise_last_reviewed).getTime()
      let minDiff = Math.floor(msDiff/1000/60)
      if (card.last_reviewed && card.learning && card.learning_step < reviewCards[i].learning_step) continue
      if (msDiff > 0 && minDiff >= reviewCards[i].current_interval) card = reviewCards[i]
    }
  }


  //Get new new and review counts
  const deck = unwrapSupabaseResult( await supabase.from('decks_with_new_review_counts_new').select('review_count, new_count').eq('deck_id', deckId) )[0]






  //Generate times for card
  let againTime = ''
  let hardTime = ''
  let goodTime = ''
  if (card.learning != false) {
    againTime = `${learningSteps[0]} min`
    hardTime = `${learningSteps[ Math.max(card.learning_step - 1, 0) ]} min`
    goodTime = (card.learning_step < learningSteps.length - 1) ? `${learningSteps[ card.learning_step + 1 ]} min`:`1 day`
  }
  
  //If the card wasn't in the learning phase...
  //Category: 
  //- "Again" => learning phase, last step; ease_factor -= 0.2
  //- "Hard" => multiply by 1.2
  //- "Good" => new_interval = current_interval * ease_factor
  else {
    againTime = `${learningSteps[ learningSteps.length - 1 ]} min`
    hardTime = `${Math.round((card.current_interval * 1.2) / 1440)} days`
    goodTime = `${Math.round((card.current_interval * (card.ease_factor ? card.ease_factor : 2.5)) / 1440)} days`
  }


  return new Response(
    JSON.stringify({
      card: card,
      reviewsLeft: deck.review_count,
      newLeft: deck.new_count,
      againTime,
      hardTime,
      goodTime
    }),
    { 
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      } 
    },
  )
}

//Temporarily Disabled
//export const config = { path: "/get-next-card-new" }

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
