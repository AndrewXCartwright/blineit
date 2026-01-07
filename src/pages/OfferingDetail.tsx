import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, TrendingUp, DollarSign, AlertTriangle, FileText, Building2, Info, Shield, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Breadcrumbs from "@/components/Breadcrumbs";

// Sample offerings data
const sampleOfferingsData: Record<string, {
  id: string;
  name: string;
  sponsor: string;
  sponsorDescription: string;
  image: string;
  offeringSize: number;
  minInvestment: number;
  tokenPrice: number;
  targetReturn: string;
  duration: string;
  fundedPercent: number;
  investors: number;
  status: 'funding' | 'coming_soon' | 'closed';
  type: string;
  category: 'factor' | 'lien';
  slug: string;
  description: string;
  investmentThesis: string;
  useOfFunds: string;
  assetDetails: { label: string; value: string }[];
  portfolioExamples: { description: string; detail1: string; detail2: string }[];
  documents: { name: string; type: string }[];
  risks: string[];
  daysRemaining: number;
}> = {
  'tax-1': {
    id: 'tax-1',
    name: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
    sponsor: 'Desert Capital Tax Services',
    sponsorDescription: 'Desert Capital Tax Services is a Phoenix-based tax lien investment firm with over 15 years of experience acquiring and managing tax lien certificates across the Southwest. Our team has processed over 10,000 liens with a 98% successful redemption or acquisition rate.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop',
    offeringSize: 400000,
    minInvestment: 500,
    tokenPrice: 100,
    targetReturn: '12% APY',
    duration: '6-36 months (avg 14 mo)',
    fundedPercent: 65,
    investors: 47,
    status: 'funding',
    type: 'Tax Lien',
    category: 'lien',
    slug: 'tax-lien',
    description: 'Invest in a diversified portfolio of Arizona residential tax lien certificates. Arizona offers one of the highest statutory interest rates in the country at 16% annually. Our experienced team acquires liens at county auctions, manages the redemption process, and handles any necessary foreclosure proceedings.',
    investmentThesis: 'Arizona tax liens offer attractive risk-adjusted returns due to the state\'s 16% statutory interest rate and 3-year redemption period. Property owners have strong incentive to redeem, and in cases of non-redemption, we acquire properties at significant discounts to market value.',
    useOfFunds: 'Proceeds will be used to acquire 150-200 residential tax lien certificates at upcoming Maricopa and Pima County auctions. Administrative costs, legal reserves, and platform fees are covered by the spread between the 16% statutory rate and the 12% investor return.',
    assetDetails: [
      { label: 'Portfolio Size', value: '150-200 residential tax liens' },
      { label: 'Location', value: 'Arizona (Maricopa, Pima counties)' },
      { label: 'Statutory Interest Rate', value: '16% annually' },
      { label: 'Redemption Period', value: '3 years' },
      { label: 'Average Lien Amount', value: '$2,500' },
      { label: 'Average Property Value', value: '$285,000' },
      { label: 'Average LTV', value: '0.9%' },
    ],
    portfolioExamples: [
      { description: 'Single Family - Mesa, AZ', detail1: 'Property Value: $310,000', detail2: 'Lien: $2,800 (0.9% LTV)' },
      { description: 'Single Family - Tucson, AZ', detail1: 'Property Value: $245,000', detail2: 'Lien: $2,100 (0.9% LTV)' },
      { description: 'Condo - Scottsdale, AZ', detail1: 'Property Value: $385,000', detail2: 'Lien: $3,200 (0.8% LTV)' },
      { description: 'Single Family - Phoenix, AZ', detail1: 'Property Value: $275,000', detail2: 'Lien: $2,400 (0.9% LTV)' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
      { name: 'Operating Agreement', type: 'PDF' },
      { name: 'Sample Portfolio Report', type: 'PDF' },
    ],
    risks: [
      'Property owners may not redeem, requiring foreclosure proceedings',
      'Foreclosed properties may have title issues or require remediation',
      'Changes to Arizona tax lien laws could affect returns',
      'Property values in the portfolio area may decline',
      'Duration is variable based on owner redemption timing',
    ],
    daysRemaining: 23,
  },
  'std-1': {
    id: 'std-1',
    name: 'Equity Access Fund - California Residential',
    sponsor: 'Pacific Trust Deed Investors',
    sponsorDescription: 'Pacific Trust Deed Investors is a licensed California mortgage broker specializing in second trust deed investments since 2008. We have originated over $500M in residential bridge loans with a historical default rate under 2%.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop',
    offeringSize: 300000,
    minInvestment: 1000,
    tokenPrice: 100,
    targetReturn: '9% APY',
    duration: '24 months',
    fundedPercent: 80,
    investors: 28,
    status: 'funding',
    type: 'Second Trust Deed',
    category: 'lien',
    slug: 'second-trust-deed',
    description: 'Fund junior lien positions on California residential properties. All loans are underwritten to a maximum 70% combined loan-to-value, providing significant equity cushion protection. Monthly interest payments distributed to token holders.',
    investmentThesis: 'California residential real estate remains in high demand with limited supply. Our conservative underwriting standards ensure substantial equity protection, while the junior lien structure allows for attractive interest rates compared to first mortgages.',
    useOfFunds: 'Proceeds will fund 3-5 second trust deed loans on California residential properties. Target borrowers are homeowners seeking bridge financing for renovations, debt consolidation, or business purposes.',
    assetDetails: [
      { label: 'Portfolio Size', value: '3-5 residential second mortgages' },
      { label: 'Location', value: 'California (Los Angeles, San Diego)' },
      { label: 'Max Combined LTV', value: '70%' },
      { label: 'Interest Rate', value: '10-12% (borrower pays)' },
      { label: 'Loan Term', value: '12-24 months' },
      { label: 'Min Borrower FICO', value: '650+' },
    ],
    portfolioExamples: [
      { description: 'Single Family - San Diego, CA', detail1: 'Property: $850,000, 1st: $450,000', detail2: '2nd: $100,000, Combined LTV: 65%' },
      { description: 'Single Family - Los Angeles, CA', detail1: 'Property: $1,200,000, 1st: $600,000', detail2: '2nd: $150,000, Combined LTV: 63%' },
      { description: 'Condo - Orange County, CA', detail1: 'Property: $650,000, 1st: $350,000', detail2: '2nd: $80,000, Combined LTV: 66%' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
      { name: 'Sample Loan Package', type: 'PDF' },
    ],
    risks: [
      'Second lien position means higher loss severity in default',
      'California real estate market corrections could erode equity cushion',
      'Borrower defaults may require lengthy foreclosure process',
      'Interest rate changes may affect borrower ability to refinance',
    ],
    daysRemaining: 15,
  },
  'lit-1': {
    id: 'lit-1',
    name: 'Apex Legal Funding Pool - Personal Injury Portfolio',
    sponsor: 'Apex Litigation Capital, LLC',
    sponsorDescription: 'Apex Litigation Capital is a nationally licensed litigation funding company with a dedicated legal team that evaluates case merits before funding. Since 2015, we have funded over 2,500 cases with an 85% win/settlement rate.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop',
    offeringSize: 500000,
    minInvestment: 500,
    tokenPrice: 100,
    targetReturn: '28% APY',
    duration: '12-24 months',
    fundedPercent: 72,
    investors: 63,
    status: 'funding',
    type: 'Litigation Funding',
    category: 'factor',
    slug: 'litigation-funding',
    description: 'Invest in a diversified portfolio of pre-settlement legal funding advances. Our legal team evaluates case merits, liability, and expected settlement values before funding. Returns are generated when cases settle or reach verdict.',
    investmentThesis: 'Personal injury litigation funding offers uncorrelated returns to traditional markets. Our rigorous underwriting process and diversified portfolio of 15-20 cases minimizes individual case risk while capturing the attractive spreads in this specialized asset class.',
    useOfFunds: 'Proceeds will fund 15-20 pre-settlement advances to plaintiffs in personal injury cases. Funds provide living expenses while cases proceed through the legal system. Advances are repaid with returns when cases settle.',
    assetDetails: [
      { label: 'Portfolio Size', value: '15-20 personal injury cases' },
      { label: 'Case Types', value: 'Auto accidents, slip & fall, medical malpractice' },
      { label: 'Average Case Value', value: '$350,000' },
      { label: 'Average Funding per Case', value: '$25,000' },
      { label: 'Expected Resolution', value: '12-24 months' },
      { label: 'Historical Win Rate', value: '85%' },
    ],
    portfolioExamples: [
      { description: 'Auto Accident - Rear-end collision', detail1: 'Expected Settlement: $175,000', detail2: 'Funding Amount: $15,000' },
      { description: 'Slip & Fall - Commercial property', detail1: 'Expected Settlement: $250,000', detail2: 'Funding Amount: $20,000' },
      { description: 'Medical Malpractice - Surgical error', detail1: 'Expected Settlement: $500,000', detail2: 'Funding Amount: $40,000' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
      { name: 'Portfolio Guidelines', type: 'PDF' },
    ],
    risks: [
      'Cases may be lost, resulting in no recovery',
      'Settlement amounts may be lower than anticipated',
      'Cases may take longer than expected to resolve',
      'State regulations on litigation funding may change',
      'Attorney performance affects case outcomes',
    ],
    daysRemaining: 18,
  },
  'lit-2': {
    id: 'lit-2',
    name: 'Justice Recovery Fund II - Commercial Litigation',
    sponsor: 'Victory Legal Funding, LLC',
    sponsorDescription: 'Victory Legal Funding specializes in commercial litigation funding for business disputes. Our team of former attorneys evaluates case merits and works closely with litigation counsel to maximize outcomes.',
    image: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&h=400&fit=crop',
    offeringSize: 750000,
    minInvestment: 1000,
    tokenPrice: 100,
    targetReturn: '32% APY',
    duration: '18-36 months',
    fundedPercent: 45,
    investors: 34,
    status: 'funding',
    type: 'Litigation Funding',
    category: 'factor',
    slug: 'litigation-funding',
    description: 'Fund commercial litigation cases including breach of contract, intellectual property disputes, and business torts. Larger case values and longer durations with correspondingly higher return potential.',
    investmentThesis: 'Commercial litigation funding offers premium returns due to longer case durations and complexity. Our selective approach focuses on strong liability cases with substantial damages, funded only after extensive due diligence.',
    useOfFunds: 'Proceeds will fund 5-8 commercial litigation cases, covering legal costs, expert witnesses, and case development expenses. Returns are generated from settlement or verdict proceeds.',
    assetDetails: [
      { label: 'Portfolio Size', value: '5-8 commercial cases' },
      { label: 'Case Types', value: 'Breach of contract, IP disputes, business torts' },
      { label: 'Average Case Value', value: '$2,500,000' },
      { label: 'Average Funding per Case', value: '$100,000' },
      { label: 'Expected Resolution', value: '18-36 months' },
    ],
    portfolioExamples: [
      { description: 'Breach of Contract - Software licensing', detail1: 'Expected Recovery: $1.8M', detail2: 'Funding Amount: $80,000' },
      { description: 'Patent Infringement - Medical devices', detail1: 'Expected Recovery: $4.5M', detail2: 'Funding Amount: $200,000' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
    ],
    risks: [
      'Commercial cases are more complex with higher stakes',
      'Longer duration increases capital lock-up period',
      'Defendant solvency affects collection',
      'Appeals can extend timeline significantly',
    ],
    daysRemaining: 45,
  },
  'ccf-1': {
    id: 'ccf-1',
    name: 'Merchant Growth Fund - Q1 2026 Pool',
    sponsor: 'QuickFund Capital Partners',
    sponsorDescription: 'QuickFund Capital Partners is a merchant cash advance company serving small businesses since 2012. We have funded over $200M to 5,000+ merchants with daily payment collection technology ensuring consistent repayment.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    offeringSize: 250000,
    minInvestment: 250,
    tokenPrice: 50,
    targetReturn: '18% APY',
    duration: '8-12 months',
    fundedPercent: 58,
    investors: 89,
    status: 'funding',
    type: 'Credit Card Factoring',
    category: 'factor',
    slug: 'credit-card-factoring',
    description: 'Fund merchant cash advances to small businesses with consistent credit card sales volume. Daily remittance collection provides steady repayment. Portfolio diversified across restaurants, retail, and service businesses.',
    investmentThesis: 'Merchant cash advances provide working capital to small businesses based on their credit card processing volume. Daily payment collection from card sales provides consistent, predictable returns with short duration.',
    useOfFunds: 'Proceeds will fund 30-50 merchant cash advances ranging from $5,000 to $25,000 each. Target merchants include restaurants, retail stores, and service businesses with $15,000+ monthly card volume.',
    assetDetails: [
      { label: 'Portfolio Size', value: '30-50 merchant advances' },
      { label: 'Merchant Types', value: 'Restaurants, retail, service businesses' },
      { label: 'Average Advance', value: '$7,500' },
      { label: 'Factor Rate', value: '1.25-1.35' },
      { label: 'Daily Remittance', value: '10-15% of card sales' },
      { label: 'Min Monthly Volume', value: '$15,000 card sales' },
    ],
    portfolioExamples: [
      { description: 'Italian Restaurant - Brooklyn, NY', detail1: 'Monthly CC Volume: $45,000', detail2: 'Advance: $15,000, Factor: 1.28' },
      { description: 'Hair Salon - Miami, FL', detail1: 'Monthly CC Volume: $22,000', detail2: 'Advance: $8,000, Factor: 1.30' },
      { description: 'Auto Repair - Austin, TX', detail1: 'Monthly CC Volume: $35,000', detail2: 'Advance: $12,000, Factor: 1.26' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
      { name: 'Merchant Underwriting Standards', type: 'PDF' },
    ],
    risks: [
      'Merchant business failure results in advance losses',
      'Economic downturns affect small business viability',
      'Card processing changes could affect collection',
      'Regulatory changes to MCA industry possible',
    ],
    daysRemaining: 30,
  },
  'inv-1': {
    id: 'inv-1',
    name: 'Commercial Receivables Fund - Manufacturing Sector',
    sponsor: 'Velocity Factoring Group',
    sponsorDescription: 'Velocity Factoring Group specializes in B2B invoice factoring for manufacturers and distributors. Our 20-year track record includes $1B+ in factored receivables with losses under 0.5% annually.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop',
    offeringSize: 1000000,
    minInvestment: 500,
    tokenPrice: 100,
    targetReturn: '14% APY',
    duration: '45 days average',
    fundedPercent: 38,
    investors: 52,
    status: 'funding',
    type: 'Invoice Factoring',
    category: 'factor',
    slug: 'invoice-factoring',
    description: 'Invest in factored B2B invoices from established manufacturers. We purchase invoices at a discount and collect at maturity. Strong credit-quality debtors (the invoice payers) provide security.',
    investmentThesis: 'Invoice factoring offers low-risk, short-duration returns secured by accounts receivable from credit-worthy businesses. Our focus on manufacturing invoices with Fortune 1000 customers minimizes debtor default risk.',
    useOfFunds: 'Proceeds will be used to purchase B2B invoices from manufacturing clients at an average 3-5% discount. Collections occur within 30-60 days. The fund will maintain a revolving portfolio of $500K-1M in outstanding receivables.',
    assetDetails: [
      { label: 'Portfolio Type', value: 'Revolving receivables' },
      { label: 'Invoice Sources', value: 'Manufacturing, distribution' },
      { label: 'Average Invoice Size', value: '$25,000' },
      { label: 'Average Terms', value: 'Net 30-60' },
      { label: 'Debtor Quality', value: 'Fortune 1000 customers' },
      { label: 'Advance Rate', value: '85-90%' },
    ],
    portfolioExamples: [
      { description: 'Automotive Parts Manufacturer', detail1: 'Debtor: Major Auto OEM', detail2: 'Invoice: $85,000, Terms: Net 45' },
      { description: 'Industrial Equipment Supplier', detail1: 'Debtor: Fortune 500 Industrial', detail2: 'Invoice: $120,000, Terms: Net 30' },
      { description: 'Electronics Components', detail1: 'Debtor: Tech Manufacturing', detail2: 'Invoice: $45,000, Terms: Net 60' },
    ],
    documents: [
      { name: 'Offering Memorandum', type: 'PDF' },
      { name: 'Subscription Agreement', type: 'PDF' },
      { name: 'Credit Policy Guidelines', type: 'PDF' },
    ],
    risks: [
      'Debtor disputes could delay payment',
      'Debtor insolvency affects collection',
      'Fraudulent invoices are a industry risk',
      'Economic slowdown may increase delinquencies',
    ],
    daysRemaining: 60,
  },
};

export default function OfferingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  
  const offering = id ? sampleOfferingsData[id] : null;
  
  if (!offering) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-2">Offering Not Found</h1>
          <p className="text-muted-foreground mb-6">This offering may have been removed or the link is incorrect.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const fundedAmount = (offering.offeringSize * offering.fundedPercent) / 100;
  const remainingAmount = offering.offeringSize - fundedAmount;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate projected returns
  const returnRate = parseFloat(offering.targetReturn) / 100;
  const durationMonths = parseInt(offering.duration) || 12;
  const projectedReturn = investmentAmount * returnRate * (durationMonths / 12);
  const totalReturn = investmentAmount + projectedReturn;

  const breadcrumbItems = [
    { label: 'Assets', href: '/assets/explore' },
    { label: 'Debt', href: '/assets/explore' },
    { label: offering.category === 'factor' ? 'Factor' : 'Lien', href: `/explore/debt/${offering.category}` },
    { label: offering.type, href: `/explore/debt/${offering.category}/${offering.slug}` },
    { label: offering.name },
  ];

  const statusConfig = {
    funding: { label: 'FUNDING', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    coming_soon: { label: 'COMING SOON', className: 'bg-muted text-muted-foreground border-border' },
    closed: { label: 'CLOSED', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const riskBadgeConfig: Record<string, { label: string; className: string }> = {
    'Tax Lien': { label: 'Low-Medium Risk', className: 'bg-yellow-500/20 text-yellow-400' },
    'Second Trust Deed': { label: 'Medium-High Risk', className: 'bg-orange-500/20 text-orange-400' },
    'Litigation Funding': { label: 'High Risk', className: 'bg-red-500/20 text-red-400' },
    'Credit Card Factoring': { label: 'Medium Risk', className: 'bg-orange-500/20 text-orange-400' },
    'Invoice Factoring': { label: 'Low-Medium Risk', className: 'bg-yellow-500/20 text-yellow-400' },
  };

  const risk = riskBadgeConfig[offering.type] || { label: 'Varies', className: 'bg-muted text-muted-foreground' };
  const status = statusConfig[offering.status];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sample Offering Banner */}
      <div className="bg-blue-500/10 border-b border-blue-500/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-200 font-medium">Sample Offering</p>
            <p className="text-xs text-blue-300/70">This is an example showing how offerings appear on the platform. Investment is not currently available.</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 overflow-hidden">
          <img 
            src={offering.image} 
            alt={offering.name}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        </div>
        
        <div className="relative px-4 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Breadcrumbs items={breadcrumbItems} className="text-xs" />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            <Badge variant="outline" className={risk.className}>
              {risk.label}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">{offering.name}</h1>
          <button 
            className="text-sm text-primary hover:underline"
            onClick={() => navigate('/sponsors')}
          >
            {offering.sponsor}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Target Return</p>
              <p className="font-bold text-primary">{offering.targetReturn}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{offering.duration}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Investors</p>
              <p className="font-semibold text-foreground">{offering.investors}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Offering Size</p>
              <p className="font-bold text-foreground">{formatCurrency(offering.offeringSize)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Minimum Investment</p>
              <p className="font-bold text-foreground">{formatCurrency(offering.minInvestment)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="px-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(fundedAmount)} raised
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatCurrency(offering.offeringSize)}
              </span>
            </div>
            <Progress value={offering.fundedPercent} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{offering.fundedPercent}% funded</span>
              <span>{formatCurrency(remainingAmount)} remaining · {offering.daysRemaining} days left</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Calculator */}
      <div className="px-4 mb-6">
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Investment Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="pl-7"
                  min={offering.minInvestment}
                  step={offering.tokenPrice}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: {formatCurrency(offering.minInvestment)} · Token price: {formatCurrency(offering.tokenPrice)}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Investment</span>
                <span className="text-foreground">{formatCurrency(investmentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected Return ({durationMonths} mo @ {offering.targetReturn})</span>
                <span className="text-primary">+{formatCurrency(projectedReturn)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total Value</span>
                <span className="text-primary">{formatCurrency(totalReturn)}</span>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full" size="lg" disabled>
                  Invest {formatCurrency(investmentAmount)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a sample offering for demonstration purposes</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      {/* Overview */}
      <div className="px-4 mb-6 space-y-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Offering Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{offering.description}</p>
            
            <div>
              <h4 className="font-semibold text-foreground mb-1">Investment Thesis</h4>
              <p className="text-sm text-muted-foreground">{offering.investmentThesis}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-1">Use of Funds</h4>
              <p className="text-sm text-muted-foreground">{offering.useOfFunds}</p>
            </div>
          </CardContent>
        </Card>

        {/* Asset Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {offering.assetDetails.map((detail, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{detail.label}</span>
                  <span className="text-sm font-medium text-foreground">{detail.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Examples */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sample Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offering.portfolioExamples.map((example, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-3">
                  <p className="font-medium text-foreground mb-1">{example.description}</p>
                  <p className="text-xs text-muted-foreground">{example.detail1}</p>
                  <p className="text-xs text-muted-foreground">{example.detail2}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sponsor */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              About the Sponsor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{offering.sponsor}</p>
                <p className="text-xs text-muted-foreground">{offering.type} Specialist</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{offering.sponsorDescription}</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/sponsors')}>
              View Sponsor Profile
            </Button>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {offering.documents.map((doc, idx) => (
                <Button key={idx} variant="outline" className="w-full justify-start" disabled>
                  <FileText className="w-4 h-4 mr-2" />
                  {doc.name}
                  <Badge variant="secondary" className="ml-auto">{doc.type}</Badge>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Documents available for live offerings only
            </p>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="glass-card border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="specific-risks">
                <AccordionTrigger>Investment-Specific Risks</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {offering.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="general-risks">
                <AccordionTrigger>General Investment Risks</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      Investments in private offerings are illiquid and may not be sold or transferred
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      Past performance is not indicative of future results
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      You may lose some or all of your invested capital
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="platform-risks">
                <AccordionTrigger>Platform Risks</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      The platform facilitates investments but does not guarantee sponsor performance
                    </li>
                    <li className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      Regulatory changes may affect the availability of investment opportunities
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
