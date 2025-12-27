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
  let baseValue = 100000;
  
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
    income: 800 + Math.random() * 600
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
        today: { value: 3012, percent: 2.4 },
        week: { value: 10845, percent: 8.7 },
        month: { value: 12456, percent: 10.8 },
        ytd: { value: 25123, percent: 24.5 },
        allTime: { value: 27845, percent: 27.8 }
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
  { id: '1', name: 'Sunset Apartments', type: 'property', currentValue: 31125, costBasis: 27500, pnl: 3625, pnlPercent: 13.2, tokens: 250, apy: 8.2 },
  { id: '2', name: 'Marina Heights', type: 'property', currentValue: 18720, costBasis: 16200, pnl: 2520, pnlPercent: 15.6, tokens: 150, apy: 7.8 },
  { id: '3', name: 'Downtown Tower', type: 'property', currentValue: 18605, costBasis: 20000, pnl: -1395, pnlPercent: -7.0, tokens: 160, apy: 9.1 },
  { id: '4', name: 'Bridge Loan - Austin', type: 'loan', currentValue: 10875, costBasis: 10000, pnl: 875, pnlPercent: 8.8, apy: 10.5 },
  { id: '5', name: 'Construction Loan - Miami', type: 'loan', currentValue: 10650, costBasis: 10000, pnl: 650, pnlPercent: 6.5, apy: 12.0 },
  { id: '6', name: 'BULL - Miami Sale', type: 'prediction', currentValue: 2450, costBasis: 2000, pnl: 450, pnlPercent: 22.5 },
  { id: '7', name: 'BEAR - Phoenix Index', type: 'prediction', currentValue: 1845, costBasis: 2500, pnl: -655, pnlPercent: -26.2 }
];

export const useIncomeAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['income-analytics', user?.id],
    queryFn: async () => {
      const monthlyIncome = generateMockMonthlyIncome();
      
      const breakdown: IncomeBreakdown = {
        propertyDividends: 745,
        loanInterest: 387.50,
        predictionWinnings: 112.50,
        total: 1245
      };
      
      return {
        monthlyIncome,
        breakdown,
        projectedAnnual: breakdown.total * 12,
        effectiveYield: 11.7
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
  totalBets: 24,
  wins: 16,
  netPnl: 2450,
  bullWinRate: 72,
  bearWinRate: 58,
  recentBets: [
    { id: '1', position: 'YES', market: { title: '123 Main Miami' }, is_settled: true, payout: 246, amount: 100 },
    { id: '2', position: 'NO', market: { title: 'Phoenix Q4' }, is_settled: true, payout: 0, amount: 180 },
    { id: '3', position: 'YES', market: { title: 'Austin Permits' }, is_settled: true, payout: 312, amount: 100 },
    { id: '4', position: 'YES', market: { title: 'Miami Index' }, is_settled: true, payout: 189, amount: 80 }
  ]
});

export const usePortfolioAllocation = () => {
  const { data: snapshots } = usePortfolioSnapshots(1);
  
  const latest = snapshots?.[snapshots.length - 1];
  
  if (!latest) {
    return {
      data: [
        { name: 'Equity', value: 68450, color: 'hsl(var(--chart-1))' },
        { name: 'Debt', value: 42300, color: 'hsl(var(--chart-2))' },
        { name: 'Predictions', value: 9845, color: 'hsl(var(--chart-3))' },
        { name: 'Cash', value: 7250, color: 'hsl(var(--chart-4))' }
      ],
      total: 127845
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
