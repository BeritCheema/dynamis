
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMENI_API_KEY = Deno.env.get('GEMENI_API_KEY');
    if (!GEMENI_API_KEY) {
      throw new Error('GEMENI_API_KEY is not set');
    }

    // Initialize the WebSocket session with Gemini
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-live-001:streamGenerateContent?key=" + GEMENI_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "contents": [{
          "role": "user",
          "parts": [{
            "text": "Hello"
          }]
        }],
        "generation_config": {
          "response_modalities": ["AUDIO"],
          "speech_config": {
            "voice_config": {
              "prebuilt_voice_config": {
                "voice_name": "Puck"
              }
            }
          }
        },
        "system_instruction": {
          "parts": [{
            "text": "You are a knowledgeable baseball pitching coach. You help players improve their pitching technique, provide advice on different pitches, and answer questions about baseball pitching mechanics. Keep your responses focused, practical, and encouraging. If asked about an injury, always recommend consulting a medical professional."
          }]
        }
      }),
    });

    const data = await response.json();
    console.log("Session response:", data);

    // Create a properly formatted response for the client
    // The WebSocket URL will be constructed client-side using the API key
    const sessionData = {
      sessionHandle: GEMENI_API_KEY, // We're using the API key as the session handle
      modelName: "gemini-2.0-flash-live-001"
    };

    return new Response(JSON.stringify(sessionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
