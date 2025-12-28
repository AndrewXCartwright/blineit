import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Search, Plus, Trash2, Info, ArrowRightLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mockDelegates = [
  {
    address: "0x1234...5678",
    name: "CryptoWhale",
    votingPower: 2500000,
    delegators: 156,
    proposalsVoted: 45,
    winRate: 82,
    bio: "Long-term real estate investor focused on sustainable growth",
  },
  {
    address: "0xabcd...efgh",
    name: "PropertyPro",
    votingPower: 1800000,
    delegators: 98,
    proposalsVoted: 38,
    winRate: 76,
    bio: "Commercial real estate expert with 15+ years experience",
  },
  {
    address: "0x9876...5432",
    name: "DeFiDave",
    votingPower: 1200000,
    delegators: 72,
    proposalsVoted: 52,
    winRate: 71,
    bio: "Active governance participant across multiple protocols",
  },
];

const myDelegations = [
  { to: "0x1234...5678", name: "CryptoWhale", power: 5000, since: "2024-01-15" },
];

const Delegations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDelegate, setSelectedDelegate] = useState<typeof mockDelegates[0] | null>(null);
  const [delegateAmount, setDelegateAmount] = useState([50]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalVotingPower = 15000;
  const [availablePower, setAvailablePower] = useState(10000);
  const delegatedPower = 5000;

  const filteredDelegates = mockDelegates.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelegate = () => {
    const amount = Math.round((delegateAmount[0] / 100) * availablePower);
    toast.success(`Successfully delegated ${amount.toLocaleString()} voting power to ${selectedDelegate?.name}`);
    setIsDialogOpen(false);
    setSelectedDelegate(null);
    setDelegateAmount([50]);
  };

  const handleRevoke = (delegation: typeof myDelegations[0]) => {
    toast.success(`Revoked delegation of ${delegation.power.toLocaleString()} voting power from ${delegation.name}`);
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

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Delegations</h1>
            <p className="text-muted-foreground">Delegate your voting power to trusted representatives</p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Delegating your voting power allows others to vote on your behalf. You can revoke delegation at any time, and your tokens remain in your wallet.
            </AlertDescription>
          </Alert>

          {/* Voting Power Summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Power</p>
                  <p className="text-xl font-bold">{totalVotingPower.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-xl font-bold text-green-500">{availablePower.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delegated</p>
                  <p className="text-xl font-bold text-primary">{delegatedPower.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Delegations */}
          {myDelegations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  My Active Delegations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myDelegations.map((delegation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{delegation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{delegation.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{delegation.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{delegation.power.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Since {delegation.since}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(delegation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Browse Delegates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Browse Delegates
              </CardTitle>
              <CardDescription>Find trusted community members to delegate your voting power</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Delegates List */}
              <div className="space-y-3">
                {filteredDelegates.map((delegate) => (
                  <div key={delegate.address} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">{delegate.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{delegate.name}</h3>
                            <Badge variant="secondary" className="text-xs">{delegate.winRate}% win rate</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{delegate.address}</p>
                          <p className="text-sm text-muted-foreground mt-1">{delegate.bio}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{delegate.votingPower.toLocaleString()} power</span>
                            <span>•</span>
                            <span>{delegate.delegators} delegators</span>
                            <span>•</span>
                            <span>{delegate.proposalsVoted} votes</span>
                          </div>
                        </div>
                      </div>
                      <Dialog open={isDialogOpen && selectedDelegate?.address === delegate.address} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedDelegate(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDelegate(delegate);
                              setIsDialogOpen(true);
                            }}
                            disabled={availablePower === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Delegate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delegate to {delegate.name}</DialogTitle>
                            <DialogDescription>
                              Choose how much of your available voting power to delegate.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{delegate.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{delegate.name}</p>
                                <p className="text-sm text-muted-foreground font-mono">{delegate.address}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <Label>Delegation Amount</Label>
                                <span className="text-sm font-medium">
                                  {Math.round((delegateAmount[0] / 100) * availablePower).toLocaleString()} votes
                                </span>
                              </div>
                              <Slider
                                value={delegateAmount}
                                onValueChange={setDelegateAmount}
                                max={100}
                                step={1}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0%</span>
                                <span>100% ({availablePower.toLocaleString()})</span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleDelegate}>
                              Confirm Delegation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Delegations;
