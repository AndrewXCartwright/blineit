import { ArrowLeft, FileText, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { factorInvestments } from "@/data/investmentTypes";
import { InvestmentTypeCard } from "@/components/debt/InvestmentTypeCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function DebtFactorCategory() {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Assets", href: "/assets" },
    { label: "Debt (Lend)", href: "/assets?type=debt" },
    { label: "Factor" },
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
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Factor Investments
            </h1>
            <p className="text-sm text-muted-foreground">
              Receivables & Factoring
            </p>
          </div>
        </div>
        <Breadcrumbs items={breadcrumbItems} />
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Category intro */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Receivables & Factoring
              </h2>
              <p className="text-sm text-muted-foreground">
                {factorInvestments.length} investment types
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Factor investments allow you to fund the purchase of various receivables and invoices. 
            Sponsors acquire these assets at a discount and collect at maturity, passing returns to investors.
            All investments are managed by specialized Sponsors who handle sourcing, underwriting, and collections.
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Typical Returns</p>
            <p className="text-lg font-bold text-primary">12-40%</p>
            <p className="text-xs text-muted-foreground">annualized</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-lg font-bold text-foreground">30 days</p>
            <p className="text-xs text-muted-foreground">to 3+ years</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <p className="text-lg font-bold text-yellow-400">Medium</p>
            <p className="text-xs text-muted-foreground">to High</p>
          </div>
        </div>

        {/* Investment types grid */}
        <div>
          <h3 className="font-display font-semibold text-foreground mb-4">
            Choose Investment Type
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {factorInvestments.map((investment) => (
              <InvestmentTypeCard key={investment.id} investment={investment} />
            ))}
          </div>
        </div>

        {/* Sponsor CTA */}
        <div className="glass-card rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-foreground">Are you a Sponsor?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Have factoring opportunities you'd like to list on our platform? 
            Learn about becoming a Sponsor and listing your offerings.
          </p>
          <Link
            to="/sponsor/register"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Learn about Sponsor packages →
          </Link>
        </div>
      </main>
    </div>
  );
}
