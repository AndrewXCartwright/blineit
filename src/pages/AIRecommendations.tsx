import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SmartRecommendations } from "@/components/SmartRecommendations";

export default function AIRecommendations() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/assets" className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">AI-Powered Recommendations</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <SmartRecommendations />
      </main>
    </div>
  );
}
