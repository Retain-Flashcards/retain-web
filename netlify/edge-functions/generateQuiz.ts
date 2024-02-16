// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "https://deno.land/x/xhr@0.1.2/mod.ts"
import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { compile } from 'https://esm.sh/html-to-text'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.0.1'
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

function processCompletion(completion: any) {
  let string = completion.choices[0].text.trim()
  string = string.slice(string.indexOf('1.'), string.length)
  let arrs = string.split('\n')
  arrs = arrs.filter((item: string) => {
      return item[0] in ('123456789'.split(''))
  })
  return arrs
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

  const {
    data: { user },
  } = await supabase.auth.getUser()


  const { notes, deckId } = await req.json()

  const cards = unwrapSupabaseResult( await supabase.rpc('get_ai_cards', {
    note_ids: notes
  }) )
  
  let prompt = 'List the topics discussed in the following information:\n'
  const toPlaintext = compile({})

  for (let i = 0; i < cards.length; i++) {
    prompt += `${toPlaintext(cards[i].back_content)}\n`
  }

  const configuration = new Configuration({
    apiKey: Deno.env.get('OPEN_AI_KEY')
  })

  const openai = new OpenAIApi(configuration)
  const topicsCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.77,
    max_tokens: 1200,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
    stop: ["###"],
  })

  const topicsList = topicsCompletion.data.choices[0].text

  const questionsPrompt = `Give me 15 challenging questions about the following topics:${topicsList}`

  const questionsCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: questionsPrompt,
    temperature: 0.77,
    max_tokens: 1200,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
    stop: ["###"],
  })

  const answersPrompt = `Give me the answers to these questions:${questionsCompletion.data.choices[0].text}`

  const answersCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: answersPrompt,
    temperature: 0.77,
    max_tokens: 1200,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
    stop: ["###"],
  })

  //Format the completion data
  const _answers = processCompletion(answersCompletion.data)
  const _questions = processCompletion(questionsCompletion.data)
  
  let qaList = []

  for (let i = 0; i < _questions.length; i++) {
      qaList.push({
          question: _questions[i],
          answer: _answers[i] ? _answers[i]:'No answer provided'
      })
  }

  //Now, upload the questions and answers as a JSON file to supabase
  let jsonContent = JSON.stringify({
    qa: qaList,
    topics: topicsList
  })

  const jsonBlob = new Blob([jsonContent], {
    type: 'application/json'
  })

  const uploadResult = unwrapSupabaseResult( await supabase.storage.from('quizzes').upload(`${user?.id}/${deckId}/${crypto.randomUUID()}.json`, jsonBlob) )
  const saveQuizResult = unwrapSupabaseResult( await supabase.from('quizzes').insert({
    uid: user?.id,
    deck_id: deckId,
    topics_list: topicsList,
    path: uploadResult.path
  }) )

  return new Response(
    JSON.stringify({
      prompt: prompt,
      qaFilePath: uploadResult.path,
    }),
    { 
      headers: { 
        "Content-Type": "application/json", 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey'
      } 
    },
  )
}

export const config = { path: "/generate-quiz" }

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
