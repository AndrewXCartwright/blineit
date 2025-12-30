import { Bell } from "lucide-react";

const PortfolioSummary = () => {
  // Demo data
  const portfolioValue = 47250.00;
  const dailyChange = 1247.50;
  const dailyChangePercent = 2.7;
  const unreadAlerts = 3;

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
    { value: "12", label: "Investments" },
    { value: "5", label: "Active Bets" },
    { value: "$892", label: "Earnings" },
    { value: "8.4%", label: "Avg Yield" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1e32 0%, #252542 100%)",
        border: "1px solid #2a2a4a",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      {/* Section Label */}
      <p
        style={{
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#00d4aa",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        YOUR PORTFOLIO
      </p>

      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        {/* Left side - Portfolio Value */}
        <div>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "white",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {formatCurrency(portfolioValue)}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: changeColor,
              margin: 0,
              marginTop: "4px",
            }}
          >
            {changeArrow} {formatCurrency(Math.abs(dailyChange))} ({Math.abs(dailyChangePercent).toFixed(1)}%) today
          </p>
        </div>

        {/* Right side - Alerts Button */}
        <button
          style={{
            position: "relative",
            width: "44px",
            height: "44px",
            background: "rgba(0, 212, 170, 0.15)",
            border: "1px solid rgba(0, 212, 170, 0.3)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={20} color="#00d4aa" />
          {unreadAlerts > 0 && (
            <span
              style={{
                position: "absolute",
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              background: "#0f0f1a",
              borderRadius: "10px",
              padding: "10px 6px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                margin: 0,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: "9px",
                color: "#666",
                margin: 0,
                marginTop: "2px",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSummary;
