import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, Users, Clock, TrendingUp, ChevronRight, CheckCircle2, XCircle, Timer } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockProposals = [
  {
    id: "1",
    title: "Increase Dividend Distribution Frequency",
    description: "Proposal to change dividend distributions from quarterly to monthly for all equity properties.",
    status: "active",
    votesFor: 1250000,
    votesAgainst: 450000,
    totalVotes: 1700000,
    quorum: 2000000,
    endDate: "2024-02-15",
    category: "financial",
  },
  {
    id: "2",
    title: "Add New Property Category: Industrial",
    description: "Expand platform offerings to include industrial warehouse and logistics properties.",
    status: "active",
    votesFor: 890000,
    votesAgainst: 210000,
    totalVotes: 1100000,
    quorum: 1500000,
    endDate: "2024-02-20",
    category: "platform",
  },
  {
    id: "3",
    title: "Reduce Minimum Investment Amount",
    description: "Lower the minimum investment threshold from $100 to $50 for retail investors.",
    status: "passed",
    votesFor: 2100000,
    votesAgainst: 300000,
    totalVotes: 2400000,
    quorum: 2000000,
    endDate: "2024-01-30",
    category: "accessibility",
  },
  {
    id: "4",
    title: "Platform Fee Reduction",
    description: "Reduce platform management fees from 1% to 0.75% annually.",
    status: "failed",
    votesFor: 800000,
    votesAgainst: 1500000,
    totalVotes: 2300000,
    quorum: 2000000,
    endDate: "2024-01-15",
    category: "financial",
  },
];

const GovernanceHub = () => {
  const [activeTab, setActiveTab] = useState("active");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "passed":
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
        return <Timer className="h-4 w-4" />;
      case "passed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredProposals = mockProposals.filter((p) =>
    activeTab === "active" ? p.status === "active" : p.status !== "active"
  );

  const votingPower = 15000;
  const delegatedPower = 5000;

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
              <h1 className="text-2xl font-bold">Governance</h1>
              <p className="text-muted-foreground">Vote on platform proposals</p>
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
                <p className="text-2xl font-bold">{votingPower.toLocaleString()}</p>
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
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Active Proposals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">89%</p>
                <p className="text-xs text-muted-foreground">Participation Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Total Proposals</p>
              </CardContent>
            </Card>
          </div>

          {/* Proposals */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {filteredProposals.map((proposal) => (
                <Link key={proposal.id} to={`/governance/proposal/${proposal.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={getStatusColor(proposal.status)}>
                              {getStatusIcon(proposal.status)}
                              <span className="ml-1 capitalize">{proposal.status}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {proposal.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {proposal.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>

                      {/* Voting Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-500">
                            For: {((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%
                          </span>
                          <span className="text-red-500">
                            Against: {((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                          />
                          <div
                            className="bg-red-500 h-full"
                            style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Quorum: {((proposal.totalVotes / proposal.quorum) * 100).toFixed(0)}%</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ends {proposal.endDate}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default GovernanceHub;
