import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, Users, Clock, TrendingUp, ChevronRight, CheckCircle2, XCircle, Timer, Wrench, DollarSign, LogOut, UserCog, PieChart, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGovernance } from "@/hooks/useGovernance";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const proposalTypeIcons: Record<string, React.ReactNode> = {
  operational: <Wrench className="h-3 w-3" />,
  financial: <DollarSign className="h-3 w-3" />,
  exit: <LogOut className="h-3 w-3" />,
  management: <UserCog className="h-3 w-3" />,
  distribution: <PieChart className="h-3 w-3" />,
  other: <HelpCircle className="h-3 w-3" />,
};

const GovernanceHub = () => {
  const { user } = useAuth();
  const { 
    activeProposals, 
    completedProposals, 
    userVotes, 
    loadingProposals,
    hasVoted,
    useProposalVotes,
    calculateVoteTotals,
    delegationsToMe,
  } = useGovernance();
  const [activeTab, setActiveTab] = useState("active");

  // Calculate stats
  const totalVotingPower = 15000; // Mock - would come from user holdings
  const delegatedPower = delegationsToMe.reduce((acc, d) => acc + 5000, 0); // Mock
  const proposalsVoted = userVotes.length;
  const participationRate = activeProposals.length > 0 
    ? Math.round((proposalsVoted / activeProposals.length) * 100) 
    : 0;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Timer className="h-3 w-3" />;
      case "passed":
      case "executed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const displayedProposals = activeTab === "active" ? activeProposals : completedProposals;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🗳️ Governance
              </h1>
              <p className="text-muted-foreground">Vote on property decisions</p>
            </div>
            <Link to="/governance/my-votes">
              <Button variant="outline" size="sm">
                My Votes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Voting Power Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Voting Power</span>
                </div>
                <p className="text-2xl font-bold">{totalVotingPower.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on token holdings</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-secondary-foreground" />
                  <span className="text-sm text-muted-foreground">Delegated</span>
                </div>
                <p className="text-2xl font-bold">{delegatedPower.toLocaleString()}</p>
                <Link to="/governance/delegations" className="text-xs text-primary hover:underline mt-1 block">
                  Manage delegations →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{activeProposals.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-500">{participationRate}%</p>
                <p className="text-xs text-muted-foreground">Participation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{proposalsVoted}</p>
                <p className="text-xs text-muted-foreground">Voted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{completedProposals.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Proposals */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                Active ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed ({completedProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {loadingProposals ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : displayedProposals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} proposals at this time</p>
                  </CardContent>
                </Card>
              ) : (
                displayedProposals.map((proposal) => (
                  <ProposalCard 
                    key={proposal.id} 
                    proposal={proposal}
                    hasVoted={hasVoted(proposal.id)}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

// Separate component for proposal card to handle vote loading
const ProposalCard = ({ 
  proposal, 
  hasVoted,
  getStatusColor,
  getStatusIcon,
}: { 
  proposal: any;
  hasVoted: boolean;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}) => {
  const { useProposalVotes, calculateVoteTotals } = useGovernance();
  const { data: votes = [] } = useProposalVotes(proposal.id);
  const voteTotals = calculateVoteTotals(votes);
  
  const totalPower = Object.values(voteTotals).reduce((acc, v) => acc + v.power, 0);
  const forPower = voteTotals["for"]?.power || 0;
  const againstPower = voteTotals["against"]?.power || 0;
  
  const forPercent = totalPower > 0 ? (forPower / totalPower) * 100 : 0;
  const againstPercent = totalPower > 0 ? (againstPower / totalPower) * 100 : 0;
  
  const isActive = proposal.status === "active" && new Date(proposal.voting_ends_at) > new Date();
  const timeRemaining = isActive 
    ? formatDistanceToNow(new Date(proposal.voting_ends_at), { addSuffix: false })
    : null;

  return (
    <Link to={`/governance/proposal/${proposal.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className={getStatusColor(proposal.status)}>
                  {getStatusIcon(proposal.status)}
                  <span className="ml-1 capitalize">{proposal.status}</span>
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  {proposalTypeIcons[proposal.proposal_type] || proposalTypeIcons.other}
                  <span className="capitalize">{proposal.proposal_type}</span>
                </Badge>
              </div>
              <h3 className="font-semibold">{proposal.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {proposal.description}
              </p>
              {proposal.property && (
                <p className="text-xs text-primary mt-1">{proposal.property.name}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Voting Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-500">
                For: {forPercent.toFixed(1)}%
              </span>
              <span className="text-red-500">
                Against: {againstPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${forPercent}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${againstPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{votes.length} votes cast</span>
              {isActive && timeRemaining && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeRemaining} left
                </span>
              )}
              {hasVoted && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Voted ✓
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GovernanceHub;
