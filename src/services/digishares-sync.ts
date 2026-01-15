import { supabase } from '@/integrations/supabase/client';

interface DigiSharesSyncRecord {
  digishares_sto_id: string | null;
}

export async function syncInvestmentToDigiShares(investment: {
  id: string;
  investment_type: string;
  investment_id: string;
  amount: number;
  user_id: string;
}) {
  console.log('Syncing to DigiShares:', investment);
  
  try {
    // Check if offering is already mapped to DigiShares
    const { data: syncRecord, error } = await supabase
      .from('digishares_sync' as any)
      .select('digishares_sto_id')
      .eq('investment_type', investment.investment_type)
      .eq('investment_id', investment.investment_id)
      .single();
    
    if (error) {
      console.log('No DigiShares sync record found:', error.message);
      return null;
    }
    
    const record = syncRecord as unknown as DigiSharesSyncRecord | null;
    
    if (record?.digishares_sto_id) {
      console.log('Found DigiShares STO:', record.digishares_sto_id);
      // TODO: Call DigiShares API to record investment
    } else {
      console.log('No DigiShares STO found for this offering');
    }
    
    return record;
  } catch (err) {
    console.error('DigiShares sync error:', err);
    return null;
  }
}

export function getMetaKey(investmentType: string, subType?: string): string {
  const typeMap: Record<string, string> = {
    real_estate: 'Equity_Real_Estate_',
    factor: 'Factor_Receivables_',
    lien: 'Lien_Secured_',
    safe: 'SAFE_'
  };
  
  const prefix = typeMap[investmentType] || 'Equity_Real_Estate_';
  return prefix + (subType || 'Default');
}
