import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Building2, Landmark, Target, Loader2, RefreshCw, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Recommendation = {
  type: "property" | "loan" | "prediction";
  title: string;
  reason: string;
  metrics: {
    expectedReturn: string;
    riskLevel: "low" | "medium" | "high";
    minInvestment: string;
  };
  tags: string[];
};

type RecommendationsData = {
  recommendations: Recommendation[];
  insights: string[];
};

const typeIcons = {
  property: Building2,
  loan: Landmark,
  prediction: Target,
};

const typeColors = {
  property: "text-emerald-500",
  loan: "text-blue-500",
  prediction: "text-purple-500",
};

const riskColors = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-red-500/10 text-red-500",
};

export function SmartRecommendations() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Get current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to get recommendations");
      }

      // Mock portfolio data - in production, fetch from user's actual portfolio
      const portfolio = {
        totalInvested: "$15,000",
        properties: 3,
        loans: 2,
        predictions: 1,
      };

      const preferences = {
        riskTolerance: "moderate",
        goals: ["passive income", "long-term growth"],
        investmentSize: "$1,000-$5,000",
        timeHorizon: "5-10 years",
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ portfolio, preferences }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const result = await response.json();
      setData(result);
      setHasLoaded(true);
    } catch (error) {
      console.error("Recommendations error:", error);
      toast({
        title: "Could not load recommendations",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    switch (rec.type) {
      case "property":
        navigate("/properties");
        break;
      case "loan":
        navigate("/assets");
        break;
      case "prediction":
        navigate("/predict");
        break;
    }
  };

  if (!hasLoaded) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-Powered Recommendations</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get personalized investment suggestions based on your portfolio and goals.
          </p>
          <Button onClick={fetchRecommendations} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">For You</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Insights */}
      {data?.insights && data.insights.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{data.insights[0]}</p>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        {data?.recommendations?.map((rec, i) => {
          const Icon = typeIcons[rec.type];
          return (
            <Card 
              key={i} 
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => handleRecommendationClick(rec)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg bg-secondary", typeColors[rec.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sm truncate">{rec.title}</h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rec.reason}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {rec.metrics.expectedReturn}
                      </Badge>
                      <Badge className={cn("text-xs", riskColors[rec.metrics.riskLevel])}>
                        {rec.metrics.riskLevel} risk
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Min: {rec.metrics.minInvestment}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
