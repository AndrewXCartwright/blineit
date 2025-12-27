import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

export function Header() {
  const { user } = useAuth();
  const { profile } = useUserData();
  
  const displayName = profile?.display_name || profile?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center glow-primary">
            <span className="text-xl">🐝</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              {user ? `Welcome back, ${displayName}` : "B-LINE-IT"}
            </h1>
            <p className="text-xs text-muted-foreground">Real Estate Tokenization</p>
          </div>
        </div>
        <button className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </button>
      </div>
    </header>
  );
}
