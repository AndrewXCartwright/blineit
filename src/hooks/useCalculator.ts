import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EquityInputs {
  investmentAmount: number;
  apy: number;
  appreciationRate: number;
  holdPeriod: number;
  reinvestDividends: boolean;
  propertyId?: string;
}

export interface EquityResults {
  totalDividends: number;
  totalAppreciation: number;
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  yearlyBreakdown: Array<{
    year: number;
    startValue: number;
    dividends: number;
    appreciation: number;
    endValue: number;
  }>;
}

export interface DebtInputs {
  investmentAmount: number;
  apy: number;
  termMonths: number;
  paymentFrequency: 'monthly' | 'quarterly';
  loanId?: string;
}

export interface DebtResults {
  monthlyPayment: number;
  totalInterest: number;
  totalAtMaturity: number;
  paymentSchedule: Array<{
    month: number;
    payment: number;
    cumulative: number;
  }>;
}

export interface PredictionInputs {
  betAmount: number;
  position: 'BULL' | 'BEAR';
  bullOdds: number;
  bearOdds: number;
  marketId?: string;
}

export interface PredictionResults {
  shares: number;
  winPayout: number;
  winProfit: number;
  winReturn: number;
  lossPayout: number;
  lossAmount: number;
}

export interface PortfolioInputs {
  totalBudget: number;
  equityAllocation: number;
  debtAllocation: number;
  predictionAllocation: number;
  equityApy: number;
  debtApy: number;
  holdPeriod: number;
}

