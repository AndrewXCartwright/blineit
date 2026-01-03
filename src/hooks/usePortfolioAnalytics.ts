import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PortfolioSnapshot {
  id: string;
  user_id: string;
  total_value: number;
  equity_value: number;
  debt_value: number;
  prediction_value: number;
  cash_balance: number;
  snapshot_date: string;
  created_at: string;
}

interface UserPerformance {
  id: string;
  user_id: string;
  period: string;
  period_start: string;
  starting_value: number;
  ending_value: number;
  deposits: number;
  withdrawals: number;
  dividends_earned: number;
  interest_earned: number;
  prediction_pnl: number;
  total_return: number;
  return_percentage: number;
  created_at: string;
}

interface HoldingPerformance {
  id: string;
  name: string;
  type: 'property' | 'loan' | 'prediction';
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  tokens?: number;
  apy?: number;
}

interface IncomeBreakdown {
  propertyDividends: number;
  loanInterest: number;
  predictionWinnings: number;
  total: number;
}

// Generate mock data for demo purposes
const generateMockSnapshots = (days: number): PortfolioSnapshot[] => {
  const snapshots: PortfolioSnapshot[] = [];
  const now = new Date();
  let baseValue = 140000000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate gradual growth with some volatility
    const dailyChange = (Math.random() - 0.4) * 0.02;
    baseValue = baseValue * (1 + dailyChange);
    
    const equityRatio = 0.53;
    const debtRatio = 0.33;
    const predictionRatio = 0.08;
    const cashRatio = 0.06;
    
    snapshots.push({
      id: `snapshot-${i}`,
      user_id: 'demo',
      total_value: baseValue,
      equity_value: baseValue * equityRatio,
      debt_value: baseValue * debtRatio,
      prediction_value: baseValue * predictionRatio,
      cash_balance: baseValue * cashRatio,
      snapshot_date: date.toISOString().split('T')[0],
      created_at: date.toISOString()
    });
  }
  
  return snapshots;
};

const generateMockMonthlyIncome = (): { month: string; income: number }[] => {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  return months.map(month => ({
    month,
    income: 850000 + Math.random() * 450000
  }));
};

export const usePortfolioSnapshots = (days: number = 30) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['portfolio-snapshots', user?.id, days],
    queryFn: async () => {
      if (!user?.id) return generateMockSnapshots(days);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await (supabase as any)
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });
      
      if (error || !data || data.length === 0) {
        return generateMockSnapshots(days);
      }
      
      return data as PortfolioSnapshot[];
    },
    enabled: true
  });
};

export const useUserPerformance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-performance', user?.id],
    queryFn: async () => {
      // Return mock performance data for demo
      return {
        today: { value: 3892450, percent: 2.7 },
        week: { value: 12845000, percent: 9.6 },
        month: { value: 18756000, percent: 14.6 },
        ytd: { value: 31250000, percent: 27.0 },
        allTime: { value: 42890000, percent: 41.1 }
      };
    }
  });
};

export const useHoldingsPerformance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['holdings-performance', user?.id],
    queryFn: async () => {
      // Fetch real holdings and calculate performance
      if (!user?.id) {
        return getMockHoldings();
      }
      
      const { data: holdings } = await supabase
        .from('user_holdings')
        .select('*, property:properties(*)')
        .eq('user_id', user.id);
      
      const { data: loanInvestments } = await supabase
        .from('user_loan_investments')
        .select('*, loan:loans(*)')
        .eq('user_id', user.id);
      
      const { data: bets } = await supabase
        .from('user_bets')
        .select('*, market:prediction_markets(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      const result: HoldingPerformance[] = [];
      
      // Process property holdings
      holdings?.forEach((h: any) => {
        if (h.property) {
          const currentValue = h.tokens * h.property.token_price;
          const costBasis = h.tokens * h.average_buy_price;
          const pnl = currentValue - costBasis;
          result.push({
            id: h.property.id,
            name: h.property.name,
            type: 'property',
            currentValue,
            costBasis,
            pnl,
            pnlPercent: costBasis > 0 ? (pnl / costBasis) * 100 : 0,
            tokens: h.tokens,
            apy: h.property.apy
          });
        }
      });
      
      // Process loan investments
      loanInvestments?.forEach((li: any) => {
        if (li.loan) {
          const currentValue = li.principal_invested + li.total_interest_earned;
          const costBasis = li.principal_invested;
          const pnl = li.total_interest_earned;
          result.push({
            id: li.loan.id,
            name: li.loan.name,
            type: 'loan',
            currentValue,
            costBasis,
            pnl,
            pnlPercent: costBasis > 0 ? (pnl / costBasis) * 100 : 0,
            apy: li.loan.apy
          });
        }
      });
      
      // Process prediction bets
      bets?.forEach((b: any) => {
        if (b.market) {
          const currentPrice = b.position === 'YES' ? b.market.yes_price : b.market.no_price;
          const currentValue = b.shares * (currentPrice / 100);
          const costBasis = b.amount;
          const pnl = currentValue - costBasis;
          result.push({
            id: b.market.id,
            name: `${b.position} - ${b.market.title || b.market.question}`,
            type: 'prediction',
            currentValue,
            costBasis,
            pnl,
            pnlPercent: costBasis > 0 ? (pnl / costBasis) * 100 : 0
          });
        }
      });
      
      return result.length > 0 ? result : getMockHoldings();
    }
  });
};

