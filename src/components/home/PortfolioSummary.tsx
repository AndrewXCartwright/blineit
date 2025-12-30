import { Bell } from "lucide-react";

const PortfolioSummary = () => {
  // Demo data
  const portfolioValue = 47250.00;
  const dailyChange = 1247.50;
  const dailyChangePercent = 2.7;
  const unreadAlerts = 3;

  const isPositive = dailyChange >= 0;
  const changeArrow = isPositive ? "↑" : "↓";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const stats = [
    { value: "12", label: "Investments" },
    { value: "5", label: "Active Bets" },
    { value: "$892", label: "Earnings" },
    { value: "8.4%", label: "Avg Yield" },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-[#1e1e32] dark:to-[#252542] border border-purple-200 dark:border-[#2a2a4a] rounded-2xl p-4 mb-4">
      {/* Section Label */}
      <p className="text-[9px] uppercase tracking-[2px] text-[#00d4aa] font-semibold mb-3">
        YOUR PORTFOLIO
      </p>

      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        {/* Left side - Portfolio Value */}
        <div>
          <p className="text-[28px] font-bold text-foreground leading-tight">
            {formatCurrency(portfolioValue)}
          </p>
          <p className={`text-[13px] mt-1 ${isPositive ? "text-[#00d4aa]" : "text-[#ff4757]"}`}>
            {changeArrow} {formatCurrency(Math.abs(dailyChange))} ({Math.abs(dailyChangePercent).toFixed(1)}%) today
          </p>
        </div>

        {/* Right side - Alerts Button */}
        <button className="relative w-11 h-11 bg-[#00d4aa]/15 border border-[#00d4aa]/30 rounded-xl flex items-center justify-center cursor-pointer">
          <Bell size={20} className="text-[#00d4aa]" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 bg-[#ff4757] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-1 bg-white dark:bg-[#0f0f1a] rounded-[10px] py-2.5 px-1.5 text-center"
          >
            <p className="text-sm font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSummary;
