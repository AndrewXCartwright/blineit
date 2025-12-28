import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, CheckCircle2, XCircle, Clock, TrendingUp, History, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockVotingHistory = [
  {
    id: "1",
    proposalId: "1",
    proposalTitle: "Increase Dividend Distribution Frequency",
    vote: "for",
    votingPower: 15000,
    timestamp: "2024-02-05",
    status: "active",
    outcome: null,
  },
  {
    id: "2",
    proposalId: "3",
    proposalTitle: "Reduce Minimum Investment Amount",
    vote: "for",
    votingPower: 14500,
    timestamp: "2024-01-25",
    status: "passed",
    outcome: "passed",
  },
  {
    id: "3",
    proposalId: "4",
    proposalTitle: "Platform Fee Reduction",
    vote: "for",
    votingPower: 14000,
    timestamp: "2024-01-10",
    status: "failed",
    outcome: "failed",
  },
  {
    id: "4",
    proposalId: "5",
    proposalTitle: "Add Multi-Language Support",
    vote: "against",
    votingPower: 13500,
    timestamp: "2023-12-20",
    status: "passed",
    outcome: "passed",
  },
];

const mockDelegations = [
  { from: "0xabcd...1234", power: 5000, since: "2024-01-15" },
  { from: "0xefgh...5678", power: 3000, since: "2024-02-01" },
];

const MyGovernance = () => {
  const [filter, setFilter] = useState("all");

  const totalVotingPower = 15000;
  const delegatedToMe = 8000;
  const delegatedByMe = 0;
  const proposalsVoted = 12;
  const winRate = 75;

  const filteredHistory = filter === "all" 
    ? mockVotingHistory 
    : mockVotingHistory.filter(v => v.vote === filter);

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

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">My Governance</h1>
            <p className="text-muted-foreground">Track your voting activity and impact</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Voting Power</span>
                </div>
                <p className="text-2xl font-bold">{(totalVotingPower + delegatedToMe).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalVotingPower.toLocaleString()} owned + {delegatedToMe.toLocaleString()} delegated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                </div>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {proposalsVoted} proposals voted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-green-500">9</p>
                <p className="text-xs text-muted-foreground">Votes For</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-red-500">3</p>
                <p className="text-xs text-muted-foreground">Votes Against</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-blue-500">2</p>
                <p className="text-xs text-muted-foreground">Active Votes</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history">
            <TabsList className="w-full">
              <TabsTrigger value="history" className="flex-1">Voting History</TabsTrigger>
              <TabsTrigger value="delegations" className="flex-1">Delegations</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4 space-y-4">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Votes</SelectItem>
                    <SelectItem value="for">For</SelectItem>
                    <SelectItem value="against">Against</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voting History */}
              {filteredHistory.map((vote) => (
                <Link key={vote.id} to={`/governance/proposal/${vote.proposalId}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {vote.vote === "for" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge 
                              variant={vote.outcome === "passed" ? "default" : vote.outcome === "failed" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {vote.status === "active" ? "Active" : vote.outcome === "passed" ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{vote.proposalTitle}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Voted {vote.vote}</span>
                            <span>•</span>
                            <span>{vote.votingPower.toLocaleString()} power</span>
                            <span>•</span>
                            <span>{vote.timestamp}</span>
                          </div>
                        </div>
                        {vote.outcome && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            (vote.vote === "for" && vote.outcome === "passed") || 
                            (vote.vote === "against" && vote.outcome === "failed")
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}>
                            {(vote.vote === "for" && vote.outcome === "passed") || 
                             (vote.vote === "against" && vote.outcome === "failed")
                              ? "Won"
                              : "Lost"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="delegations" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delegated to Me</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockDelegations.length > 0 ? (
                    mockDelegations.map((d, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{d.from}</p>
                          <p className="text-xs text-muted-foreground">Since {d.since}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{d.power.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">voting power</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No delegations received</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">My Delegations</CardTitle>
                  <Link to="/governance/delegations">
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {delegatedByMe > 0 ? (
                    <p>You have delegated {delegatedByMe.toLocaleString()} voting power</p>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      You haven't delegated any voting power
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MyGovernance;
