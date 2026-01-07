import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getInvestmentTypeBySlug } from "@/data/investmentTypes";
import { ProcessFlow } from "@/components/debt/ProcessFlow";
import { ExampleOfferingCard } from "@/components/debt/ExampleOfferingCard";
import { AvailableOfferings } from "@/components/debt/AvailableOfferings";
import { BecomeSponsorCTA } from "@/components/debt/BecomeSponsorCTA";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const riskColors: Record<string, string> = {
  'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Low-Medium': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Medium-High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'High': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Varies': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function InvestmentTypeDetail() {
  const navigate = useNavigate();
  const { category, slug } = useParams<{ category: string; slug: string }>();
  
  const investment = getInvestmentTypeBySlug(slug || '');

  if (!investment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Investment Type Not Found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const categoryLabel = category === 'factor' ? 'Factor' : 'Lien';
  const categoryPath = `/explore/debt/${category}`;

  const breadcrumbItems = [
    { label: "Assets", href: "/assets" },
    { label: "Debt (Lend)", href: "/assets?type=debt" },
    { label: categoryLabel, href: categoryPath },
    { label: investment.title },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{investment.icon}</span>
              <h1 className="font-display text-xl font-bold text-foreground">
                {investment.title}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">{investment.subtitle}</p>
          </div>
        </div>
        <Breadcrumbs items={breadcrumbItems} />
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Hero section */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant="outline" 
              className={`${riskColors[investment.riskLevel] || riskColors['Medium']}`}
            >
              {investment.riskLevel} Risk
            </Badge>
            <Badge variant="outline" className="bg-secondary text-muted-foreground">
              {investment.investmentType}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-4">
            {investment.description}
          </p>

          {/* Key stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Typical Returns</p>
              <p className="text-lg font-bold text-primary">{investment.typicalReturns}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="text-sm font-bold text-foreground">{investment.typicalDuration}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-bold text-foreground">{investment.investmentType.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Available Offerings - NEW SECTION */}
        <AvailableOfferings 
          investmentSlug={investment.slug} 
          investmentTitle={investment.title} 
        />

        {/* Sponsor Role */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-2">
            Sponsor Role
          </h3>
          <p className="text-sm text-muted-foreground">
            {investment.sponsorRole}
          </p>
        </div>

        {/* How It Works */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">
            How It Works
          </h3>
          <ProcessFlow steps={investment.howItWorks} />
        </div>

        {/* Example Offering */}
        <div>
          <h3 className="font-display font-semibold text-foreground mb-4">
            Example Offering
          </h3>
          <ExampleOfferingCard offering={investment.exampleOffering} />
        </div>

        {/* Risk Disclosure */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="risk" className="glass-card rounded-2xl border-0 overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-foreground">Risk Disclosure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <p className="text-sm text-muted-foreground">
                {investment.riskDisclosure}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Become a Sponsor CTA */}
        <BecomeSponsorCTA investmentTitle={investment.title} />
      </main>
    </div>
  );
}
