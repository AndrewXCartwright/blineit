import { ArrowDownLeft, ArrowUpRight, RefreshCw, Building2, Coins, Target, TrendingUp, TrendingDown } from "lucide-react";

const holdings = [
  { type: "property", name: "Sunset Towers", amount: "1,250 tokens", value: "$12,500", change: "+8.5%", positive: true },
  { type: "property", name: "Metro Plaza", amount: "800 tokens", value: "$8,000", change: "+3.2%", positive: true },
  { type: "property", name: "Harbor View", amount: "500 tokens", value: "$5,500", change: "-1.2%", positive: false },
  { type: "crypto", name: "USDC", amount: "15,832.50", value: "$15,832.50", change: "0%", positive: true },
  { type: "prediction", name: "Bull Position - Sunset Towers", amount: "$500", value: "$670", change: "+34%", positive: true },
  { type: "prediction", name: "Bear Position - Tech Park", amount: "$200", value: "$145", change: "-27.5%", positive: false },
];

export default function Wallet() {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">
            $47,832.50
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-success/20 hover:bg-success/30 transition-colors">
              <div className="p-2 rounded-full bg-success/30">
                <ArrowDownLeft className="w-5 h-5 text-success" />
              </div>
              <span className="text-xs font-medium text-success">Deposit</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/20 hover:bg-primary/30 transition-colors">
              <div className="p-2 rounded-full bg-primary/30">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary">Withdraw</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors">
              <div className="p-2 rounded-full bg-accent/30">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-accent">Swap</span>
            </button>
          </div>
        </div>

        {/* Holdings */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Holdings</h2>
          <div className="space-y-3">
            {holdings.map((holding, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 animate-fade-in hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      holding.type === "property" 
                        ? "bg-primary/20" 
                        : holding.type === "crypto"
                        ? "bg-accent/20"
                        : "bg-success/20"
                    }`}>
                      {holding.type === "property" ? (
                        <Building2 className="w-5 h-5 text-primary" />
                      ) : holding.type === "crypto" ? (
                        <Coins className="w-5 h-5 text-accent" />
                      ) : (
                        <Target className="w-5 h-5 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{holding.name}</p>
                      <p className="text-xs text-muted-foreground">{holding.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{holding.value}</p>
                    <div className="flex items-center justify-end gap-1">
                      {holding.positive ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${
                        holding.positive ? "text-success" : "text-destructive"
                      }`}>
                        {holding.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