const getMockHoldings = (): HoldingPerformance[] => [
  { id: '1', name: 'Sunset Apartments', type: 'property', currentValue: 28500000, costBasis: 24200000, pnl: 4300000, pnlPercent: 17.8, tokens: 285000, apy: 8.2 },
  { id: '2', name: 'Marina Heights', type: 'property', currentValue: 22150000, costBasis: 19800000, pnl: 2350000, pnlPercent: 11.9, tokens: 221500, apy: 7.8 },
  { id: '3', name: 'Downtown Tower', type: 'property', currentValue: 18950000, costBasis: 21500000, pnl: -2550000, pnlPercent: -11.9, tokens: 189500, apy: 9.1 },
  { id: '4', name: 'Pacific View Plaza', type: 'property', currentValue: 15750000, costBasis: 14200000, pnl: 1550000, pnlPercent: 10.9, tokens: 157500, apy: 8.5 },
  { id: '5', name: 'Bridge Loan - Austin', type: 'loan', currentValue: 12875000, costBasis: 11500000, pnl: 1375000, pnlPercent: 12.0, apy: 10.5 },
  { id: '6', name: 'Construction Loan - Miami', type: 'loan', currentValue: 18650000, costBasis: 17200000, pnl: 1450000, pnlPercent: 8.4, apy: 12.0 },
  { id: '7', name: 'Development Loan - Denver', type: 'loan', currentValue: 14250000, costBasis: 13500000, pnl: 750000, pnlPercent: 5.6, apy: 11.2 },
  { id: '8', name: 'BULL - Miami Sale', type: 'prediction', currentValue: 4850000, costBasis: 3800000, pnl: 1050000, pnlPercent: 27.6 },
  { id: '9', name: 'BEAR - Phoenix Index', type: 'prediction', currentValue: 3245000, costBasis: 4200000, pnl: -955000, pnlPercent: -22.7 }
];

export const useIncomeAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['income-analytics', user?.id],
    queryFn: async () => {
      const monthlyIncome = generateMockMonthlyIncome();
      
      const breakdown: IncomeBreakdown = {
        propertyDividends: 745000,
        loanInterest: 387500,
        predictionWinnings: 112500,
        total: 1245000
      };
      
      return {
        monthlyIncome,
        breakdown,
        projectedAnnual: breakdown.total * 12,
        effectiveYield: 10.2
      };
    }
  });
};

export const usePredictionAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['prediction-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return getMockPredictionStats();
      }
      
      const { data: bets } = await supabase
        .from('user_bets')
        .select('*')
        .eq('user_id', user.id);
      
      if (!bets || bets.length === 0) {
        return getMockPredictionStats();
      }
      
      const settled = bets.filter(b => b.is_settled);
      const wins = settled.filter(b => (b.payout || 0) > b.amount);
      const totalPnl = settled.reduce((sum, b) => sum + ((b.payout || 0) - b.amount), 0);
      
      const bullBets = bets.filter(b => b.position === 'YES');
      const bearBets = bets.filter(b => b.position === 'NO');
      const bullWins = bullBets.filter(b => b.is_settled && (b.payout || 0) > b.amount);
      const bearWins = bearBets.filter(b => b.is_settled && (b.payout || 0) > b.amount);
      
      return {
        winRate: settled.length > 0 ? (wins.length / settled.length) * 100 : 0,
        totalBets: bets.length,
        wins: wins.length,
        netPnl: totalPnl,
        bullWinRate: bullBets.filter(b => b.is_settled).length > 0 
          ? (bullWins.length / bullBets.filter(b => b.is_settled).length) * 100 : 0,
        bearWinRate: bearBets.filter(b => b.is_settled).length > 0 
          ? (bearWins.length / bearBets.filter(b => b.is_settled).length) * 100 : 0,
        recentBets: bets.slice(0, 5)
      };
    }
  });
};

const getMockPredictionStats = () => ({
  winRate: 67,
  totalBets: 86,
  wins: 58,
  netPnl: 4850000,
  bullWinRate: 72,
  bearWinRate: 58,
  recentBets: [
    { id: '1', position: 'YES', market: { title: '123 Main Miami' }, is_settled: true, payout: 246000, amount: 100000 },
    { id: '2', position: 'NO', market: { title: 'Phoenix Q4' }, is_settled: true, payout: 0, amount: 180000 },
    { id: '3', position: 'YES', market: { title: 'Austin Permits' }, is_settled: true, payout: 312000, amount: 100000 },
    { id: '4', position: 'YES', market: { title: 'Miami Index' }, is_settled: true, payout: 189000, amount: 80000 }
  ]
});

export const usePortfolioAllocation = () => {
  const { data: snapshots } = usePortfolioSnapshots(1);
  
  const latest = snapshots?.[snapshots.length - 1];
  
  if (!latest) {
    return {
      data: [
        { name: 'Equity', value: 78045334, color: 'hsl(var(--chart-1))' },
        { name: 'Debt', value: 48594886, color: 'hsl(var(--chart-2))' },
        { name: 'Predictions', value: 11780578, color: 'hsl(var(--chart-3))' },
        { name: 'Cash', value: 8836433, color: 'hsl(var(--chart-4))' }
      ],
      total: 147257230
    };
  }
  
  return {
    data: [
      { name: 'Equity', value: latest.equity_value, color: 'hsl(var(--chart-1))' },
      { name: 'Debt', value: latest.debt_value, color: 'hsl(var(--chart-2))' },
      { name: 'Predictions', value: latest.prediction_value, color: 'hsl(var(--chart-3))' },
      { name: 'Cash', value: latest.cash_balance, color: 'hsl(var(--chart-4))' }
    ],
    total: latest.total_value
  };
};
