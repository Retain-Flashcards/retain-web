// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "https://deno.land/x/xhr@0.1.2/mod.ts"
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import OpenAI from "https://deno.land/x/openai@v4.69.0/mod.ts"
import type { Context } from "https://edge.netlify.com";
 
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { messages, imageUrl } = await req.json()

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY') as string
  })

  const response = await openai.chat.completions.create({
    model: "ft:gpt-4o-2024-08-06:personal::Ax62vghT",
    messages: [
      {
        "role": "system",
        "content": [
          {
            "type": "text",
            "text": "The user will give you an image, and your job is to analyze all the information in the image and create a set of \"flashcards\" that covers all of it. The cards use the Anki cloze deletion format, so rather than giving a front and back, just give a sentence with important terms wrapped in {{c1::term::optional hint}}. For example:\n\nOriginal sentence:\n\"Starch is a mix of 2 homopolysaccharides: amylose and amylopectin. It is used as an energy storage molecule in plants.\"\n\nCloze flashcard:\n\"Starch is a mix of 2 homopolysaccharides: {{c1::amylose}} and {{c1::amylopectin}}. It is used as an energy storage molecule in {{c2::plants::what organisms}}.\"\n\n\nKeep in mind, the image will not be visible to the person reading your flashcards, so you shouldn't write things that refer to the image itself. Also, don't be afraid to make more complex sentences that incorporate several key details, as this helps the student put together relevant ideas. \n\nMake absolutely sure that you make as many cards as you need to cover ALL the information in the image!!!"
          }
        ]
      },
      ...messages
    ],
    response_format: {
      "type": "text"
    },
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  })

  const full_response = JSON.parse( response.data.choices[0].message.content )

  return new Response(
    JSON.stringify({
      cards: full_response,
      imageUrl: imageUrl
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

export const config = { path: "/generate-cards" }

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
