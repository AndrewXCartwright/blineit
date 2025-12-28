import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Lock, TrendingUp, Clock, Target, DollarSign, Users,
  FileText, Download, Building2, CheckCircle2, Calendar, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { useState } from "react";

const mockOffering = {
  id: "1",
  name: "Manhattan Prime Office Tower",
  description: "Class A office building in Midtown Manhattan with Fortune 500 anchor tenants. This trophy asset offers stable cash flows with upside potential through lease-up of vacant space and mark-to-market on below-market leases.",
  target_raise: 50000000,
  minimum_investment: 100000,
  maximum_investment: 5000000,
  investment_increment: 25000,
  target_irr: 18.5,
  target_multiple: 2.1,
  hold_period_years: 5,
  current_raised: 32500000,
  investor_count: 48,
  status: "open",
  closes_at: "2024-03-01T00:00:00Z",
  structure: "LLC Class A Units",
  sponsor_coinvest: 5000000,
  management_fee: 1.5,
  carried_interest: 20,
  preferred_return: 8,
  distribution_frequency: "Quarterly",
  k1_provided: true,
  investment_thesis: "This investment targets a Class A office tower in Midtown Manhattan's premier submarket. The property features 95% occupancy with a weighted average lease term of 7.2 years. The business plan focuses on: (1) renewing existing tenants at market rates, (2) leasing up remaining vacant space, and (3) implementing operational efficiencies to reduce expenses by 5%. Exit strategy includes a sale to an institutional buyer or REIT in Year 5.",
  projected_returns: [
    { year: 1, cashFlow: 8000, cumulative: 8000 },
    { year: 2, cashFlow: 8500, cumulative: 16500 },
    { year: 3, cashFlow: 9000, cumulative: 25500 },
    { year: 4, cashFlow: 9500, cumulative: 35000 },
    { year: 5, cashFlow: 175000, cumulative: 210000 }, // Includes exit
  ],
  documents: [
    { name: "Private Placement Memorandum (PPM)", type: "ppm" },
    { name: "Operating Agreement", type: "operating" },
    { name: "Subscription Agreement", type: "subscription" },
    { name: "Investment Summary", type: "summary" },
    { name: "Pro Forma Financial Model", type: "proforma" },
    { name: "Due Diligence Package", type: "diligence" },
  ],
  sponsor: {
    name: "PropVest Capital Partners",
    trackRecord: {
      totalDeals: 42,
      totalAUM: 3200000000,
      averageIRR: 22.4,
      averageMultiple: 2.3,
    },
  },
};

const investmentAmounts = [100000, 250000, 500000];

export default function InstitutionalOfferingDetail() {
  const { id } = useParams();
  const [selectedAmount, setSelectedAmount] = useState(100000);
  const [customAmount, setCustomAmount] = useState("");

  const offering = mockOffering;
  const fundedPercent = (offering.current_raised / offering.target_raise) * 100;

  const actualAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const ownershipPercent = ((actualAmount / offering.target_raise) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <Link to="/institutional" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{offering.name}</h1>
              <Badge variant="outline">
                <Lock className="w-3 h-3 mr-1" />
                Accredited
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{offering.description}</p>
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Target Raise</p>
              <p className="font-bold text-lg">{formatCurrency(offering.target_raise)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-xs text-muted-foreground">Target IRR</p>
              <p className="font-bold text-lg text-success">{offering.target_irr}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-xs text-muted-foreground">Hold Period</p>
              <p className="font-bold text-lg">{offering.hold_period_years} Years</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Percent className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-xs text-muted-foreground">Target Multiple</p>
              <p className="font-bold text-lg">{offering.target_multiple}x</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Funding Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={fundedPercent} className="h-3" />
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{fundedPercent.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Funded</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(offering.current_raised)}</p>
                      <p className="text-xs text-muted-foreground">Raised</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{offering.investor_count}</p>
                      <p className="text-xs text-muted-foreground">Investors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{format(new Date(offering.closes_at), "MMM d")}</p>
                      <p className="text-xs text-muted-foreground">Closes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Investment Terms */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Investment Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Minimum Investment</p>
                      <p className="font-semibold">{formatCurrency(offering.minimum_investment)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Maximum Investment</p>
                      <p className="font-semibold">{formatCurrency(offering.maximum_investment)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Increments</p>
                      <p className="font-semibold">{formatCurrency(offering.investment_increment)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Structure</p>
                      <p className="font-semibold">{offering.structure}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Sponsor Co-Invest</p>
                      <p className="font-semibold">{formatCurrency(offering.sponsor_coinvest)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Management Fee</p>
                      <p className="font-semibold">{offering.management_fee}% annually</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Carried Interest</p>
                      <p className="font-semibold">{offering.carried_interest}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Preferred Return</p>
                      <p className="font-semibold">{offering.preferred_return}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Distributions</p>
                      <p className="font-semibold">{offering.distribution_frequency}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    K-1 tax documents provided annually
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Investment Thesis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Investment Thesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{offering.investment_thesis}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Projected Returns */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Projected Returns ($100K Investment)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-muted-foreground">Year</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">Cash Flow</th>
                          <th className="text-right py-2 font-medium text-muted-foreground">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offering.projected_returns.map((row) => (
                          <tr key={row.year} className="border-b border-border/50">
                            <td className="py-2 font-medium">Year {row.year}</td>
                            <td className="py-2 text-right text-success">{formatCurrency(row.cashFlow)}</td>
                            <td className="py-2 text-right font-semibold">{formatCurrency(row.cumulative)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    *Projections are estimates only and not guaranteed. Actual returns may vary.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {offering.documents.map((doc) => (
                      <div key={doc.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sponsor */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{offering.sponsor.name}</h4>
                      <p className="text-sm text-muted-foreground">Real Estate Investment Manager</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold text-foreground">{offering.sponsor.trackRecord.totalDeals}</p>
                      <p className="text-xs text-muted-foreground">Total Deals</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold text-foreground">${(offering.sponsor.trackRecord.totalAUM / 1e9).toFixed(1)}B</p>
                      <p className="text-xs text-muted-foreground">AUM</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold text-success">{offering.sponsor.trackRecord.averageIRR}%</p>
                      <p className="text-xs text-muted-foreground">Avg. IRR</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold text-foreground">{offering.sponsor.trackRecord.averageMultiple}x</p>
                      <p className="text-xs text-muted-foreground">Avg. Multiple</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Investment Action */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sticky top-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>Invest Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Select Amount</p>
                    <div className="grid grid-cols-3 gap-2">
                      {investmentAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                            selectedAmount === amount && !customAmount
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Custom amount..."
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ownership %</span>
                      <span className="font-medium">{ownershipPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Annual Cash</span>
                      <span className="font-medium text-success">{formatCurrency(actualAmount * 0.08)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Exit Value</span>
                      <span className="font-medium">{formatCurrency(actualAmount * offering.target_multiple)}</span>
                    </div>
                  </div>

                  <Link to={`/institutional/subscribe/${id}`}>
                    <Button className="w-full" size="lg">
                      Begin Subscription
                    </Button>
                  </Link>

                  <p className="text-xs text-muted-foreground text-center">
                    Closing {format(new Date(offering.closes_at), "MMMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
