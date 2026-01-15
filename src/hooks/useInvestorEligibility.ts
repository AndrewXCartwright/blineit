import { useAuth } from '@/hooks/useAuth';
import { useKYC, type KYCStatus } from '@/hooks/useKYC';
import { useAccreditation, type VerificationStatus } from '@/hooks/useAccreditation';

export interface OfferingRequirements {
  requires_kyc: boolean;
  requires_accreditation: boolean;
  min_investment: number;
  max_investment?: number;
  allowed_countries?: string[];
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  nextStep?: 'kyc' | 'accreditation' | 'ready';
  checks: {
    kyc: boolean;
    accreditation: boolean;
    minInvestment: boolean;
  };
}

export function useInvestorEligibility() {
  const { user } = useAuth();
  const { kycStatus, isVerified: isKYCVerified } = useKYC();
  const { accreditation, isVerified: isAccreditationVerified } = useAccreditation();

  const checkEligibility = (
    requirements: OfferingRequirements,
    investmentAmount: number
  ): EligibilityResult => {
    // KYC check: passes if not required OR user is verified
    const kycPassed = !requirements.requires_kyc || isKYCVerified || kycStatus === 'verified';
    
    // Accreditation check: passes if not required OR user is verified
    // Also check if verification_method is self_certified for self-certified investors
    const accreditationPassed = !requirements.requires_accreditation || 
      isAccreditationVerified ||
      accreditation?.verification_method === 'self_certified';
    
    // Minimum investment check
    const minInvestmentPassed = investmentAmount >= requirements.min_investment;

    const checks = {
      kyc: kycPassed,
      accreditation: accreditationPassed,
      minInvestment: minInvestmentPassed,
    };

    const eligible = Object.values(checks).every(Boolean);
    
    let nextStep: 'kyc' | 'accreditation' | 'ready' = 'ready';
    let reason = '';
    
    if (!checks.kyc) {
      nextStep = 'kyc';
      reason = 'Identity verification required';
    } else if (!checks.accreditation) {
      nextStep = 'accreditation';
      reason = 'Accreditation verification required';
    } else if (!checks.minInvestment) {
      reason = `Minimum investment is $${requirements.min_investment.toLocaleString()}`;
    }

    return { eligible, reason, nextStep, checks };
  };

  const isLoggedIn = !!user;

  return { 
    checkEligibility, 
    isLoggedIn,
    kycStatus,
    isKYCVerified,
    accreditationStatus: accreditation?.verification_status,
    isAccreditationVerified,
  };
}
