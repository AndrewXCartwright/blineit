export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface SampleAsset {
  name: string;
  details: Record<string, string>;
}

export interface ExampleOffering {
  name: string;
  sponsor: string;
  offeringSize: number;
  tokenPrice: number;
  minimumInvestment: number;
  targetReturn: string;
  duration: string;
  details: Record<string, string>;
  sampleAsset: SampleAsset;
}

export interface InvestmentTypeData {
  id: string;
  slug: string;
  category: 'factor' | 'lien';
  title: string;
  subtitle: string;
  description: string;
  riskLevel: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High' | 'Varies';
  typicalReturns: string;
  typicalDuration: string;
  investmentType: string;
  sponsorRole: string;
  howItWorks: ProcessStep[];
  exampleOffering: ExampleOffering;
  riskDisclosure: string;
  icon: string;
}

export const factorInvestments: InvestmentTypeData[] = [
  {
    id: 'litigation-funding',
    slug: 'litigation-funding',
    category: 'factor',
    title: 'Litigation Funding',
    subtitle: 'Legal Case Financing',
    description: 'Fund legal case financing through Sponsors who specialize in pre-settlement and litigation advances.',
    riskLevel: 'High',
    typicalReturns: '20-40% annualized',
    typicalDuration: '6 months - 3+ years',
    investmentType: 'Alternative Debt',
    sponsorRole: 'Sponsor underwrites cases, manages legal relationships, and distributes proceeds upon settlement.',
    icon: '⚖️',
    howItWorks: [
      { step: 1, title: 'Sponsor Sources Cases', description: 'Sponsor partners with attorneys to identify strong personal injury, commercial litigation, or mass tort cases needing funding' },
      { step: 2, title: 'Sponsor Underwrites & Structures Deal', description: 'Sponsor evaluates case merits, expected settlement value, and timeline; structures investment terms' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering goes live; investors can purchase tokens representing fractional ownership of the funding pool' },
      { step: 4, title: 'Capital Deployed', description: 'Funds advanced to plaintiff/law firm for case expenses, living expenses, or operational costs' },
      { step: 5, title: 'Case Resolution', description: 'Case settles or goes to verdict; Sponsor manages collection from settlement proceeds' },
      { step: 6, title: 'Distribution to Investors', description: 'Principal + returns distributed proportionally to token holders' },
    ],
    exampleOffering: {
      name: 'Apex Legal Funding Pool - Personal Injury Portfolio',
      sponsor: 'Apex Litigation Capital, LLC',
      offeringSize: 500000,
      tokenPrice: 100,
      minimumInvestment: 500,
      targetReturn: '28% annualized',
      duration: '12-24 months',
      details: {
        'Tokens Available': '5,000',
        'Portfolio': '15-20 diversified personal injury cases',
        'Sponsor Fee': '20% of profits after investor principal returned',
      },
      sampleAsset: {
        name: 'Martinez v. ABC Trucking',
        details: {
          'Case Type': 'Commercial vehicle accident with clear liability',
          'Estimated Settlement': '$450,000',
          'Funding Provided': '$35,000 for medical liens and living expenses',
          'Expected Resolution': '14 months',
          'Projected Return': '32%',
        },
      },
    },
    riskDisclosure: 'Returns depend entirely on case outcomes. Cases can be lost, settled for less than expected, or take longer than anticipated. No guaranteed returns.',
  },
  {
    id: 'credit-card-factoring',
    slug: 'credit-card-factoring',
    category: 'factor',
    title: 'Credit Card Factoring',
    subtitle: 'Merchant Cash Advances',
    description: 'Invest in merchant credit card receivables through Sponsors who purchase and service merchant cash advances.',
    riskLevel: 'Medium',
    typicalReturns: '15-25% annualized',
    typicalDuration: '6-18 months',
    investmentType: 'Receivables Financing',
    sponsorRole: 'Sponsor acquires merchant accounts, processes daily remittances, and manages collections.',
    icon: '💳',
    howItWorks: [
      { step: 1, title: 'Sponsor Identifies Merchants', description: 'Sponsor sources small businesses needing working capital who process consistent credit card volume' },
      { step: 2, title: 'Underwriting & Approval', description: 'Sponsor reviews 6+ months of credit card processing statements, bank statements, and business performance' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering created; investors purchase tokens representing share of merchant cash advance pool' },
      { step: 4, title: 'Advance Funded to Merchant', description: 'Merchant receives lump sum (e.g., $50,000) in exchange for percentage of future credit card sales' },
      { step: 5, title: 'Daily Remittance Collection', description: "Sponsor's payment processor automatically withholds agreed percentage (e.g., 15%) of daily credit card sales" },
      { step: 6, title: 'Repayment Complete → Distribution', description: 'Once factor amount collected (e.g., $65,000), principal + returns distributed to token holders' },
    ],
    exampleOffering: {
      name: "Merchant Growth Fund - Q1 2026 Pool",
      sponsor: 'QuickFund Capital Partners',
      offeringSize: 250000,
      tokenPrice: 50,
      minimumInvestment: 250,
      targetReturn: '18% annualized',
      duration: '8-12 months',
      details: {
        'Tokens Available': '5,000',
        'Portfolio': '10-15 small business merchants',
        'Daily Holdback': '12-18% of credit card sales',
        'Sponsor Fee': '2% origination + 15% of profits',
      },
      sampleAsset: {
        name: "Tony's Italian Kitchen",
        details: {
          'Business Type': 'Family restaurant',
          'Monthly CC Sales': '$45,000',
          'Advance Amount': '$30,000',
          'Factor Rate': '1.32 (repays $39,600)',
          'Daily Holdback': '15% (~$225/day)',
          'Expected Payoff': '6 months',
          'Investor Return': '22% annualized',
        },
      },
    },
    riskDisclosure: 'Returns depend on merchant business performance. If sales decline or business closes, collection may be delayed or result in loss. Diversification across multiple merchants mitigates single-business risk.',
  },
  {
    id: 'invoice-factoring',
    slug: 'invoice-factoring',
    category: 'factor',
    title: 'Invoice Factoring',
    subtitle: 'B2B Receivables Financing',
    description: 'Fund business invoice purchases through Sponsors who buy receivables at a discount and collect at maturity.',
    riskLevel: 'Medium',
    typicalReturns: '12-20% annualized',
    typicalDuration: '30-120 days per invoice cycle',
    investmentType: 'Receivables Financing',
    sponsorRole: 'Sponsor verifies invoices, manages debtor relationships, and handles collections.',
    icon: '📋',
    howItWorks: [
      { step: 1, title: 'Sponsor Partners with Businesses', description: 'Sponsor establishes relationships with B2B companies that have creditworthy customers but need faster cash flow' },
      { step: 2, title: 'Invoice Verification', description: 'Business submits invoices; Sponsor verifies invoice is valid, goods/services delivered, and debtor is creditworthy' },
      { step: 3, title: 'Offering Pool Created', description: 'Tokenized offering pools multiple invoices together; investors purchase tokens for fractional ownership' },
      { step: 4, title: 'Advance Paid to Business', description: 'Sponsor advances 80-90% of invoice value to the business (e.g., $85,000 on a $100,000 invoice)' },
      { step: 5, title: 'Debtor Pays Invoice', description: "At invoice maturity (Net 30/60/90), debtor pays full invoice amount directly to Sponsor's lockbox" },
      { step: 6, title: 'Settlement & Distribution', description: 'Sponsor retains fee, remaining balance distributed: Business gets reserve minus fees, investors get returns' },
    ],
    exampleOffering: {
      name: 'Commercial Receivables Fund - Manufacturing Sector',
      sponsor: 'Velocity Factoring Group',
      offeringSize: 1000000,
      tokenPrice: 100,
      minimumInvestment: 500,
      targetReturn: '14% annualized',
      duration: '45 days average',
      details: {
        'Tokens Available': '10,000',
        'Average Invoice Term': '45 days',
        'Portfolio': '50-100 invoices from 8-12 manufacturers',
        'Debtor Credit Quality': 'Minimum BBB-rated or equivalent',
        'Sponsor Fee': '1.5% per invoice + 10% of spread',
      },
      sampleAsset: {
        name: 'Invoice #4521 - Precision Metal Works → General Motors',
        details: {
          'Invoice Amount': '$127,500 (auto parts shipment)',
          'Advance to Seller': '$108,375 (85%)',
          'Payment Terms': 'Net 45',
          'Debtor Credit Rating': 'A+',
          'Expected Collection': '42 days',
          'Investor Yield': '1.2% (≈ 10.4% annualized)',
        },
      },
    },
    riskDisclosure: 'Primary risk is debtor non-payment. Sponsor performs credit checks on all debtors. Invoice disputes or debtor bankruptcy can delay or reduce returns. Investment-grade debtors significantly reduce default risk.',
  },
  {
    id: 'other-factoring',
    slug: 'other-factoring',
    category: 'factor',
    title: 'Other Factoring',
    subtitle: 'Specialty Receivables',
    description: 'Additional factoring opportunities including purchase order financing, healthcare receivables, and specialty factoring.',
    riskLevel: 'Varies',
    typicalReturns: '12-30% annualized',
    typicalDuration: '30 days - 12 months',
    investmentType: 'Receivables Financing',
    sponsorRole: 'Sponsor specializes in specific factoring vertical and manages full lifecycle.',
    icon: '📦',
    howItWorks: [
      { step: 1, title: 'Sponsor Identifies Opportunity', description: 'Sponsor sources specialty receivables in their area of expertise (PO financing, healthcare, equipment)' },
      { step: 2, title: 'Due Diligence & Structuring', description: 'Sponsor performs specialized underwriting based on asset type and structures appropriate terms' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering created with clear terms; investors purchase tokens for fractional ownership' },
      { step: 4, title: 'Capital Deployed', description: 'Funds advanced against receivables, purchase orders, or other assets' },
      { step: 5, title: 'Collection & Management', description: 'Sponsor manages collection process specific to asset type' },
      { step: 6, title: 'Distribution to Investors', description: 'Principal + returns distributed upon successful collection' },
    ],
    exampleOffering: {
      name: 'PO Fulfillment Fund - Consumer Goods',
      sponsor: 'TradeFlow Capital',
      offeringSize: 750000,
      tokenPrice: 100,
      minimumInvestment: 1000,
      targetReturn: '24% annualized',
      duration: '60-120 days per PO cycle',
      details: {
        'Tokens Available': '7,500',
        'Focus': 'Purchase Order Financing',
        'Typical PO Size': '$100K - $500K',
        'Sponsor Fee': '3% origination + 20% of profits',
      },
      sampleAsset: {
        name: 'Consumer Electronics Manufacturer → Target PO',
        details: {
          'PO Value': '$2,000,000',
          'Funding Needed': '$400,000 (raw materials & production)',
          'Buyer': 'Target Corporation',
          'Expected Collection': '90 days from shipment',
          'Investor Return': '6% for 90 days (24% annualized)',
        },
      },
    },
    riskDisclosure: 'Returns vary significantly by asset type and sponsor expertise. Each specialty has unique risks. Healthcare claims may be denied; PO buyers may reject goods; equipment may depreciate. Thoroughly review each offering.',
  },
];

export const lienInvestments: InvestmentTypeData[] = [
  {
    id: 'tax-lien',
    slug: 'tax-lien',
    category: 'lien',
    title: 'Tax Lien',
    subtitle: 'Property Tax Certificates',
    description: 'Invest in tax lien certificates through Sponsors who acquire, manage, and resolve delinquent property tax positions.',
    riskLevel: 'Low-Medium',
    typicalReturns: '8-18% (state-mandated rates)',
    typicalDuration: '6 months - 3 years',
    investmentType: 'Government-Secured Debt',
    sponsorRole: 'Sponsor purchases liens at auction, manages redemption periods, and initiates foreclosure if necessary.',
    icon: '🏛️',
    howItWorks: [
      { step: 1, title: 'County Auctions Tax Liens', description: 'Property owner fails to pay property taxes; county places lien on property and auctions the lien to recover taxes' },
      { step: 2, title: 'Sponsor Acquires Liens at Auction', description: 'Sponsor bids on liens; wins liens at auction by either bidding lowest interest rate or highest premium (varies by state)' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering pools multiple tax liens; investors purchase tokens for fractional ownership' },
      { step: 4, title: 'Redemption Period Begins', description: 'Property owner has statutory period (6 months - 3 years) to pay delinquent taxes + interest to redeem property' },
      { step: 5, title: 'Property Owner Redeems (95%+)', description: 'Owner pays taxes + statutory interest (8-18% depending on state); Sponsor receives principal + interest' },
      { step: 6, title: 'Distribution to Investors', description: 'Principal + interest distributed proportionally to token holders' },
    ],
    exampleOffering: {
      name: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
      sponsor: 'Desert Capital Tax Services',
      offeringSize: 400000,
      tokenPrice: 100,
      minimumInvestment: 500,
      targetReturn: '12% annualized (after fees)',
      duration: '14 months average',
      details: {
        'Tokens Available': '4,000',
        'Statutory Interest Rate': '16% annually (Arizona rate)',
        'Redemption Period': '3 years (Arizona)',
        'Portfolio': '150-200 residential tax liens',
        'Sponsor Fee': '25% of interest earned',
      },
      sampleAsset: {
        name: 'Parcel #302-45-127 - Mesa, AZ',
        details: {
          'Property Type': 'Single-family home',
          'Property Value': '$285,000',
          'Delinquent Taxes': '$3,247',
          'Lien Purchase Price': '$3,247',
          'Statutory Interest': '16% per year',
          'Loan-to-Value': '1.1%',
          'If Redeemed in 12 months': '$3,247 + $519.52 = $3,766.52',
        },
      },
    },
    riskDisclosure: 'Tax liens are secured by real property with priority over mortgages. Primary risk is property value decline below lien amount (rare given low LTV). Some properties may have environmental or title issues discovered during foreclosure.',
  },
  {
    id: 'second-trust-deed',
    slug: 'second-trust-deed',
    category: 'lien',
    title: 'Second Trust Deed',
    subtitle: 'Junior Mortgage Positions',
    description: 'Fund junior lien positions on real property through Sponsors who originate and service second-position mortgages.',
    riskLevel: 'Medium-High',
    typicalReturns: '10-15% annually',
    typicalDuration: '12-36 months',
    investmentType: 'Real Estate Secured Debt',
    sponsorRole: 'Sponsor underwrites borrowers, services loans, and manages default/foreclosure proceedings.',
    icon: '🏡',
    howItWorks: [
      { step: 1, title: 'Borrower Needs Capital', description: 'Property owner with existing first mortgage needs additional funds (home improvement, debt consolidation, business capital)' },
      { step: 2, title: 'Sponsor Underwrites Loan', description: 'Sponsor evaluates property value, existing liens, borrower income/credit, and structures second position loan' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering created for single loan or pool; investors purchase tokens representing fractional note ownership' },
      { step: 4, title: 'Loan Funded & Recorded', description: 'Second trust deed recorded against property; borrower receives funds; monthly payment schedule begins' },
      { step: 5, title: 'Monthly Servicing', description: "Borrower makes monthly payments to Sponsor's servicing company; Sponsor distributes monthly/quarterly to investors" },
      { step: 6, title: 'Loan Paid Off at Maturity', description: 'Borrower refinances or pays off at term end; investors receive final principal distribution' },
    ],
    exampleOffering: {
      name: 'Equity Access Fund - California Residential',
      sponsor: 'Pacific Trust Deed Investors',
      offeringSize: 300000,
      tokenPrice: 100,
      minimumInvestment: 1000,
      targetReturn: '9% annually (paid monthly)',
      duration: '24 months',
      details: {
        'Tokens Available': '3,000',
        'Interest Rate to Borrower': '11.5%',
        'Loan Term': '24 months (interest-only, balloon)',
        'Maximum Combined LTV': '70%',
        'Portfolio': '3-5 individual second trust deeds',
        'Sponsor Fee': '2% origination + 2.5% annual servicing spread',
      },
      sampleAsset: {
        name: '1847 Oak Valley Dr, San Diego, CA',
        details: {
          'Property Value': '$925,000',
          'First Mortgage Balance': '$412,000 (44.5% LTV)',
          'Second Trust Deed': '$150,000',
          'Combined LTV': '60.8%',
          'Borrower Use of Funds': 'ADU construction',
          'Borrower FICO': '712',
          'Monthly Payment': '$1,437.50 (interest-only)',
          'Equity Cushion': '$363,000 (39.2%)',
        },
      },
    },
    riskDisclosure: 'Second position means first mortgage gets paid first in foreclosure. If property value declines significantly, second position may not be fully recovered. Sponsor\'s underwriting and LTV limits are critical protections.',
  },
  {
    id: 'other-liens',
    slug: 'other-liens',
    category: 'lien',
    title: 'Other Liens',
    subtitle: "Mechanic's, Judgment & UCC Liens",
    description: "Additional lien investment opportunities including mechanic's liens, judgment liens, and UCC fixture filings.",
    riskLevel: 'Varies',
    typicalReturns: '12-25% annualized',
    typicalDuration: '3-24 months',
    investmentType: 'Secured Debt',
    sponsorRole: 'Sponsor acquires lien positions, manages legal enforcement, and distributes proceeds upon resolution.',
    icon: '🔒',
    howItWorks: [
      { step: 1, title: 'Sponsor Identifies Lien Opportunity', description: 'Sponsor sources liens from contractors, judgment creditors, or equipment lenders who need immediate liquidity' },
      { step: 2, title: 'Lien Verification & Valuation', description: 'Sponsor verifies lien validity, priority position, and underlying collateral value' },
      { step: 3, title: 'Offering Listed on Platform', description: 'Tokenized offering created; investors purchase tokens for fractional ownership of lien pool' },
      { step: 4, title: 'Lien Acquired', description: 'Sponsor purchases lien at discount from original holder (typically 60-80% of face value)' },
      { step: 5, title: 'Enforcement & Collection', description: 'Sponsor uses legal tools (foreclosure, garnishment, asset seizure) to collect on the lien' },
      { step: 6, title: 'Distribution to Investors', description: 'Collected proceeds minus costs distributed proportionally to token holders' },
    ],
    exampleOffering: {
      name: 'Contractor Recovery Fund - Commercial Construction',
      sponsor: 'BuildSecure Capital',
      offeringSize: 500000,
      tokenPrice: 100,
      minimumInvestment: 1000,
      targetReturn: '20% annualized',
      duration: '6-18 months',
      details: {
        'Tokens Available': '5,000',
        'Lien Type': "Mechanic's Liens",
        'Focus': 'Commercial construction projects',
        'Typical Purchase Discount': '20-30% below face value',
        'Sponsor Fee': '30% of profits after principal',
      },
      sampleAsset: {
        name: "Mechanic's Lien - Downtown Office Renovation",
        details: {
          'Original Contractor Claim': '$85,000',
          'Work Completed': 'HVAC installation on commercial building',
          'Property Value': '$2,400,000',
          'Lien Purchase Price': '$68,000 (80%)',
          'Expected Recovery': '$85,000 + interest',
          'Collection Method': 'Settlement or foreclosure action',
          'Investor Return': '25% (if collected in 12 months)',
        },
      },
    },
    riskDisclosure: 'Lien priority and enforceability vary significantly. Some liens may be disputed or subordinate to other claims. Collection timelines are unpredictable. Legal costs may reduce returns. Thoroughly review each offering.',
  },
];

export const getAllInvestmentTypes = (): InvestmentTypeData[] => {
  return [...factorInvestments, ...lienInvestments];
};

export const getInvestmentTypeBySlug = (slug: string): InvestmentTypeData | undefined => {
  return getAllInvestmentTypes().find(type => type.slug === slug);
};

export const getInvestmentTypesByCategory = (category: 'factor' | 'lien'): InvestmentTypeData[] => {
  return category === 'factor' ? factorInvestments : lienInvestments;
};
