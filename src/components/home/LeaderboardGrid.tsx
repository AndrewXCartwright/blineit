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
  { rank: "#1 PROPERTY", name: "Austin Mixed-Use", stat: "+34% this week", category: "Trending", link: "/leaderboards?tab=properties" },
  { rank: "#1 STARTUP", name: "GreenGrid Solar", stat: "847 follows", category: "Most Social", link: "/leaderboards?tab=startups" },
];

const LeaderboardGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-foreground">
          🏆 Leaderboards
        </span>
        <button
          onClick={() => navigate("/leaderboards")}
          className="bg-transparent border-none text-[11px] text-bull cursor-pointer"
        >
          View All →
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 gap-2.5">
        {leaderboardData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.link)}
            className="bg-card border border-border rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:border-bull"
          >
            {/* Rank Label */}
            <p className="text-[10px] text-accent font-semibold">
              {item.rank}
            </p>

            {/* Name */}
            <p className="text-xs font-semibold text-foreground mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.name}
            </p>

            {/* Stat */}
            <p className="text-[10px] text-bull mt-0.5">
              {item.stat}
            </p>

            {/* Category */}
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.5px] mt-1.5">
              {item.category} →
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardGrid;
