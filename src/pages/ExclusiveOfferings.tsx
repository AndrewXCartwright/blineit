import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Building2, TrendingUp, Clock, Users, DollarSign, Lock,
  ArrowRight, Crown, FileText, Calendar, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAccreditation, useExclusiveOfferings } from "@/hooks/useAccreditation";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";

const mockOfferings = [
  {
    id: "1",
    name: "Manhattan Prime Office Tower",
    description: "Class A office building in Midtown Manhattan with Fortune 500 anchor tenants",
    offering_type: "property",
    minimum_investment: 100000,
    target_raise: 50000000,
    current_raised: 32500000,
    target_irr: 18.5,
    target_multiple: 2.1,
    hold_period_years: 5,
    status: "open",
    opens_at: null,
    closes_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Diversified Real Estate Fund III",
    description: "Multi-strategy fund targeting industrial, multifamily, and retail assets",
    offering_type: "fund",
    minimum_investment: 250000,
    target_raise: 100000000,
    current_raised: 78000000,
    target_irr: 15.0,
    target_multiple: 1.8,
    hold_period_years: 7,
    status: "open",
    opens_at: null,
    closes_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "3",
    name: "Austin Tech Campus Syndication",
    description: "Ground-up development of a 500,000 SF tech campus in Austin's Domain",
    offering_type: "syndication",
    minimum_investment: 50000,
    target_raise: 75000000,
    current_raised: 75000000,
    target_irr: 22.0,
    target_multiple: 2.5,
    hold_period_years: 4,
    status: "fully_subscribed",
    opens_at: null,
    closes_at: null,
  },
  {
    id: "4",
    name: "Senior Bridge Loan Portfolio",
    description: "First-position bridge loans on stabilized multifamily properties",
    offering_type: "debt",
    minimum_investment: 100000,
    target_raise: 25000000,
    current_raised: 0,
    target_irr: 12.0,
    target_multiple: 1.3,
    hold_period_years: 2,
    status: "coming_soon",
    opens_at: "2024-02-01T00:00:00Z",
    closes_at: null,
  },
];

const offeringTypeColors: Record<string, string> = {
  property: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  fund: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  syndication: "bg-green-500/20 text-green-600 border-green-500/30",
  debt: "bg-orange-500/20 text-orange-600 border-orange-500/30",
};

const statusColors: Record<string, string> = {
  open: "bg-success/20 text-success border-success/30",
  coming_soon: "bg-warning/20 text-warning border-warning/30",
  fully_subscribed: "bg-muted text-muted-foreground border-border",
  closed: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function ExclusiveOfferings() {
  const { isVerified, isLoading: accreditationLoading } = useAccreditation();
  const { offerings, isLoading: offeringsLoading } = useExclusiveOfferings();

  // Use mock data for display
  const displayOfferings = offerings.length > 0 ? offerings : mockOfferings;

  if (!isVerified && !accreditationLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="container max-w-4xl mx-auto px-4 py-12">
          <Card className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Accredited Investors Only</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              These exclusive offerings are only available to verified accredited investors. 
              Complete your verification to unlock access.
            </p>
            <Link to="/accreditation">
              <Button size="lg" className="gap-2">
                Get Verified
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-primary" />
              <Badge className="bg-primary/20 text-primary border-primary/30">Accredited Investor</Badge>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Exclusive Offerings</h1>
            <p className="text-muted-foreground">
              Premium investment opportunities for qualified investors
            </p>
          </div>
        </motion.div>

        {/* Offerings Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {displayOfferings.map((offering, index) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full ${offering.status === 'fully_subscribed' ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={offeringTypeColors[offering.offering_type]}>
                          {offering.offering_type}
                        </Badge>
                        <Badge className={statusColors[offering.status]}>
                          {offering.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{offering.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {offering.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">
                        {((offering.current_raised / offering.target_raise) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={(offering.current_raised / offering.target_raise) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(offering.current_raised)} raised</span>
                      <span>of {formatCurrency(offering.target_raise)}</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Target className="w-3 h-3" />
                        Target IRR
                      </div>
                      <p className="font-semibold text-foreground">{offering.target_irr}%</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <TrendingUp className="w-3 h-3" />
                        Multiple
                      </div>
                      <p className="font-semibold text-foreground">{offering.target_multiple}x</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        Hold Period
                      </div>
                      <p className="font-semibold text-foreground">{offering.hold_period_years} yrs</p>
                    </div>
                  </div>

                  {/* Minimum & Deadline */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Minimum Investment</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(offering.minimum_investment)}
                      </p>
                    </div>
                    {offering.closes_at && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Closes</p>
                        <p className="font-semibold text-foreground">
                          {format(new Date(offering.closes_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                    {offering.opens_at && offering.status === 'coming_soon' && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Opens</p>
                        <p className="font-semibold text-foreground">
                          {format(new Date(offering.opens_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full gap-2"
                    disabled={offering.status !== 'open'}
                  >
                    {offering.status === 'open' && (
                      <>
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                    {offering.status === 'coming_soon' && 'Coming Soon'}
                    {offering.status === 'fully_subscribed' && 'Fully Subscribed'}
                    {offering.status === 'closed' && 'Closed'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
