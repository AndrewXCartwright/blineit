import { useNavigate } from "react-router-dom";

interface LeaderboardItem {
  rank: string;
  name: string;
  stat: string;
  category: string;
  link: string;
}

const leaderboardData: LeaderboardItem[] = [
  { rank: "#1 INVESTOR", name: "CryptoWhale_42", stat: "$2.4M invested", category: "Top Investor", link: "/leaderboards?tab=investors" },
  { rank: "#1 SPONSOR", name: "Meridian RE", stat: "14 properties", category: "Top Sponsor", link: "/leaderboards?tab=sponsors" },
  { rank: "#1 PROPERTY", name: "Austin Mixed-Use", stat: "+34% this week", category: "Trending", link: "/explore" },
  { rank: "#1 STARTUP", name: "GreenGrid Solar", stat: "847 follows", category: "Most Social", link: "/community" },
];

const LeaderboardGrid = () => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
          🏆 Leaderboards
        </span>
        <button
          onClick={() => navigate("/leaderboards")}
          style={{
            background: "none",
            border: "none",
            fontSize: "11px",
            color: "#00d4aa",
            cursor: "pointer",
          }}
        >
          View All →
        </button>
      </div>

      {/* Grid Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {leaderboardData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.link)}
            style={{
              background: "#1e1e32",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#00d4aa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2a2a4a";
            }}
          >
            {/* Rank Label */}
            <p
              style={{
                fontSize: "10px",
                color: "#ffd700",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {item.rank}
            </p>

            {/* Name */}
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "white",
                margin: 0,
                marginTop: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </p>

            {/* Stat */}
            <p
              style={{
                fontSize: "10px",
                color: "#00d4aa",
                margin: 0,
                marginTop: "2px",
              }}
            >
              {item.stat}
            </p>

            {/* Category */}
            <p
              style={{
                fontSize: "9px",
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginTop: "6px",
                margin: 0,
              }}
            >
              {item.category} →
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardGrid;
