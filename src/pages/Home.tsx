import { useNavigate } from "react-router-dom";
import PortfolioSummary from "@/components/home/PortfolioSummary";
import TrendingVideo from "@/components/home/TrendingVideo";
import LeaderboardGrid from "@/components/home/LeaderboardGrid";
import HottestPredictions from "@/components/home/HottestPredictions";
import MapPreview from "@/components/home/MapPreview";
import QuickActions from "@/components/home/QuickActions";
import ActivityFeed from "@/components/home/ActivityFeed";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#0f0f1a",
        minHeight: "100vh",
        padding: "20px 15px 80px 15px",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between"
        style={{ padding: "0 5px 15px" }}
      >
        {/* Logo */}
        <h1
          className="font-bold"
          style={{
            fontSize: "20px",
            background: "linear-gradient(135deg, #00d4aa, #00a8cc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          THE ORIGIN
        </h1>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/search")}
            className="flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#1e1e32",
              border: "none",
              fontSize: "14px",
            }}
          >
            🔍
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#1e1e32",
              border: "none",
              fontSize: "14px",
            }}
          >
            👤
          </button>
        </div>
      </header>

      {/* Zone 1: Portfolio Summary */}
      <PortfolioSummary />

      {/* Zone 2: Trending Video */}
      <TrendingVideo />

      {/* Zone 3: Leaderboard Grid */}
      <LeaderboardGrid />

      {/* Zone 4: Hottest Predictions */}
      <HottestPredictions />

      {/* Zone 5: Map Preview */}
      <MapPreview />

      {/* Zone 6: Quick Actions */}
      <QuickActions />

      {/* Zone 7: Activity Feed */}
      <ActivityFeed />
    </div>
  );
}
