import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Shield, BadgeCheck, Crown, Headphones, TrendingUp,
  DollarSign, Briefcase, FileCheck, AlertCircle, CheckCircle2,
  Clock, ArrowRight, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAccreditation } from "@/hooks/useAccreditation";
import { AccreditationVerificationFlow } from "@/components/accreditation/AccreditationVerificationFlow";
import { format } from "date-fns";

const benefits = [
  { icon: Star, title: "Exclusive High-Yield Offerings", description: "Access deals with 15-25% target IRR" },
  { icon: TrendingUp, title: "Higher Investment Limits", description: "Invest up to $1M+ per offering" },
  { icon: Crown, title: "Early Access", description: "First look at new properties and funds" },
  { icon: DollarSign, title: "Lower Platform Fees", description: "Reduced fees for qualified investors" },
  { icon: Headphones, title: "Dedicated Relationship Manager", description: "Personal support for your investments" },
  { icon: Shield, title: "Priority Support", description: "Skip the queue with VIP support access" },
];

const qualificationCriteria = [
  {
    type: "income",
    title: "Income Test",
    icon: DollarSign,
    description: "$200K+ individual or $300K+ joint income for past 2 years",
    documents: "Tax returns, W-2s, or CPA letter",
  },
  {
    type: "net_worth",
    title: "Net Worth Test",
    icon: Building2,
    description: "$1M+ net worth excluding primary residence",
    documents: "Bank statements or CPA letter",
  },
  {
    type: "professional",
    title: "Professional",
    icon: Briefcase,
    description: "Series 7, 65, or 82 license holders",
    documents: "FINRA BrokerCheck verification",
  },
  {
    type: "entity",
    title: "Entity",
    icon: Building2,
    description: "Entity with $5M+ in assets",
    documents: "Financial statements, formation docs",
  },
];

export default function Accreditation() {
  const { accreditation, isLoading, isVerified, isPending, isExpired, isExpiringSoon } = useAccreditation();
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);

  const getStatusBadge = () => {
    if (isVerified) {
      return <Badge className="bg-success/20 text-success border-success/30">Verified Investor</Badge>;
    }
    if (isPending) {
      return <Badge className="bg-warning/20 text-warning border-warning/30">Pending Review</Badge>;
    }
    if (isExpired) {
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Expired</Badge>;
    }
    return <Badge variant="outline">Not Verified</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            🏛️ Accredited Investor Verification
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock exclusive investment opportunities reserved for qualified investors
          </p>
          {getStatusBadge()}
        </motion.div>

        {/* Status Section */}
        {isVerified && accreditation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground">Verified Accredited Investor</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Verification Type</p>
                        <p className="font-medium capitalize">{accreditation.accreditation_type.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Verified On</p>
                        <p className="font-medium">
                          {accreditation.verified_at 
                            ? format(new Date(accreditation.verified_at), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">
                          {accreditation.expires_at 
                            ? format(new Date(accreditation.expires_at), "MMM d, yyyy")
                            : "1 year from verification"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Investor Type</p>
                        <p className="font-medium capitalize">{accreditation.investor_type}</p>
                      </div>
                    </div>
                    <Link to="/exclusive-offerings">
                      <Button className="mt-4 gap-2">
                        View Exclusive Offerings
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Expiration Warning */}
        {isExpiringSoon && isVerified && (
          <Alert className="border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle>Verification Expiring Soon</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Your accreditation expires in less than 30 days. Re-verify to maintain access.</span>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setShowVerificationFlow(true)}>
                  Re-Verify Now
                </Button>
                <Button size="sm" variant="outline">
                  Remind Me Later
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Status */}
        {isPending && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Verification In Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Your accreditation documents are being reviewed. This typically takes 1-3 business days.
                    You'll receive an email once the review is complete.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reference: ACC-{accreditation?.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Exclusive Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Qualification Criteria */}
        {!isVerified && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Qualification Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You must meet at least one of the following criteria to qualify as an accredited investor:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {qualificationCriteria.map((criteria, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <criteria.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground">{criteria.title}</h4>
                      </div>
                      <p className="text-sm text-foreground mb-2">{criteria.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Documents needed:</span> {criteria.documents}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-center">
                  <Button size="lg" onClick={() => setShowVerificationFlow(true)} className="gap-2">
                    Start Verification
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Non-Verified Dashboard Widget */}
        {!isVerified && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <BadgeCheck className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Unlock Exclusive Offerings</h3>
                      <p className="text-sm text-muted-foreground">
                        Get verified to access high-yield investment opportunities
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowVerificationFlow(true)}>
                    Get Verified
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <BottomNav />

      {/* Verification Flow Modal */}
      <AnimatePresence>
        {showVerificationFlow && (
          <AccreditationVerificationFlow 
            onClose={() => setShowVerificationFlow(false)} 
            existingData={accreditation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
