import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  PieChart, 
  Loader2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';

interface RiskBreakdown {
  concentrationRisk: number;
  volatilityRisk: number;
  liquidityRisk: number;
  marketRisk: number;
}

interface ConcentrationAlert {
  asset: string;
  percentage: number;
  severity: 'warning' | 'danger';
  message: string;
}

interface DiversificationSuggestion {
  action: string;
  reason: string;
  expectedImpact: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface RiskAssessmentData {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskBreakdown: RiskBreakdown;
  concentrationAlerts: ConcentrationAlert[];
  diversificationScore: number;
  diversificationSuggestions: DiversificationSuggestion[];
  recommendations: Recommendation[];
  summary: string;
}

export const RiskAssessment = () => {
  const [assessment, setAssessment] = useState<RiskAssessmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const { holdings, portfolioValue } = useUserData();

  const analyzeRisk = async () => {
    setLoading(true);
    try {
      const portfolio = {
        totalValue: portfolioValue,
        holdings: holdings.map(h => ({
          name: h.property?.name || 'Unknown',
          tokens: h.tokens,
          value: h.tokens * (h.property?.token_price || h.average_buy_price),
          percentage: portfolioValue > 0 ? ((h.tokens * (h.property?.token_price || h.average_buy_price)) / portfolioValue) * 100 : 0
        })),
        allocation: {
          equity: holdings.reduce((sum, h) => sum + (h.tokens * (h.property?.token_price || h.average_buy_price)), 0),
        }
      };

      const { data, error } = await supabase.functions.invoke('risk-assessment', {
        body: { portfolio }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAssessment(data);
    } catch (error) {
      console.error('Risk assessment error:', error);
      toast.error('Failed to analyze portfolio risk');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20';
      case 'medium': return 'bg-yellow-500/20';
      case 'high': return 'bg-orange-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (!assessment) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Risk Assessment</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Get an AI-powered analysis of your portfolio's risk profile, concentration alerts, and personalized diversification suggestions.
          </p>
          <Button onClick={analyzeRisk} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Portfolio...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Analyze My Portfolio
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Overall Risk Score</CardTitle>
          <Button variant="ghost" size="sm" onClick={analyzeRisk} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-5xl font-bold ${getRiskColor(assessment.riskLevel)}`}>
              {assessment.overallRiskScore}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getRiskBgColor(assessment.riskLevel)}>
                  {assessment.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <Progress 
                value={assessment.overallRiskScore} 
                className="h-3"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{assessment.summary}</p>
        </CardContent>
      </Card>

      {/* Risk Breakdown */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Risk Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(assessment.riskBreakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key.replace('Risk', ' Risk')}</span>
                <span className="font-medium">{value}/100</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Concentration Alerts */}
      {assessment.concentrationAlerts.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Concentration Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessment.concentrationAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'danger' 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-yellow-500/50 bg-yellow-500/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">{alert.asset}</div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                    <Badge variant="outline" className="mt-1">
                      {alert.percentage.toFixed(1)}% of portfolio
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Diversification Score & Suggestions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Diversification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-primary">
              {assessment.diversificationScore}/100
            </div>
            <Progress value={assessment.diversificationScore} className="flex-1 h-3" />
          </div>
          
          <div className="space-y-3">
            {assessment.diversificationSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">{suggestion.action}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.reason}</div>
                    <div className="text-sm text-primary mt-1">
                      Expected: {suggestion.expectedImpact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant={getPriorityColor(rec.priority) as any} className="mt-0.5">
                {rec.priority}
              </Badge>
              <div>
                <div className="font-medium">{rec.title}</div>
                <div className="text-sm text-muted-foreground">{rec.description}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
