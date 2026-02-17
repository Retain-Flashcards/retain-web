// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.4'
import type { Context } from "https://edge.netlify.com";
import { Purchases } from "npm:@revenuecat/purchases-js"
 
const learningSteps = [1, 10]

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, undefined)

const unwrapSupabaseResult = (result: any, error: string = 'Something went wrong') => {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export default async (req: Request, context: Context): Promise<Response> => {

  const FUNCTION_START_TIME = new Date().getTime()
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { event } = await req.json()

  if (!event || !event['app_user_id']) {
    throw new Error('Invalid event')
  }

  console.log('Syncing user: ', event['app_user_id'])

  //Instantiate Purchases
  const purchases = Purchases.configure({ apiKey: Deno.env.get('REVENUECAT_API_KEY') as string, appUserId: event['app_user_id'] })

  //Is the user entitled to retain-pro?
  const isPro = await purchases.isEntitledTo('retain-pro')

  //Update the user's subscription status in Supabase
  await supabase.from('users').update({
    plan: isPro ? 'retain-pro' : null
  }).eq('id', event['app_user_id'])

  return new Response(
    JSON.stringify({
      status: 'success',
      card: finalResult
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
}

export const config = { path: "/revenuecat-sync" }
