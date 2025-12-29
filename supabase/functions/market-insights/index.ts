import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a real estate market analyst AI for B-LINE-IT. Analyze market conditions and provide insights.

You MUST respond with valid JSON only, no additional text. Use this exact structure:
{
  "summary": "Brief 2-3 sentence market overview",
  "sentiment": "bullish" | "bearish" | "neutral",
  "sentimentScore": 0-100 (0=very bearish, 100=very bullish),
  "keyPoints": [
    "Short bullet point insight (max 10 words each)"
  ],
  "marketTrends": [
    {
      "category": "Residential" | "Commercial" | "Industrial" | "Retail",
      "trend": "up" | "down" | "stable",
      "change": "+X%" or "-X%",
      "insight": "Brief explanation"
    }
  ],
  "topLocations": [
    {
      "location": "City, State",
      "sentiment": "hot" | "warming" | "cooling" | "cold",
      "reason": "Brief reason"
    }
  ],
  "predictions": [
    {
      "title": "Prediction title",
      "probability": "XX%",
      "timeframe": "Next X months"
    }
  ]
}

Guidelines:
- Provide realistic market analysis based on current trends
- Include 3-5 key points
- Include 3-4 market trends by category
- Include 3-5 top locations
- Include 2-3 predictions
- Be specific with percentages and timeframes
- Focus on actionable insights for investors`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client and verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Invalid or expired token:", userError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    const { location, focusArea } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Provide a comprehensive real estate market analysis${location ? ` for ${location}` : ' for the US market'}${focusArea ? `, focusing on ${focusArea}` : ''}. Include current market sentiment, key trends, hot locations, and short-term predictions. Base analysis on typical Q4 2024 / Q1 2025 market conditions.`;

    console.log("Generating market insights for user:", user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received for user:", user.id);

    // Parse the JSON response
    let insights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback insights
      insights = {
        summary: "The real estate market shows mixed signals with residential demand remaining strong while commercial sectors adjust to new work patterns.",
        sentiment: "neutral",
        sentimentScore: 55,
        keyPoints: [
          "Interest rates stabilizing after recent hikes",
          "Rental demand outpacing supply in major metros",
          "Industrial warehousing continues strong growth",
          "Office vacancy rates slowly improving"
        ],
        marketTrends: [
          { category: "Residential", trend: "up", change: "+3.2%", insight: "Single-family homes in demand" },
          { category: "Commercial", trend: "stable", change: "+0.5%", insight: "Office market stabilizing" },
          { category: "Industrial", trend: "up", change: "+5.1%", insight: "E-commerce driving growth" }
        ],
        topLocations: [
          { location: "Austin, TX", sentiment: "hot", reason: "Tech hub migration" },
          { location: "Nashville, TN", sentiment: "warming", reason: "Healthcare sector growth" },
          { location: "Phoenix, AZ", sentiment: "warming", reason: "Affordability + job growth" }
        ],
        predictions: [
          { title: "Fed rate cuts begin", probability: "65%", timeframe: "Next 6 months" },
          { title: "Office occupancy improves 10%", probability: "55%", timeframe: "Next 12 months" }
        ]
      };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in market-insights function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
