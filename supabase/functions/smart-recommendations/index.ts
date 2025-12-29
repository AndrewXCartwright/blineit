import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an investment recommendation engine for B-LINE-IT, a real estate investment platform. Analyze the user's portfolio and preferences to suggest personalized investments.

You MUST respond with valid JSON only, no additional text. Use this exact structure:
{
  "recommendations": [
    {
      "type": "property" | "loan" | "prediction",
      "title": "Investment name",
      "reason": "Brief 1-2 sentence explanation why this matches their profile",
      "metrics": {
        "expectedReturn": "8-12%",
        "riskLevel": "low" | "medium" | "high",
        "minInvestment": "$500"
      },
      "tags": ["diversification", "income", "growth"]
    }
  ],
  "insights": [
    "Brief portfolio insight or suggestion"
  ]
}

Guidelines:
- Provide 3-5 diverse recommendations across different types
- Match risk tolerance and investment goals
- Suggest diversification if portfolio is concentrated
- Consider investment timeline
- Be specific with expected returns and minimums
- Keep reasons concise but personalized`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolio, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContext = `
User Portfolio:
- Total invested: ${portfolio?.totalInvested || '$0'}
- Properties: ${portfolio?.properties || 0} investments
- Loans: ${portfolio?.loans || 0} investments  
- Predictions: ${portfolio?.predictions || 0} positions
- Risk tolerance: ${preferences?.riskTolerance || 'moderate'}
- Investment goals: ${preferences?.goals?.join(', ') || 'balanced growth'}
- Preferred investment size: ${preferences?.investmentSize || '$500-$2000'}
- Time horizon: ${preferences?.timeHorizon || 'medium-term (3-5 years)'}
`;

    console.log("Generating recommendations for:", userContext);

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
          { role: "user", content: userContext },
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
    
    console.log("AI response:", content);

    // Parse the JSON response
    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback recommendations
      recommendations = {
        recommendations: [
          {
            type: "property",
            title: "Diversified REIT Portfolio",
            reason: "A balanced mix of commercial and residential properties for steady income.",
            metrics: { expectedReturn: "7-9%", riskLevel: "low", minInvestment: "$500" },
            tags: ["income", "diversification"]
          },
          {
            type: "loan",
            title: "Bridge Loan Opportunity",
            reason: "Short-term debt investment with attractive fixed returns.",
            metrics: { expectedReturn: "10-12%", riskLevel: "medium", minInvestment: "$1,000" },
            tags: ["income", "short-term"]
          },
          {
            type: "prediction",
            title: "Market Trend Predictions",
            reason: "Participate in real estate market predictions for potential high returns.",
            metrics: { expectedReturn: "Variable", riskLevel: "high", minInvestment: "$50" },
            tags: ["growth", "speculative"]
          }
        ],
        insights: [
          "Consider diversifying across asset types for better risk management."
        ]
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in smart-recommendations function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
