import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, 
  MapPin, BarChart3, Lightbulb, Target, Flame, ThermometerSun,
  ThermometerSnowflake, Snowflake, ArrowUp, ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type MarketTrend = {
  category: string;
  trend: "up" | "down" | "stable";
  change: string;
  insight: string;
};

type TopLocation = {
  location: string;
  sentiment: "hot" | "warming" | "cooling" | "cold";
  reason: string;
};

type Prediction = {
  title: string;
  probability: string;
  timeframe: string;
};

type InsightsData = {
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  sentimentScore: number;
  keyPoints: string[];
  marketTrends: MarketTrend[];
  topLocations: TopLocation[];
  predictions: Prediction[];
};

const sentimentIcons = {
  hot: Flame,
  warming: ThermometerSun,
  cooling: ThermometerSnowflake,
  cold: Snowflake,
};

const sentimentColors = {
  hot: "text-red-500 bg-red-500/10",
  warming: "text-orange-500 bg-orange-500/10",
  cooling: "text-blue-400 bg-blue-400/10",
  cold: "text-blue-600 bg-blue-600/10",
};

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

const trendColors = {
  up: "text-green-500",
  down: "text-red-500",
  stable: "text-yellow-500",
};

export function MarketInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to get insights");
      }

      const result = await response.json();
      setData(result);
      setHasLoaded(true);
    } catch (error) {
      console.error("Insights error:", error);
      toast({
        title: "Could not load market insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI Market Insights</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get real-time market analysis, sentiment scores, and location insights.
          </p>
          <Button onClick={fetchInsights} disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Get Market Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold text-lg">Market Insights</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sentiment Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Market Sentiment</span>
            <Badge variant={data?.sentiment === "bullish" ? "default" : data?.sentiment === "bearish" ? "destructive" : "secondary"}>
              {data?.sentiment === "bullish" && <TrendingUp className="h-3 w-3 mr-1" />}
              {data?.sentiment === "bearish" && <TrendingDown className="h-3 w-3 mr-1" />}
              {data?.sentiment === "neutral" && <Minus className="h-3 w-3 mr-1" />}
              {data?.sentiment}
            </Badge>
          </div>
          <Progress value={data?.sentimentScore || 50} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bearish</span>
            <span>{data?.sentimentScore}%</span>
            <span>Bullish</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{data?.summary}</p>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ul className="space-y-2">
            {data?.keyPoints?.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Sector Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {data?.marketTrends?.map((trend, i) => {
              const TrendIcon = trendIcons[trend.trend];
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendIcon className={cn("h-4 w-4", trendColors[trend.trend])} />
                    <span className="text-sm font-medium">{trend.category}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-sm font-medium", trendColors[trend.trend])}>
                      {trend.change}
                    </span>
                    <p className="text-xs text-muted-foreground">{trend.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            Hot Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {data?.topLocations?.map((loc, i) => {
              const SentimentIcon = sentimentIcons[loc.sentiment];
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded", sentimentColors[loc.sentiment])}>
                      <SentimentIcon className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{loc.location}</span>
                  </div>
                  <span className="text-xs text-muted-foreground max-w-[120px] text-right">
                    {loc.reason}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {data?.predictions?.map((pred, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{pred.title}</span>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {pred.probability}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">{pred.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
