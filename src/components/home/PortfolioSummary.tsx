import { Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PortfolioSummary = () => {
  const navigate = useNavigate();

  // Demo data
  const portfolioValue = 147257230.88;
  const dailyChange = 3892450.75;
  const dailyChangePercent = 2.7;
  const unreadAlerts = 3;
  const isPositive = dailyChange >= 0;
  const changeArrow = isPositive ? "↑" : "↓";
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value);
  };
  const stats = [{
    value: "47",
    label: "Investments",
    route: "/portfolio/analytics"
  }, {
    value: "18",
    label: "Active Bets",
    route: "/predict"
  }, {
    value: "$2.8M",
    label: "Earnings",
    route: "/wallet"
  }, {
    value: "9.2%",
    label: "Avg Yield",
    route: "/portfolio/analytics"
  }];
  const handleKeyDown = (e: React.KeyboardEvent, route: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(route);
    }
  };
  return <div className="gradient-primary rounded-2xl p-4 mb-4">
      {/* Section Label Row */}
      <div className="flex justify-between items-center mb-1.5">
        <p role="button" tabIndex={0} onClick={() => navigate("/portfolio/analytics")} onKeyDown={e => handleKeyDown(e, "/portfolio/analytics")} className="text-sm uppercase tracking-[2px] text-white font-bold cursor-pointer hover:underline hover:underline-offset-4 transition-all">
          YOUR PORTFOLIO
        </p>
        {/* Invest Now Button */}
        <button onClick={() => navigate("/assets")} className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold text-xs py-1.5 rounded-xl transition-all hover:-translate-y-0.5 mx-[50px] my-0 px-[20px]">
          INVEST   
        </button>
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        {/* Left side - Portfolio Value (Clickable) */}
        <div role="button" tabIndex={0} aria-label="View your full portfolio" onClick={() => navigate("/portfolio/analytics")} onKeyDown={e => handleKeyDown(e, "/portfolio/analytics")} className="cursor-pointer group">
          <p className="text-[28px] font-bold text-white leading-tight group-hover:underline group-hover:underline-offset-4 transition-all">
            {formatCurrency(portfolioValue)}
          </p>
          <p className={`text-[13px] font-bold mt-1 ${isPositive ? "text-[#00ff88]" : "text-[#ff4444]"}`}>
            {changeArrow} {formatCurrency(Math.abs(dailyChange))} ({Math.abs(dailyChangePercent).toFixed(1)}%) today
          </p>
        </div>

        {/* Right side - Alerts Button */}
        <button onClick={() => navigate("/notifications")} aria-label={`View ${unreadAlerts} unread alerts`} className="relative w-11 h-11 bg-bull/15 border border-bull/30 rounded-xl flex items-center justify-center cursor-pointer hover:bg-bull/25 transition-all">
          <Bell size={20} className="text-bull" />
          {unreadAlerts > 0 && <span className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 bg-bear rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadAlerts}
            </span>}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2">
        {stats.map((stat, index) => <div key={index} role="button" tabIndex={0} aria-label={`View your ${stat.value} ${stat.label}`} onClick={() => navigate(stat.route)} onKeyDown={e => handleKeyDown(e, stat.route)} className="flex-1 bg-white dark:bg-card rounded-[10px] py-2.5 px-1.5 text-center cursor-pointer border border-transparent hover:border-primary hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-secondary transition-all duration-200 group relative">
            <ChevronRight size={10} className="absolute top-1.5 right-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="font-semibold text-foreground text-lg">
              {stat.value}
            </p>
            <p className="text-muted-foreground mt-0.5 text-base">
              {stat.label}
            </p>
          </div>)}
      </div>
    </div>;
};
export default PortfolioSummary;