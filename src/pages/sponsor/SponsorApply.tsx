import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const propertyTypes = [
  "Multifamily",
  "Commercial",
  "Industrial",
  "Retail",
  "Mixed-Use",
  "Land",
  "Single Family",
  "Hotel",
];

export default function SponsorApply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: user?.email || "",
    phone: "",
    propertyTypes: [] as string[],
    estimatedPortfolioValue: "",
    investmentStrategy: "",
  });

  const handlePropertyTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit an application");
      navigate("/auth");
      return;
    }

    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.propertyTypes.length === 0) {
      toast.error("Please select at least one property type");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("sponsor_applications").insert({
        user_id: user.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone || null,
        property_types: formData.propertyTypes,
        estimated_portfolio_value: formData.estimatedPortfolioValue
          ? parseFloat(formData.estimatedPortfolioValue.replace(/[^0-9.]/g, ""))
          : null,
        investment_strategy: formData.investmentStrategy || null,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-6 pb-24 max-w-2xl mx-auto">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in becoming a sponsor on B-LINE-IT. We'll review your
                application and get back to you within 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/")} variant="outline">
                  Return Home
                </Button>
                <Button onClick={() => navigate("/sponsor")}>
                  Back to Sponsor Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 pb-24 max-w-2xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/sponsor")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sponsor Portal
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Apply to Become a Sponsor</CardTitle>
            <CardDescription>
              Tell us about your company and investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company/Entity Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              {/* Property Types */}
              <div className="space-y-3">
                <Label>Type of Properties (select all that apply) *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {propertyTypes.map((type) => (
                    <div
                      key={type}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.propertyTypes.includes(type)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handlePropertyTypeToggle(type)}
                    >
                      <Checkbox
                        checked={formData.propertyTypes.includes(type)}
                        onCheckedChange={() => handlePropertyTypeToggle(type)}
                      />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Value */}
              <div>
                <Label htmlFor="portfolioValue">Estimated Portfolio Value</Label>
                <Input
                  id="portfolioValue"
                  value={formData.estimatedPortfolioValue}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedPortfolioValue: e.target.value })
                  }
                  placeholder="$10,000,000"
                />
              </div>

              {/* Investment Strategy */}
              <div>
                <Label htmlFor="strategy">Brief Description of Investment Strategy</Label>
                <Textarea
                  id="strategy"
                  value={formData.investmentStrategy}
                  onChange={(e) => setFormData({ ...formData, investmentStrategy: e.target.value })}
                  placeholder="Tell us about your investment approach, target markets, and track record..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting this application, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
