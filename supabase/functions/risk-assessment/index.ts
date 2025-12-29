import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Fetch user's actual portfolio data from database for verification
    const { data: userHoldings, error: holdingsError } = await supabaseClient
      .from('user_holdings')
      .select('*, properties(name, token_price)')
      .eq('user_id', user.id);

    const { data: loanInvestments, error: loansError } = await supabaseClient
      .from('user_loan_investments')
      .select('*, loans(name, apy)')
      .eq('user_id', user.id);

    const { data: bets, error: betsError } = await supabaseClient
      .from('user_bets')
      .select('*, prediction_markets(title)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Build verified portfolio from actual database data
    const verifiedPortfolio = {
      holdings: userHoldings || [],
      debtInvestments: loanInvestments || [],
      predictions: bets || [],
      totalValue: (userHoldings || []).reduce((sum: number, h: any) => 
        sum + (h.tokens * (h.properties?.token_price || 0)), 0) +
        (loanInvestments || []).reduce((sum: number, l: any) => 
          sum + (l.principal_invested || 0), 0),
      allocation: {
        properties: (userHoldings || []).length,
        loans: (loanInvestments || []).length,
        predictions: (bets || []).length
      }
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const portfolioSummary = `
User Portfolio (Verified from database):
- Total Value: $${verifiedPortfolio.totalValue?.toLocaleString() || 0}
- Property Holdings: ${verifiedPortfolio.holdings.length} positions
- Debt Investments: ${verifiedPortfolio.debtInvestments.length} loans
- Prediction Market Positions: ${verifiedPortfolio.predictions.length} active bets
- Holdings Details: ${JSON.stringify(verifiedPortfolio.holdings.map((h: any) => ({
  property: h.properties?.name,
  tokens: h.tokens,
  value: h.tokens * (h.properties?.token_price || 0)
})))}
- Loan Details: ${JSON.stringify(verifiedPortfolio.debtInvestments.map((l: any) => ({
  loan: l.loans?.name,
  principal: l.principal_invested,
  apy: l.loans?.apy
})))}
`;

    console.log("Analyzing risk for user:", user.id);

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

    console.log("Risk assessment completed for user:", user.id);

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
