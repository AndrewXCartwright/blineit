import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface InstitutionalAccount {
  id: string;
  user_id: string;
  entity_name: string;
  entity_type: "corporation" | "llc" | "partnership" | "trust" | "fund" | "family_office";
  ein: string | null;
  formation_state: string | null;
  formation_date: string | null;
  aum: number | null;
  authorized_signers: any[];
  compliance_contact: any;
  status: "pending" | "active" | "suspended";
  tier: "standard" | "premium" | "elite";
  created_at: string;
  updated_at: string;
}

export interface InstitutionalTransaction {
  id: string;
  institutional_account_id: string;
  offering_id: string;
  amount: number;
  shares_units: number;
  transaction_type: "subscription" | "redemption" | "distribution";
  status: "pending" | "processing" | "completed" | "failed";
  wire_reference: string | null;
  documents_signed: any[];
  created_at: string;
}

export interface RelationshipManager {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  calendar_link: string | null;
  assigned_accounts: any[];
  created_at: string;
}

export interface EntityFormData {
  entity_name: string;
  entity_type: string;
  ein?: string;
  formation_state?: string;
  formation_date?: string;
  aum?: number;
  authorized_signers?: any[];
  compliance_contact?: any;
}

// Mock data for demo
export const mockInstitutionalStats = {
  totalInvested: 2500000,
  ytdReturns: 285000,
  blendedIRR: 18.5,
  exclusiveOfferings: 4,
  totalDistributed: 425000,
  activePositions: 3,
};

export const mockInvestments = [
  {
    id: "1",
    name: "Manhattan Prime Office Tower",
    investedAmount: 500000,
    investedDate: "2023-06-15",
    currentValue: 542500,
    gainPercent: 8.5,
    distributionsYTD: 32500,
    irrToDate: 15.2,
    nextDistribution: 12500,
    nextDistributionDate: "2024-03-15",
    expectedExit: "2028-06-15",
  },
  {
    id: "2",
    name: "Diversified Real Estate Fund III",
    investedAmount: 1000000,
    investedDate: "2023-01-10",
    currentValue: 1125000,
    gainPercent: 12.5,
    distributionsYTD: 75000,
    irrToDate: 18.8,
    nextDistribution: 25000,
    nextDistributionDate: "2024-03-31",
    expectedExit: "2030-01-10",
  },
  {
    id: "3",
    name: "Austin Tech Campus Phase II",
    investedAmount: 1000000,
    investedDate: "2024-01-05",
    currentValue: 1000000,
    gainPercent: 0,
    distributionsYTD: 0,
    irrToDate: 0,
    nextDistribution: 0,
    expectedExit: "2027-12-31",
    completionPercent: 15,
    isDevelopment: true,
  },
];

export const mockPendingSubscriptions = [
  {
    id: "sub-1",
    offeringName: "Senior Bridge Loan Portfolio",
    amount: 250000,
    status: "awaiting_wire",
    submittedDate: "2024-01-20",
    wireDeadline: "2024-01-27",
  },
];

export const mockRelationshipManager: RelationshipManager = {
  id: "rm-1",
  name: "Sarah Chen",
  email: "sarah.chen@propvest.com",
  phone: "+1 (212) 555-0142",
  photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
  calendar_link: "https://calendly.com/sarah-chen",
  assigned_accounts: [],
  created_at: new Date().toISOString(),
};

export const mockQuarterlyReports = [
  { id: "q4-2023", quarter: "Q4 2023", fund: "Diversified Real Estate Fund III", postedDate: "2024-01-15" },
  { id: "q3-2023", quarter: "Q3 2023", fund: "Diversified Real Estate Fund III", postedDate: "2023-10-15" },
  { id: "q4-2023-office", quarter: "Q4 2023", fund: "Manhattan Prime Office Tower", postedDate: "2024-01-20" },
];

export const mockTaxDocuments = [
  { id: "k1-2023-fund", year: 2023, fund: "Diversified Real Estate Fund III", type: "K-1", status: "available" },
  { id: "k1-2023-office", year: 2023, fund: "Manhattan Prime Office Tower", type: "K-1", status: "pending" },
];

export const mockDistributions = [
  { id: "d1", date: "2024-01-15", fund: "Diversified Real Estate Fund III", amount: 25000 },
  { id: "d2", date: "2023-12-15", fund: "Manhattan Prime Office Tower", amount: 12500 },
  { id: "d3", date: "2023-10-15", fund: "Diversified Real Estate Fund III", amount: 25000 },
  { id: "d4", date: "2023-09-15", fund: "Manhattan Prime Office Tower", amount: 10000 },
];

export function useInstitutionalAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: account, isLoading } = useQuery({
    queryKey: ["institutional-account", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("institutional_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as InstitutionalAccount | null;
    },
    enabled: !!user?.id,
  });

  const createAccount = useMutation({
    mutationFn: async (formData: EntityFormData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("institutional_accounts")
        .insert({
          user_id: user.id,
          entity_name: formData.entity_name,
          entity_type: formData.entity_type,
          ein: formData.ein,
          formation_state: formData.formation_state,
          formation_date: formData.formation_date,
          aum: formData.aum,
          authorized_signers: formData.authorized_signers || [],
          compliance_contact: formData.compliance_contact,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional-account"] });
      toast.success("Entity created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create entity: " + error.message);
    },
  });

  const updateAccount = useMutation({
    mutationFn: async (formData: Partial<EntityFormData>) => {
      if (!user?.id || !account?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("institutional_accounts")
        .update(formData)
        .eq("id", account.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional-account"] });
      toast.success("Entity updated successfully");
    },
  });

  return {
    account,
    isLoading,
    createAccount,
    updateAccount,
    hasAccount: !!account,
    isActive: account?.status === "active",
  };
}

export function useRelationshipManager() {
  // In production, this would fetch the assigned RM from the database
  return {
    manager: mockRelationshipManager,
    isLoading: false,
  };
}
