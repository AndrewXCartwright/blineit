import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PropertyCard } from "@/components/PropertyCard";
import { DollarSign, Building2, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const properties = [
  { name: "Sunset Towers", location: "Miami, FL", tokens: 1250, yield: 8.5, value: 12500 },
  { name: "Metro Plaza", location: "NYC, NY", tokens: 800, yield: 7.2, value: 8000 },
  { name: "Harbor View", location: "San Diego, CA", tokens: 500, yield: 9.1, value: 5500 },
  { name: "Downtown Lofts", location: "Austin, TX", tokens: 350, yield: 6.8, value: 3850 },
];

const activities = [
  { type: "dividend", description: "Dividend received from Sunset Towers", amount: "+$125.00", positive: true },
  { type: "prediction", description: "Won prediction on Metro Plaza", amount: "+$340.00", positive: true },
  { type: "purchase", description: "Purchased 100 tokens of Harbor View", amount: "-$1,100.00", positive: false },
  { type: "dividend", description: "Dividend received from Downtown Lofts", amount: "+$42.50", positive: true },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="px-4 py-6 space-y-6">
        {/* Portfolio Value Card */}
        <div className="gradient-primary rounded-2xl p-6 glow-primary animate-fade-in">
          <p className="text-primary-foreground/80 text-sm mb-1">Total Portfolio Value</p>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-2">
            $47,832.50
          </h2>
          <div className="flex items-center gap-2">
            <span className="bg-success/20 text-success px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </span>
            <span className="text-primary-foreground/60 text-sm">this month</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Earnings"
            value="$4,832"
            subValue="+$523 this week"
            trend="up"
          />
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Properties"
            value="4"
            subValue="+1 new"
            trend="up"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Active Bets"
            value="7"
            subValue="3 expiring soon"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Avg. Yield"
            value="7.9%"
            subValue="+0.3%"
            trend="up"
          />
        </div>

        {/* Your Properties */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">Your Properties</h2>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {properties.map((property, index) => (
              <PropertyCard key={index} {...property} />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 flex items-center justify-between animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    activity.positive ? "bg-success/20" : "bg-destructive/20"
                  }`}>
                    {activity.positive ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{activity.description}</p>
                </div>
                <span className={`font-semibold text-sm ${
                  activity.positive ? "text-success" : "text-destructive"
                }`}>
                  {activity.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
