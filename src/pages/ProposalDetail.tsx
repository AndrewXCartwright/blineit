import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, Clock, Users, CheckCircle2, XCircle, MessageSquare, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const mockProposal = {
  id: "1",
  title: "Increase Dividend Distribution Frequency",
  description: "Proposal to change dividend distributions from quarterly to monthly for all equity properties.",
  fullDescription: `
## Summary
This proposal seeks to modify the current dividend distribution schedule from quarterly to monthly payments for all equity property investments on the platform.

## Motivation
Many investors prefer more frequent income distributions for better cash flow management. Monthly dividends also align better with typical monthly expenses and reinvestment strategies.

## Implementation Details
- Dividends will be calculated and distributed on the 15th of each month
- Minimum distribution threshold of $1 will apply
- DRIP (Dividend Reinvestment Plan) will continue to function as normal
- No changes to total annual dividend amounts

## Impact Analysis
- Increased operational costs: ~0.02% annually
- Expected increase in investor satisfaction based on survey data
- No impact on property performance or valuations
  `,
  status: "active",
  votesFor: 1250000,
  votesAgainst: 450000,
  totalVotes: 1700000,
  quorum: 2000000,
  endDate: "2024-02-15",
  startDate: "2024-02-01",
  category: "financial",
  proposer: "Platform Team",
  proposerAddress: "0x1234...5678",
};

const mockVotes = [
  { address: "0xabcd...1234", vote: "for", power: 50000, timestamp: "2024-02-05" },
  { address: "0xefgh...5678", vote: "for", power: 35000, timestamp: "2024-02-04" },
  { address: "0xijkl...9012", vote: "against", power: 25000, timestamp: "2024-02-04" },
  { address: "0xmnop...3456", vote: "for", power: 15000, timestamp: "2024-02-03" },
];

const mockComments = [
  { id: "1", author: "InvestorPro", content: "This would really help with my cash flow planning!", timestamp: "2024-02-05", likes: 12 },
  { id: "2", author: "PropertyBull", content: "Concerned about the operational cost increase. Is 0.02% accurate?", timestamp: "2024-02-04", likes: 8 },
  { id: "3", author: "DividendKing", content: "Monthly dividends would be amazing. Fully support this!", timestamp: "2024-02-03", likes: 15 },
];

const ProposalDetail = () => {
  const { id } = useParams();
  const [userVote, setUserVote] = useState<"for" | "against" | null>(null);
  const [comment, setComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const votingPower = 15000;
  const forPercentage = (mockProposal.votesFor / mockProposal.totalVotes) * 100;
  const quorumPercentage = (mockProposal.totalVotes / mockProposal.quorum) * 100;

  const handleVote = async (vote: "for" | "against") => {
    setIsVoting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUserVote(vote);
    setIsVoting(false);
    toast.success(`Vote cast successfully! You voted ${vote} with ${votingPower.toLocaleString()} voting power.`);
  };

  const handleComment = () => {
    if (comment.trim()) {
      toast.success("Comment posted!");
      setComment("");
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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Active
              </Badge>
              <Badge variant="secondary">{mockProposal.category}</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-2">{mockProposal.title}</h1>
            <p className="text-muted-foreground">{mockProposal.description}</p>
          </div>

          {/* Voting Status */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Voting Ends</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{mockProposal.endDate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{mockProposal.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      For: {forPercentage.toFixed(1)}%
                    </span>
                    <span className="text-green-500">{mockProposal.votesFor.toLocaleString()}</span>
                  </div>
                  <Progress value={forPercentage} className="h-3 bg-muted [&>div]:bg-green-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2 text-red-500">
                      <XCircle className="h-4 w-4" />
                      Against: {(100 - forPercentage).toFixed(1)}%
                    </span>
                    <span className="text-red-500">{mockProposal.votesAgainst.toLocaleString()}</span>
                  </div>
                  <Progress value={100 - forPercentage} className="h-3 bg-muted [&>div]:bg-red-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Quorum Progress</span>
                    <span className={quorumPercentage >= 100 ? "text-green-500" : "text-yellow-500"}>
                      {quorumPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(quorumPercentage, 100)} 
                    className="h-2 bg-muted [&>div]:bg-yellow-500" 
                  />
                </div>
              </div>

              {/* Vote Actions */}
              {!userVote ? (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Your voting power: <span className="font-bold text-foreground">{votingPower.toLocaleString()}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleVote("for")}
                      disabled={isVoting}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Vote For
                    </Button>
                    <Button
                      onClick={() => handleVote("against")}
                      disabled={isVoting}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Vote Against
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t">
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    userVote === "for" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {userVote === "for" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>You voted <strong>{userVote}</strong> with {votingPower.toLocaleString()} voting power</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="votes" className="flex-1">Votes</TabsTrigger>
              <TabsTrigger value="discussion" className="flex-1">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{mockProposal.fullDescription}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="votes" className="mt-4 space-y-3">
              {mockVotes.map((vote, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{vote.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-mono text-sm">{vote.address}</p>
                        <p className="text-xs text-muted-foreground">{vote.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={vote.vote === "for" ? "default" : "destructive"}>
                        {vote.vote === "for" ? "For" : "Against"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vote.power.toLocaleString()} votes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="discussion" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Share your thoughts on this proposal..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={handleComment} disabled={!comment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </CardContent>
              </Card>

              {mockComments.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{c.author[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{c.author}</span>
                      <span className="text-xs text-muted-foreground">• {c.timestamp}</span>
                    </div>
                    <p className="text-sm">{c.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-muted-foreground text-xs">
                      <button className="hover:text-foreground">👍 {c.likes}</button>
                      <button className="hover:text-foreground">Reply</button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProposalDetail;