export interface PortfolioResults {
  equityAmount: number;
  debtAmount: number;
  predictionAmount: number;
  blendedApy: number;
  totalDividends: number;
  totalAppreciation: number;
  finalValue: number;
  totalReturn: number;
  monthlyIncome: number;
  annualIncome: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CompoundInputs {
  initialInvestment: number;
  monthlyContribution: number;
  apy: number;
  years: number;
}

export interface CompoundResults {
  withReinvestment: number;
  withoutReinvestment: number;
  reinvestmentBonus: number;
  yearlyBreakdown: Array<{
    year: number;
    contributions: number;
    dividends: number;
    compoundValue: number;
    simpleValue: number;
    difference: number;
  }>;
  milestones: Array<{
    amount: number;
    withReinvestmentYears: number;
    withoutReinvestmentYears: number;
  }>;
}

export function useEquityCalculator() {
  const [inputs, setInputs] = useState<EquityInputs>({
    investmentAmount: 10000,
    apy: 8.2,
    appreciationRate: 3.0,
    holdPeriod: 5,
    reinvestDividends: true,
  });
  const [results, setResults] = useState<EquityResults | null>(null);

  const calculate = useCallback(() => {
    const { investmentAmount, apy, appreciationRate, holdPeriod, reinvestDividends } = inputs;
    
    let currentValue = investmentAmount;
    let totalDividends = 0;
    let totalAppreciation = 0;
    const yearlyBreakdown = [];

    for (let year = 1; year <= holdPeriod; year++) {
      const startValue = currentValue;
      const dividends = currentValue * (apy / 100);
      const appreciation = currentValue * (appreciationRate / 100);
      
      totalDividends += dividends;
      totalAppreciation += appreciation;
      
      if (reinvestDividends) {
        currentValue += dividends + appreciation;
      } else {
        currentValue += appreciation;
      }

      yearlyBreakdown.push({
        year,
        startValue,
        dividends,
        appreciation,
        endValue: currentValue,
      });
    }

    const finalValue = reinvestDividends ? currentValue : currentValue + totalDividends;
    const totalReturn = ((finalValue - investmentAmount) / investmentAmount) * 100;
    const annualizedReturn = (Math.pow(finalValue / investmentAmount, 1 / holdPeriod) - 1) * 100;

    setResults({
      totalDividends,
      totalAppreciation,
      finalValue,
      totalReturn,
      annualizedReturn,
      yearlyBreakdown,
    });
  }, [inputs]);

  return { inputs, setInputs, results, calculate };
}

export function useDebtCalculator() {
  const [inputs, setInputs] = useState<DebtInputs>({
    investmentAmount: 10000,
    apy: 10.5,
    termMonths: 18,
    paymentFrequency: 'monthly',
  });
  const [results, setResults] = useState<DebtResults | null>(null);

  const calculate = useCallback(() => {
    const { investmentAmount, apy, termMonths, paymentFrequency } = inputs;
    
    const periodsPerYear = paymentFrequency === 'monthly' ? 12 : 4;
    const periodRate = apy / 100 / periodsPerYear;
    const numberOfPayments = paymentFrequency === 'monthly' ? termMonths : Math.ceil(termMonths / 3);
    const monthlyPayment = investmentAmount * periodRate;
    const totalInterest = monthlyPayment * numberOfPayments;

    const paymentSchedule = [];
    let cumulative = 0;
    
    for (let i = 1; i <= numberOfPayments; i++) {
      cumulative += monthlyPayment;
      paymentSchedule.push({
        month: paymentFrequency === 'monthly' ? i : i * 3,
        payment: monthlyPayment,
        cumulative,
      });
    }

    setResults({
      monthlyPayment,
      totalInterest,
      totalAtMaturity: investmentAmount + totalInterest,
      paymentSchedule,
    });
  }, [inputs]);

  return { inputs, setInputs, results, calculate };
}

export function usePredictionCalculator() {
  const [inputs, setInputs] = useState<PredictionInputs>({
    betAmount: 100,
    position: 'BULL',
    bullOdds: 65,
    bearOdds: 35,
  });
  const [results, setResults] = useState<PredictionResults | null>(null);

  const calculate = useCallback(() => {
    const { betAmount, position, bullOdds, bearOdds } = inputs;
    
    const odds = position === 'BULL' ? bullOdds : bearOdds;
    const shares = betAmount / (odds / 100);
    const winPayout = shares;
    const winProfit = winPayout - betAmount;
    const winReturn = (winProfit / betAmount) * 100;

    setResults({
      shares,
      winPayout,
      winProfit,
      winReturn,
      lossPayout: 0,
      lossAmount: betAmount,
    });
  }, [inputs]);

  return { inputs, setInputs, results, calculate };
}

export function usePortfolioCalculator() {
  const [inputs, setInputs] = useState<PortfolioInputs>({
    totalBudget: 50000,
    equityAllocation: 60,
    debtAllocation: 30,
    predictionAllocation: 10,
    equityApy: 8.0,
    debtApy: 10.5,
    holdPeriod: 5,
  });
  const [results, setResults] = useState<PortfolioResults | null>(null);

  const calculate = useCallback(() => {
    const { totalBudget, equityAllocation, debtAllocation, predictionAllocation, equityApy, debtApy, holdPeriod } = inputs;
    
    const equityAmount = totalBudget * (equityAllocation / 100);
    const debtAmount = totalBudget * (debtAllocation / 100);
    const predictionAmount = totalBudget * (predictionAllocation / 100);

    const blendedApy = (equityAllocation * equityApy + debtAllocation * debtApy) / (equityAllocation + debtAllocation);
    
    const totalDividends = (equityAmount * (equityApy / 100) + debtAmount * (debtApy / 100)) * holdPeriod;
    const totalAppreciation = equityAmount * 0.03 * holdPeriod;
    const finalValue = totalBudget + totalDividends + totalAppreciation;
    const totalReturn = ((finalValue - totalBudget) / totalBudget) * 100;
    
    const annualIncome = equityAmount * (equityApy / 100) + debtAmount * (debtApy / 100);
    const monthlyIncome = annualIncome / 12;

    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (predictionAllocation > 20) riskLevel = 'high';
    else if (predictionAllocation <= 5 && debtAllocation >= 50) riskLevel = 'low';

    setResults({
      equityAmount,
      debtAmount,
      predictionAmount,
      blendedApy,
      totalDividends,
      totalAppreciation,
      finalValue,
      totalReturn,
      monthlyIncome,
      annualIncome,
      riskLevel,
    });
  }, [inputs]);

  return { inputs, setInputs, results, calculate };
}

export function useCompoundCalculator() {
  const [inputs, setInputs] = useState<CompoundInputs>({
    initialInvestment: 10000,
    monthlyContribution: 500,
    apy: 8.0,
    years: 10,
  });
  const [results, setResults] = useState<CompoundResults | null>(null);

  const calculate = useCallback(() => {
    const { initialInvestment, monthlyContribution, apy, years } = inputs;
    
    const annualContribution = monthlyContribution * 12;
    const rate = apy / 100;
    
    let compoundValue = initialInvestment;
    let simpleValue = initialInvestment;
    let totalContributions = initialInvestment;
    
    const yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      totalContributions += annualContribution;
      
      // Compound: reinvest dividends
      const compoundDividends = compoundValue * rate;
      compoundValue = compoundValue + annualContribution + compoundDividends;
      
      // Simple: don't reinvest
      const simpleDividends = simpleValue * rate;
      simpleValue = simpleValue + annualContribution;
      
      yearlyBreakdown.push({
        year,
        contributions: annualContribution,
        dividends: compoundDividends,
        compoundValue,
        simpleValue: simpleValue + (simpleDividends * year),
        difference: compoundValue - (simpleValue + (simpleDividends * year)),
      });
    }

    const withReinvestment = compoundValue;
    const withoutReinvestment = simpleValue + (initialInvestment * rate * years);
    const reinvestmentBonus = withReinvestment - withoutReinvestment;

    // Calculate milestones
    const milestones = [25000, 50000, 100000, 250000].map(amount => {
      let yearsWithReinvest = 0;
      let yearsWithoutReinvest = 0;
      let cv = initialInvestment;
      let sv = initialInvestment;
      
      for (let y = 1; y <= 50; y++) {
        cv = cv * (1 + rate) + annualContribution;
        sv = sv + annualContribution + (initialInvestment * rate);
        
        if (cv >= amount && yearsWithReinvest === 0) yearsWithReinvest = y;
        if (sv >= amount && yearsWithoutReinvest === 0) yearsWithoutReinvest = y;
        
        if (yearsWithReinvest > 0 && yearsWithoutReinvest > 0) break;
      }
      
      return {
        amount,
        withReinvestmentYears: yearsWithReinvest || 50,
        withoutReinvestmentYears: yearsWithoutReinvest || 50,
      };
    });

    setResults({
      withReinvestment,
      withoutReinvestment,
      reinvestmentBonus,
      yearlyBreakdown,
      milestones,
    });
  }, [inputs]);

  return { inputs, setInputs, results, calculate };
}

export function useSaveCalculation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveCalculation = async (
    name: string,
    calculatorType: string,
    inputs: object,
    results: object,
    propertyId?: string,
    loanId?: string
  ) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save calculations',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_calculations')
        .insert([{
          user_id: user.id,
          name,
          calculator_type: calculatorType,
          inputs: inputs as any,
          results: results as any,
          property_id: propertyId,
          loan_id: loanId,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Calculation saved',
        description: 'Your calculation has been saved successfully',
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save calculation',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { saveCalculation, loading };
}

export function useSavedCalculations() {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalculations = useCallback(async () => {
    if (!user) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCalculations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting calculation:', error);
    }
  };

  return { calculations, loading, fetchCalculations, deleteCalculation };
}
