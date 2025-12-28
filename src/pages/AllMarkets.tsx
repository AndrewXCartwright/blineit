import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

const AllMarkets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("volume");
  const [filterType, setFilterType] = useState("all");

  // Mock market data for all tokens
  const allMarkets = [
    { id: "prop-1", name: "Sunset Apartments", type: "property", lastPrice: 124.50, change: 2.3, volume: 45230, spread: 1.6, bid: 123.00, ask: 125.00 },
    { id: "prop-2", name: "Marina Heights", type: "property", lastPrice: 156.00, change: -1.2, volume: 32150, spread: 1.6, bid: 154.50, ask: 157.00 },
    { id: "prop-3", name: "Downtown Tower", type: "property", lastPrice: 89.25, change: 4.1, volume: 28890, spread: 1.7, bid: 88.50, ask: 90.00 },
    { id: "prop-4", name: "Austin Heights", type: "property", lastPrice: 142.00, change: 0.8, volume: 18500, spread: 2.1, bid: 140.00, ask: 144.00 },
    { id: "prop-5", name: "Palm Beach Villas", type: "property", lastPrice: 198.50, change: -0.5, volume: 12300, spread: 1.9, bid: 196.50, ask: 200.50 },
    { id: "loan-1", name: "Bridge Loan #1", type: "loan", lastPrice: 100.00, change: 0.0, volume: 8400, spread: 0.5, bid: 99.75, ask: 100.25 },
    { id: "loan-2", name: "Construction Loan #2", type: "loan", lastPrice: 100.00, change: 0.0, volume: 5200, spread: 0.8, bid: 99.60, ask: 100.40 },
    { id: "prop-6", name: "Riverside Complex", type: "property", lastPrice: 115.75, change: 1.5, volume: 9800, spread: 2.0, bid: 114.50, ask: 117.00 },
  ];

  const filteredMarkets = allMarkets
    .filter(market => {
      const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || market.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "volume": return b.volume - a.volume;
        case "price": return b.lastPrice - a.lastPrice;
        case "change": return b.change - a.change;
        case "spread": return a.spread - b.spread;
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/market")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">All Markets</h1>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change">Change</SelectItem>
                <SelectItem value="spread">Spread</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="property">Properties</SelectItem>
                <SelectItem value="loan">Loans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Markets Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Token</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Last</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Change</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Volume</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Spread</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarkets.map((market) => (
                    <tr 
                      key={market.id} 
                      className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/market/${market.id}`)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{market.type === "property" ? "🏢" : "🏦"}</span>
                          <span className="font-medium text-sm">{market.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(market.lastPrice)}
                      </td>
                      <td className="p-3 text-right">
                        <div className={`flex items-center justify-end gap-1 ${market.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span className="text-sm font-medium">{market.change >= 0 ? '+' : ''}{formatPercentage(market.change / 100)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground hidden sm:table-cell">
                        {formatCurrency(market.volume)}
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                        {formatPercentage(market.spread / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No markets found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMarkets;
