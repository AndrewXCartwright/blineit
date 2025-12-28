import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Briefcase, TrendingUp, DollarSign, Building2, 
  FileText, Calendar, Clock, ArrowRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { mockInstitutionalStats, mockInvestments, mockPendingSubscriptions } from "@/hooks/useInstitutional";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";

export default function InstitutionalInvestments() {
  const stats = mockInstitutionalStats;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Link to="/institutional" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">My Investments</h1>
          <p className="text-muted-foreground">Track your institutional investment portfolio</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="font-bold text-lg">{formatCurrency(stats.totalInvested)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-xs text-muted-foreground">Total Distributed</p>
              <p className="font-bold text-lg text-success">{formatCurrency(stats.totalDistributed)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-xs text-muted-foreground">Blended IRR</p>
              <p className="font-bold text-lg">{stats.blendedIRR}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-xs text-muted-foreground">Active Positions</p>
              <p className="font-bold text-lg">{stats.activePositions}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Subscriptions */}
        {mockPendingSubscriptions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  Pending Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPendingSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div>
                      <h4 className="font-semibold text-foreground">{sub.offeringName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(sub.amount)} • Submitted {format(new Date(sub.submittedDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-warning/20 text-warning">Awaiting Wire</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Wire Instructions</Button>
                        <Button size="sm" variant="ghost" className="text-destructive">Cancel</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Investments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Active Investments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockInvestments.map((investment) => (
                <div key={investment.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{investment.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Invested {formatCurrency(investment.investedAmount)} on {format(new Date(investment.investedDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(investment.currentValue)}</p>
                      <p className={`text-sm ${investment.gainPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {investment.gainPercent >= 0 ? '+' : ''}{investment.gainPercent}%
                      </p>
                    </div>
                  </div>

                  {investment.isDevelopment && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Construction Progress</span>
                        <span className="font-medium">{investment.completionPercent}%</span>
                      </div>
                      <Progress value={investment.completionPercent} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">Distributions YTD</p>
                      <p className="font-semibold text-success">{formatCurrency(investment.distributionsYTD)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">IRR to Date</p>
                      <p className="font-semibold">{investment.irrToDate}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">Next Distribution</p>
                      <p className="font-semibold">
                        {investment.nextDistribution > 0 
                          ? `${formatCurrency(investment.nextDistribution)} (${format(new Date(investment.nextDistributionDate || ""), "MMM d")})`
                          : "N/A"
                        }
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">Expected Exit</p>
                      <p className="font-semibold">{format(new Date(investment.expectedExit), "MMM yyyy")}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      View K-1
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Documents
                    </Button>
                    {investment.isDevelopment && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Project Updates
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
