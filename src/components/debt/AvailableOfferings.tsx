import { useState } from "react";
import { Mail, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvailableOfferingCard, SampleOffering } from "./AvailableOfferingCard";
import { toast } from "@/hooks/use-toast";

// Sample offerings data - in production, this would come from the database
const sampleOfferingsData: Record<string, SampleOffering[]> = {
  'litigation-funding': [
    {
      id: 'lit-1',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop',
      name: 'Apex Legal Funding Pool - Personal Injury Portfolio',
      sponsor: 'Apex Litigation Capital, LLC',
      offeringSize: 500000,
      minInvestment: 500,
      targetReturn: '28% APY',
      duration: '12-24 mo',
      fundedPercent: 65,
      status: 'funding',
    },
    {
      id: 'lit-2',
      image: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=400&h=200&fit=crop',
      name: 'Justice Recovery Fund II - Commercial Litigation',
      sponsor: 'Victory Legal Funding, LLC',
      offeringSize: 750000,
      minInvestment: 1000,
      targetReturn: '32% APY',
      duration: '18-36 mo',
      fundedPercent: 45,
      status: 'funding',
    },
  ],
  'credit-card-factoring': [
    {
      id: 'ccf-1',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
      name: 'Merchant Growth Fund - Q1 2026 Pool',
      sponsor: 'QuickFund Capital Partners',
      offeringSize: 250000,
      minInvestment: 250,
      targetReturn: '18% APY',
      duration: '8-12 mo',
      fundedPercent: 72,
      status: 'funding',
    },
  ],
  'invoice-factoring': [
    {
      id: 'inv-1',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=200&fit=crop',
      name: 'Commercial Receivables Fund - Manufacturing Sector',
      sponsor: 'Velocity Factoring Group',
      offeringSize: 1000000,
      minInvestment: 500,
      targetReturn: '14% APY',
      duration: '45 days',
      fundedPercent: 38,
      status: 'funding',
    },
  ],
  'tax-lien': [
    {
      id: 'tax-1',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=200&fit=crop',
      name: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
      sponsor: 'Desert Capital Tax Services',
      offeringSize: 400000,
      minInvestment: 500,
      targetReturn: '12% APY',
      duration: '14 mo avg',
      fundedPercent: 55,
      status: 'funding',
    },
  ],
  'second-trust-deed': [
    {
      id: 'std-1',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=200&fit=crop',
      name: 'Equity Access Fund - California Residential',
      sponsor: 'Pacific Trust Deed Investors',
      offeringSize: 300000,
      minInvestment: 1000,
      targetReturn: '9% APY',
      duration: '24 mo',
      fundedPercent: 80,
      status: 'funding',
    },
  ],
};

interface AvailableOfferingsProps {
  investmentSlug: string;
  investmentTitle: string;
}

export function AvailableOfferings({ investmentSlug, investmentTitle }: AvailableOfferingsProps) {
  const [email, setEmail] = useState('');
  const offerings = sampleOfferingsData[investmentSlug] || [];

  const handleNotify = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "You're on the list!",
      description: `We'll notify you when new ${investmentTitle} offerings become available.`,
    });
    setEmail('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Available Offerings
        </h3>
        {offerings.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {offerings.length} offering{offerings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {offerings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {offerings.map((offering) => (
            <AvailableOfferingCard key={offering.id} offering={offering} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold text-foreground mb-1">
            No active offerings at this time
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get notified when new {investmentTitle} opportunities become available.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNotify}>
              <Bell className="w-4 h-4 mr-1" />
              Notify Me
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
