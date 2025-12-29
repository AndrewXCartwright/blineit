import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert investment risk analyst. Analyze portfolios and provide:
1. Overall risk score (1-100, where 100 is highest risk)
2. Detailed breakdown of risk factors
3. Concentration risks (over-exposure to single assets/sectors)
4. Diversification suggestions
5. Actionable recommendations to reduce risk

Always respond with valid JSON in this exact format:
{
  "overallRiskScore": number,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskBreakdown": {
    "concentrationRisk": number,
    "volatilityRisk": number,
    "liquidityRisk": number,
    "marketRisk": number
  },
  "concentrationAlerts": [
    {
      "asset": string,
      "percentage": number,
      "severity": "warning" | "danger",
      "message": string
    }
  ],
  "diversificationScore": number,
  "diversificationSuggestions": [
    {
      "action": string,
      "reason": string,
      "expectedImpact": string
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": string,
      "description": string
    }
  ],
  "summary": string
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const portfolioSummary = portfolio ? `
User Portfolio:
- Total Value: $${portfolio.totalValue?.toLocaleString() || 0}
- Holdings: ${JSON.stringify(portfolio.holdings || [])}
- Asset Allocation: ${JSON.stringify(portfolio.allocation || {})}
- Debt Investments: ${JSON.stringify(portfolio.debtInvestments || [])}
- Prediction Market Positions: ${JSON.stringify(portfolio.predictions || [])}
` : "No portfolio data available. Provide general risk assessment guidance.";

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
          { role: "user", content: `Analyze this investment portfolio for risks and provide diversification suggestions:\n\n${portfolioSummary}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse risk assessment from AI response");
    }

    const riskAssessment = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(riskAssessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
