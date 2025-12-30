import { useNavigate } from "react-router-dom";

interface LeaderboardItem {
  rank: string;
  name: string;
  stat: string;
  category: string;
  link: string;
}

interface LeaderboardGridProps {
  onViewAll?: () => void;
}

const leaderboardData: LeaderboardItem[] = [
  { rank: "#1 INVESTOR", name: "CryptoWhale_42", stat: "$2.4M invested", category: "Top Investor", link: "/leaderboards/investors" },
  { rank: "#1 SPONSOR", name: "Meridian RE", stat: "14 properties", category: "Top Sponsor", link: "/leaderboards/sponsors" },
  { rank: "#1 PROPERTY", name: "Austin Mixed-Use", stat: "+34% this week", category: "Trending", link: "/leaderboards/properties" },
  { rank: "#1 STARTUP", name: "GreenGrid Solar", stat: "847 follows", category: "Most Social", link: "/leaderboards/startups" },
];

const LeaderboardGrid = ({ onViewAll }: LeaderboardGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold" style={{ fontSize: "14px" }}>
          🏆 Leaderboards
        </span>
        <button
          onClick={onViewAll || (() => navigate("/leaderboards"))}
          style={{ fontSize: "11px", color: "#00d4aa" }}
        >
          View All →
        </button>
      </div>

      {/* Grid Container */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {leaderboardData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.link)}
            className="cursor-pointer transition-all duration-200"
            style={{
              background: "#1e1e32",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "14px",
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
              className="font-semibold"
              style={{ fontSize: "10px", color: "#ffd700" }}
            >
              {item.rank}
            </p>

            {/* Name */}
            <p
              className="font-semibold text-white truncate"
              style={{ fontSize: "12px" }}
            >
              {item.name}
            </p>

            {/* Stat */}
            <p style={{ fontSize: "10px", color: "#00d4aa" }}>
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
