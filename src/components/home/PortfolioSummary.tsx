import { Bell } from "lucide-react";

interface PortfolioSummaryProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  investments: number;
  activeBets: number;
  earnings: number;
  avgYield: number;
  unreadAlerts: number;
  onAlertsClick: () => void;
}

const PortfolioSummary = ({
  totalValue,
  dailyChange,
  dailyChangePercent,
  investments,
  activeBets,
  earnings,
  avgYield,
  unreadAlerts,
  onAlertsClick,
}: PortfolioSummaryProps) => {
  const isPositive = dailyChange >= 0;
  const changeColor = isPositive ? "#00d4aa" : "#ff4757";
  const changeArrow = isPositive ? "↑" : "↓";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const stats = [
    { value: investments.toString(), label: "Investments" },
    { value: activeBets.toString(), label: "Active Bets" },
    { value: formatCurrency(earnings), label: "Earnings" },
    { value: `${avgYield.toFixed(1)}%`, label: "Avg Yield" },
  ];

  return (
    <div
      className="mb-4 rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, #1e1e32 0%, #252542 100%)",
        border: "1px solid #2a2a4a",
        borderRadius: "16px",
      }}
    >
      {/* Section Label */}
      <p
        className="mb-3"
        style={{
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#00d4aa",
          fontWeight: 600,
        }}
      >
        YOUR PORTFOLIO
      </p>

      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        {/* Left side - Portfolio Value */}
        <div>
          <p
            className="font-bold text-white"
            style={{ fontSize: "28px" }}
          >
            {formatCurrency(totalValue)}
          </p>
          <p style={{ fontSize: "13px", color: changeColor }}>
            {changeArrow} {formatCurrency(Math.abs(dailyChange))} ({Math.abs(dailyChangePercent).toFixed(1)}%) today
          </p>
        </div>

        {/* Right side - Alerts Button */}
        <button
          onClick={onAlertsClick}
          className="relative flex items-center justify-center"
          style={{
            width: "44px",
            height: "44px",
            background: "rgba(0, 212, 170, 0.15)",
            border: "1px solid rgba(0, 212, 170, 0.3)",
            borderRadius: "12px",
          }}
        >
          <Bell size={20} color="#00d4aa" />
          {unreadAlerts > 0 && (
            <span
              className="absolute flex items-center justify-center"
              style={{
                top: "-4px",
                right: "-4px",
                height: "18px",
                minWidth: "18px",
                padding: "0 4px",
                background: "#ff4757",
                borderRadius: "9px",
                fontSize: "10px",
                fontWeight: "bold",
                color: "white",
              }}
            >
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
            className="flex-1 text-center"
            style={{
              background: "#0f0f1a",
              borderRadius: "10px",
              padding: "10px 6px",
            }}
          >
            <p
              className="font-semibold text-white"
              style={{ fontSize: "14px" }}
            >
              {stat.value}
            </p>
            <p style={{ fontSize: "9px", color: "#666" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSummary;
