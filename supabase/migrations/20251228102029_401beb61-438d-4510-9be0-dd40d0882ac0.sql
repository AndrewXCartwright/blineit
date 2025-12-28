-- Create governance_proposals table
CREATE TABLE public.governance_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'property',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT NOT NULL DEFAULT 'operational',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  voting_starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  quorum_percentage DECIMAL NOT NULL DEFAULT 25,
  pass_threshold DECIMAL NOT NULL DEFAULT 51,
  options JSONB NOT NULL DEFAULT '[{"key": "for", "label": "For"}, {"key": "against", "label": "Against"}, {"key": "abstain", "label": "Abstain"}]'::jsonb,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_details TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create governance_votes table
CREATE TABLE public.governance_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_option TEXT NOT NULL,
  voting_power DECIMAL NOT NULL DEFAULT 0,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Create governance_snapshots table
CREATE TABLE public.governance_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tokens_held DECIMAL NOT NULL DEFAULT 0,
  snapshot_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);

-- Create governance_delegates table
CREATE TABLE public.governance_delegates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  delegate_to UUID NOT NULL,
  item_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_delegates ENABLE ROW LEVEL SECURITY;

-- Governance proposals policies
CREATE POLICY "Anyone can view active proposals" ON public.governance_proposals
  FOR SELECT USING (status IN ('active', 'passed', 'failed', 'executed'));

CREATE POLICY "Admins can manage all proposals" ON public.governance_proposals
  FOR ALL USING (is_admin());

-- Governance votes policies
CREATE POLICY "Users can view all votes" ON public.governance_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can cast their own votes" ON public.governance_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot change votes" ON public.governance_votes
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete votes" ON public.governance_votes
  FOR DELETE USING (false);

-- Governance snapshots policies
CREATE POLICY "Users can view all snapshots" ON public.governance_snapshots
  FOR SELECT USING (true);

CREATE POLICY "System can insert snapshots" ON public.governance_snapshots
  FOR INSERT WITH CHECK (true);

-- Governance delegates policies
CREATE POLICY "Users can view their delegations" ON public.governance_delegates
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = delegate_to);

CREATE POLICY "Users can create delegations" ON public.governance_delegates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their delegations" ON public.governance_delegates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their delegations" ON public.governance_delegates
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_governance_proposals_item ON public.governance_proposals(item_id, item_type);
CREATE INDEX idx_governance_proposals_status ON public.governance_proposals(status);
CREATE INDEX idx_governance_votes_proposal ON public.governance_votes(proposal_id);
CREATE INDEX idx_governance_votes_user ON public.governance_votes(user_id);
CREATE INDEX idx_governance_snapshots_proposal ON public.governance_snapshots(proposal_id);
CREATE INDEX idx_governance_delegates_user ON public.governance_delegates(user_id);
CREATE INDEX idx_governance_delegates_delegate ON public.governance_delegates(delegate_to);

-- Create updated_at trigger
CREATE TRIGGER update_governance_proposals_updated_at
  BEFORE UPDATE ON public.governance_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();