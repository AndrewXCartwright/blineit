import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePEFunds } from "@/hooks/usePEFunds";
import { PEFundCard } from "@/components/pe/PEFundCard";

const stageFilters = [
  { value: "all", label: "All Stages" },
  { value: "emerging", label: "Emerging" },
  { value: "established", label: "Established" },
  { value: "flagship", label: "Flagship" },
];

const strategyFilters = [
  { value: "all", label: "All Strategies" },
  { value: "buyout", label: "Buyout" },
  { value: "growth", label: "Growth" },
  { value: "turnaround", label: "Turnaround" },
  { value: "fund_of_funds", label: "Fund of Funds" },
];

export default function PEFundsListing() {
  const navigate = useNavigate();
  const { funds, loading, error } = usePEFunds();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedStrategy, setSelectedStrategy] = useState("all");

  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      const matchesSearch =
        !searchQuery ||
        fund.fund_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.fund_manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.gp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fund.target_sectors?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStage = selectedStage === "all" || fund.fund_stage === selectedStage;
      const matchesStrategy = selectedStrategy === "all" || fund.strategy === selectedStrategy;

      return matchesSearch && matchesStage && matchesStrategy;
    });
  }, [funds, searchQuery, selectedStage, selectedStrategy]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Private Equity</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Hero */}
      <div className="px-4 py-6 bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-background">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-600/10">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Private Equity Funds</h2>
            <p className="text-sm text-muted-foreground">Access buyout, growth, and turnaround funds</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search funds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Strategy Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {strategyFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={selectedStrategy === filter.value ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedStrategy(filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Stage Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {stageFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={selectedStage === filter.value ? "secondary" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedStage(filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {funds.length === 0
                ? "No PE funds available yet"
                : "No funds match your filters"}
            </p>
            {funds.length > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStage("all");
                  setSelectedStrategy("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFunds.map((fund) => (
              <PEFundCard key={fund.id} fund={fund} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
