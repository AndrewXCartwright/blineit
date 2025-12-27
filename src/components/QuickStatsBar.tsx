import type { InvestmentType } from "./InvestmentTypeToggle";

interface QuickStatsBarProps {
  investmentType: InvestmentType;
}

export function QuickStatsBar({ investmentType }: QuickStatsBarProps) {
  const equityStats = [
    { label: "Avg Return", value: "14.2%" },
    { label: "Properties", value: "73" },
    { label: "Investors", value: "12,400" },
  ];

  const debtStats = [
    { label: "Avg APY", value: "10.8%" },
    { label: "Loans", value: "45" },
    { label: "Default Rate", value: "0.3%" },
  ];

  const stats = investmentType === "equity" ? equityStats : debtStats;

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${
      investmentType === "equity" 
        ? "bg-purple-500/10 border border-purple-500/20" 
        : "bg-blue-500/10 border border-blue-500/20"
    }`}>
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex-1 text-center">
          <p className={`text-sm font-bold ${
            investmentType === "equity" ? "text-purple-400" : "text-blue-400"
          }`}>
            {stat.value}
          </p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          {index < stats.length - 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-border/50 hidden" />
          )}
        </div>
      ))}
    </div>
  );
}
