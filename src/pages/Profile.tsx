import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Trophy, Target, Building2 } from "lucide-react";

const stats = [
  { icon: Building2, label: "Properties", value: "4" },
  { icon: Target, label: "Total Bets", value: "42" },
  { icon: Trophy, label: "Win Rate", value: "67%" },
];

const menuItems = [
  { icon: Settings, label: "Account Settings", action: () => {} },
  { icon: Bell, label: "Notifications", action: () => {} },
  { icon: Shield, label: "Security", action: () => {} },
  { icon: HelpCircle, label: "Help & Support", action: () => {} },
];

export default function Profile() {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary glow-primary flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            Alex Johnson
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            alex.johnson@email.com
          </p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full gradient-gold text-accent-foreground text-sm font-medium">
            <Trophy className="w-4 h-4" />
            Pro Investor
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-xl p-4 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Menu */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors animate-fade-in">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </main>
    </div>
  );
}
