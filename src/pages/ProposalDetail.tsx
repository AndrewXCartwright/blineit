import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, Clock, Users, CheckCircle2, XCircle, MessageSquare, FileText, Wrench, DollarSign, LogOut, UserCog, PieChart, HelpCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGovernance, GovernanceProposal } from "@/hooks/useGovernance";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

const proposalTypeIcons: Record<string, React.ReactNode> = {
  operational: <Wrench className="h-4 w-4" />,
  financial: <DollarSign className="h-4 w-4" />,
  exit: <LogOut className="h-4 w-4" />,
  management: <UserCog className="h-4 w-4" />,
  distribution: <PieChart className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
};

const ProposalDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    castVote, 
    isVoting, 
    hasVoted, 
    getUserVote,
    useProposalVotes,
    calculateVoteTotals,
    getUserVotingPower,
  } = useGovernance();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [votingPower, setVotingPower] = useState(0);

  // Fetch proposal
  const { data: proposal, isLoading: loadingProposal } = useQuery({
    queryKey: ["governance-proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_proposals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as GovernanceProposal;
    },
    enabled: !!id,
  });

  // Fetch votes
  const { data: votes = [], isLoading: loadingVotes } = useProposalVotes(id || "");
  const voteTotals = calculateVoteTotals(votes);

  // Get user's existing vote
  const userVote = getUserVote(id || "");
  const alreadyVoted = hasVoted(id || "");

  // Calculate totals
  const totalPower = Object.values(voteTotals).reduce((acc, v) => acc + v.power, 0);
  const totalVotes = Object.values(voteTotals).reduce((acc, v) => acc + v.count, 0);

  // Load voting power
  useEffect(() => {
    if (proposal && user) {
      getUserVotingPower(proposal.item_id).then(setVotingPower);
    }
  }, [proposal, user]);

  const isActive = proposal?.status === "active" && new Date(proposal.voting_ends_at) > new Date();
  const quorumReached = proposal ? (totalPower / 1000000 * 100) >= proposal.quorum_percentage : false;

  const handleVote = () => {
    if (!selectedOption || !id) return;
    castVote({ proposalId: id, voteOption: selectedOption, votingPower });
    setConfirmDialogOpen(false);
    setSelectedOption(null);
  };

  if (loadingProposal) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-6" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-60 w-full" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Link to="/governance" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Governance
          </Link>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Proposal not found</p>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "passed":
      case "executed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Link to="/governance" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Governance
          </Link>

          {/* Proposal Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={getStatusColor(proposal.status)}>
                {proposal.status === "active" ? "Active" : proposal.status}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                {proposalTypeIcons[proposal.proposal_type] || proposalTypeIcons.other}
                <span className="capitalize">{proposal.proposal_type}</span>
              </Badge>
            </div>
            <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
            <p className="text-muted-foreground">{proposal.description}</p>
          </div>

          {/* Voting Status */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isActive ? "Voting Ends" : "Voting Ended"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {isActive 
                        ? formatDistanceToNow(new Date(proposal.voting_ends_at), { addSuffix: true })
                        : format(new Date(proposal.voting_ends_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{totalVotes} ({totalPower.toLocaleString()} power)</span>
                  </div>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="space-y-4">
                {(proposal.options as { key: string; label: string }[]).map((option) => {
                  const optionData = voteTotals[option.key] || { count: 0, power: 0 };
                  const percentage = totalPower > 0 ? (optionData.power / totalPower) * 100 : 0;
                  const isFor = option.key === "for";
                  const isAgainst = option.key === "against";

                  return (
                    <div key={option.key}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={`flex items-center gap-2 ${isFor ? "text-green-500" : isAgainst ? "text-red-500" : ""}`}>
                          {isFor && <CheckCircle2 className="h-4 w-4" />}
                          {isAgainst && <XCircle className="h-4 w-4" />}
                          {option.label}: {percentage.toFixed(1)}%
                        </span>
                        <span className={isFor ? "text-green-500" : isAgainst ? "text-red-500" : ""}>
                          {optionData.power.toLocaleString()} power
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-3 bg-muted ${isFor ? "[&>div]:bg-green-500" : isAgainst ? "[&>div]:bg-red-500" : "[&>div]:bg-yellow-500"}`} 
                      />
                    </div>
                  );
                })}

                {/* Quorum Progress */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Quorum Progress</span>
                    <span className={quorumReached ? "text-green-500" : "text-yellow-500"}>
                      {quorumReached ? "Reached ✓" : `${proposal.quorum_percentage}% required`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vote Actions */}
              {isActive && !alreadyVoted && user && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Your voting power: <span className="font-bold text-foreground">{votingPower.toLocaleString()}</span>
                  </p>
                  {votingPower > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {(proposal.options as { key: string; label: string }[]).map((option) => (
                        <Button
                          key={option.key}
                          onClick={() => {
                            setSelectedOption(option.key);
                            setConfirmDialogOpen(true);
                          }}
                          variant={option.key === "for" ? "default" : option.key === "against" ? "destructive" : "outline"}
                          className={option.key === "for" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {option.key === "for" && <CheckCircle2 className="h-4 w-4 mr-2" />}
                          {option.key === "against" && <XCircle className="h-4 w-4 mr-2" />}
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You need to hold tokens for this property to vote.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {alreadyVoted && userVote && (
                <div className="mt-6 pt-6 border-t">
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    userVote.vote_option === "for" ? "bg-green-500/10 text-green-500" : 
                    userVote.vote_option === "against" ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {userVote.vote_option === "for" ? <CheckCircle2 className="h-5 w-5" /> : 
                     userVote.vote_option === "against" ? <XCircle className="h-5 w-5" /> :
                     <Vote className="h-5 w-5" />}
                    <span>
                      You voted <strong className="capitalize">{userVote.vote_option}</strong> with {Number(userVote.voting_power).toLocaleString()} voting power
                    </span>
                  </div>
                </div>
              )}

              {!isActive && (
                <div className="mt-6 pt-6 border-t">
                  <div className={`flex items-center gap-2 p-4 rounded-lg ${
                    proposal.status === "passed" || proposal.status === "executed"
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                    {proposal.status === "passed" || proposal.status === "executed" 
                      ? <CheckCircle2 className="h-6 w-6" /> 
                      : <XCircle className="h-6 w-6" />}
                    <div>
                      <p className="font-semibold">
                        {proposal.status === "passed" || proposal.status === "executed" 
                          ? "Proposal Passed" 
                          : "Proposal Failed"}
                      </p>
                      {proposal.execution_details && (
                        <p className="text-sm opacity-80">{proposal.execution_details}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="votes">
            <TabsList className="w-full">
              <TabsTrigger value="votes" className="flex-1">Votes ({totalVotes})</TabsTrigger>
              <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="votes" className="mt-4 space-y-3">
              {loadingVotes ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : votes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No votes cast yet</p>
                  </CardContent>
                </Card>
              ) : (
                votes.slice(0, 20).map((vote) => (
                  <Card key={vote.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {vote.user_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-mono text-sm">{vote.user_id.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(vote.voted_at), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={vote.vote_option === "for" ? "default" : vote.vote_option === "against" ? "destructive" : "secondary"}
                          className={vote.vote_option === "for" ? "bg-green-500" : ""}
                        >
                          {vote.vote_option}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Number(vote.voting_power).toLocaleString()} power
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-3">
              {(proposal.documents as { name: string; url: string }[]).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents attached</p>
                  </CardContent>
                </Card>
              ) : (
                (proposal.documents as { name: string; url: string }[]).map((doc, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(proposal.created_at), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">Voting Opens</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(proposal.voting_starts_at), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isActive ? "bg-yellow-500" : "bg-gray-500"}`} />
                    <div>
                      <p className="font-medium">Voting Closes</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(proposal.voting_ends_at), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {proposal.executed_at && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <div>
                        <p className="font-medium">Executed</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(proposal.executed_at), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Confirm Vote Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Your vote cannot be changed after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proposal</span>
                <span className="font-medium text-right">{proposal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Vote</span>
                <Badge 
                  variant={selectedOption === "for" ? "default" : selectedOption === "against" ? "destructive" : "secondary"}
                  className={selectedOption === "for" ? "bg-green-500" : ""}
                >
                  {selectedOption}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voting Power</span>
                <span className="font-medium">{votingPower.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={isVoting}>
              {isVoting ? "Submitting..." : "Confirm Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ProposalDetail;
