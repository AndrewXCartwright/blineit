import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, TrendingUp, DollarSign, Briefcase, Crown, Phone, Mail,
  Calendar, ArrowRight, Clock, Lock, Star, ChevronRight, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAccreditation, useExclusiveOfferings } from "@/hooks/useAccreditation";
import { useInstitutionalAccount, useRelationshipManager, mockInstitutionalStats } from "@/hooks/useInstitutional";
import { ScheduleCallModal } from "@/components/institutional/ScheduleCallModal";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";

const mockOfferings = [
  {
    id: "1",
    name: "Manhattan Prime Office Tower",
    target_raise: 50000000,
    minimum_investment: 100000,
    target_irr: 18.5,
    hold_period_years: 5,
    distribution_frequency: "Quarterly",
    current_raised: 32500000,
    status: "open",
    closes_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Diversified Real Estate Fund III",
    target_raise: 100000000,
    minimum_investment: 250000,
    target_irr: 15.0,
    hold_period_years: 7,
    distribution_frequency: "Quarterly",
    current_raised: 78000000,
    status: "open",
    closes_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "4",
    name: "Senior Bridge Loan Portfolio",
    target_raise: 25000000,
    minimum_investment: 100000,
    target_irr: 12.0,
    hold_period_years: 2,
    distribution_frequency: "Monthly",
    current_raised: 0,
    status: "coming_soon",
    opens_at: "2024-02-01T00:00:00Z",
  },
];

export default function InstitutionalDashboard() {
  const { accreditation, isVerified } = useAccreditation();
  const { account } = useInstitutionalAccount();
  const { manager } = useRelationshipManager();
  const [showScheduleCall, setShowScheduleCall] = useState(false);

  const stats = mockInstitutionalStats;

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              🏛️ Institutional Investor Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">
              Welcome back, {account?.entity_name || "Investor"}
            </p>
            <Badge className="bg-success/20 text-success border-success/30">
              <Lock className="w-3 h-3 mr-1" />
              Verified Accredited
            </Badge>
            {accreditation?.verified_at && (
              <span className="text-xs text-muted-foreground">
                Verified {format(new Date(accreditation.verified_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="font-bold text-lg text-foreground">{formatCurrency(stats.totalInvested)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">YTD Returns</p>
                  <p className="font-bold text-lg text-success">{formatCurrency(stats.ytdReturns)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blended IRR</p>
                  <p className="font-bold text-lg text-foreground">{stats.blendedIRR}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Exclusive Offerings</p>
                  <p className="font-bold text-lg text-foreground">{stats.exclusiveOfferings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exclusive Offerings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Exclusive Offerings
                </CardTitle>
                <Link to="/institutional/offerings">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockOfferings.map((offering) => (
                <div 
                  key={offering.id}
                  className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{offering.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Accred.
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Raise: {formatCurrency(offering.target_raise)}</span>
                        <span>Min: {formatCurrency(offering.minimum_investment)}</span>
                        <span>Target IRR: {offering.target_irr}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Hold: {offering.hold_period_years} years</span>
                        <span>Distributions: {offering.distribution_frequency}</span>
                      </div>
                    </div>
                    {offering.status === "open" && offering.closes_at && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Closes in</p>
                        <p className="font-semibold text-warning">{getDaysRemaining(offering.closes_at)} days</p>
                      </div>
                    )}
                  </div>

                  {offering.status === "open" && (
                    <>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {((offering.current_raised / offering.target_raise) * 100).toFixed(0)}% funded
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(offering.current_raised)} raised
                          </span>
                        </div>
                        <Progress value={(offering.current_raised / offering.target_raise) * 100} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/institutional/offering/${offering.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">View Details</Button>
                        </Link>
                        <Link to={`/institutional/subscribe/${offering.id}`} className="flex-1">
                          <Button className="w-full gap-2">
                            Invest Now <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}

                  {offering.status === "coming_soon" && (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Get Notified</Button>
                      <Link to={`/institutional/offering/${offering.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full">View Teaser</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Relationship Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Your Relationship Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={manager.photo_url || undefined} />
                  <AvatarFallback>{manager.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{manager.name}</h4>
                  <p className="text-sm text-muted-foreground">Senior Relationship Manager</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <a href={`mailto:${manager.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      {manager.email}
                    </a>
                    {manager.phone && (
                      <a href={`tel:${manager.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {manager.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setShowScheduleCall(true)}>
                    <Calendar className="w-4 h-4" />
                    Schedule Call
                  </Button>
                  <Button variant="secondary" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link to="/institutional/investments">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">My Investments</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/institutional/reports">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Reports & K-1s</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/institutional/entity">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Entity Setup</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/accreditation">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Accreditation</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>

      <BottomNav />

      {showScheduleCall && (
        <ScheduleCallModal 
          manager={manager} 
          onClose={() => setShowScheduleCall(false)} 
        />
      )}
    </div>
  );
}
