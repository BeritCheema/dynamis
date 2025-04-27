
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

    // Use a valid model name for Gemini
    const modelName = "gemini-1.5-flash-latest";
    
    // We don't actually need to make an initial request here,
    // we just need to provide the API key and model name to the client
    const sessionData = {
      sessionHandle: GEMENI_API_KEY,
      modelName: modelName
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
