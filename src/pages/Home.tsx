import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import PortfolioSummary from "@/components/home/PortfolioSummary";
import TrendingVideo from "@/components/home/TrendingVideo";
import LeaderboardGrid from "@/components/home/LeaderboardGrid";
import HottestPredictions from "@/components/home/HottestPredictions";
import MapPreview from "@/components/home/MapPreview";
import QuickActions from "@/components/home/QuickActions";
import ActivityFeed from "@/components/home/ActivityFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Existing Navbar with B-LINE-IT branding */}
      <Header />

      {/* Main Content Area */}
      <main
        style={{
          padding: "20px 15px 100px 15px",
        }}
      >
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
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
