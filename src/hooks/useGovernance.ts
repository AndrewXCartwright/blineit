import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface GovernanceProposal {
  id: string;
  item_id: string;
  item_type: string;
  title: string;
  description: string;
  proposal_type: string;
  status: string;
  created_by: string;
  voting_starts_at: string;
  voting_ends_at: string;
  quorum_percentage: number;
  pass_threshold: number;
  options: Json;
  documents: Json;
  execution_details: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_option: string;
  voting_power: number;
  voted_at: string;
}

export interface GovernanceDelegate {
  id: string;
  user_id: string;
  delegate_to: string;
  item_id: string | null;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
}

export interface VoteTotals {
  [key: string]: { count: number; power: number };
}

export const useGovernance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all active proposals
  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: ["governance-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_proposals")
        .select("*")
        .in("status", ["active", "passed", "failed", "executed"])
        .order("voting_ends_at", { ascending: true });

      if (error) throw error;
      return (data || []) as GovernanceProposal[];
    },
  });

  // Fetch user's votes
  const { data: userVotes = [], isLoading: loadingVotes } = useQuery({
    queryKey: ["governance-user-votes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("governance_votes")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as GovernanceVote[];
    },
    enabled: !!user,
  });

  // Fetch votes for a specific proposal
  const useProposalVotes = (proposalId: string) => {
    return useQuery({
      queryKey: ["governance-proposal-votes", proposalId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("governance_votes")
          .select("*")
          .eq("proposal_id", proposalId);

        if (error) throw error;
        return data as GovernanceVote[];
      },
    });
  };

  // Get vote totals for a proposal
  const calculateVoteTotals = (votes: GovernanceVote[]): VoteTotals => {
    const totals: VoteTotals = {};
    votes.forEach((vote) => {
      if (!totals[vote.vote_option]) {
        totals[vote.vote_option] = { count: 0, power: 0 };
      }
      totals[vote.vote_option].count += 1;
      totals[vote.vote_option].power += Number(vote.voting_power);
    });
    return totals;
  };

  // Fetch user's delegations
  const { data: delegations = [], isLoading: loadingDelegations } = useQuery({
    queryKey: ["governance-delegations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("governance_delegates")
        .select("*")
        .or(`user_id.eq.${user.id},delegate_to.eq.${user.id}`)
        .eq("is_active", true);

      if (error) throw error;
      return data as GovernanceDelegate[];
    },
    enabled: !!user,
  });

  // Get user's voting power for a property
  const getUserVotingPower = async (propertyId: string): Promise<number> => {
    if (!user) return 0;
    
    const { data } = await supabase
      .from("user_holdings")
      .select("tokens")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .single();

    return data?.tokens || 0;
  };

  // Cast a vote
  const castVoteMutation = useMutation({
    mutationFn: async ({
      proposalId,
      voteOption,
      votingPower,
    }: {
      proposalId: string;
      voteOption: string;
      votingPower: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("governance_votes").insert({
        proposal_id: proposalId,
        user_id: user.id,
        vote_option: voteOption,
        voting_power: votingPower,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["governance-user-votes"] });
      queryClient.invalidateQueries({ queryKey: ["governance-proposal-votes"] });
      toast.success("Vote cast successfully!");
    },
    onError: (error) => {
      console.error("Vote error:", error);
      toast.error("Failed to cast vote. You may have already voted.");
    },
  });

  // Create delegation
  const createDelegationMutation = useMutation({
    mutationFn: async ({
      delegateTo,
      itemId,
    }: {
      delegateTo: string;
      itemId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("governance_delegates").insert({
        user_id: user.id,
        delegate_to: delegateTo,
        item_id: itemId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-delegations"] });
      toast.success("Delegation created successfully!");
    },
    onError: (error) => {
      console.error("Delegation error:", error);
      toast.error("Failed to create delegation");
    },
  });

  // Revoke delegation
  const revokeDelegationMutation = useMutation({
    mutationFn: async (delegationId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("governance_delegates")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("id", delegationId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-delegations"] });
      toast.success("Delegation revoked successfully!");
    },
    onError: (error) => {
      console.error("Revoke error:", error);
      toast.error("Failed to revoke delegation");
    },
  });

  // Check if user has voted on a proposal
  const hasVoted = (proposalId: string): boolean => {
    return userVotes.some((v) => v.proposal_id === proposalId);
  };

  // Get user's vote for a proposal
  const getUserVote = (proposalId: string): GovernanceVote | undefined => {
    return userVotes.find((v) => v.proposal_id === proposalId);
  };

  // Get active proposals
  const activeProposals = proposals.filter(
    (p) => p.status === "active" && new Date(p.voting_ends_at) > new Date()
  );

  // Get completed proposals
  const completedProposals = proposals.filter(
    (p) => p.status === "passed" || p.status === "failed" || p.status === "executed"
  );

  // Get delegations to user
  const delegationsToMe = delegations.filter((d) => d.delegate_to === user?.id);

  // Get user's outgoing delegations
  const myDelegations = delegations.filter((d) => d.user_id === user?.id);

  return {
    proposals,
    activeProposals,
    completedProposals,
    userVotes,
    delegations,
    delegationsToMe,
    myDelegations,
    loadingProposals,
    loadingVotes,
    loadingDelegations,
    castVote: castVoteMutation.mutate,
    isVoting: castVoteMutation.isPending,
    createDelegation: createDelegationMutation.mutate,
    revokeDelegation: revokeDelegationMutation.mutate,
    hasVoted,
    getUserVote,
    getUserVotingPower,
    useProposalVotes,
    calculateVoteTotals,
  };
};
