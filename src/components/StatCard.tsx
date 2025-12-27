import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down";
}

export function StatCard({ icon, label, value, subValue, trend }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-xl bg-primary/20 text-primary">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === "up" 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          }`}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-display font-bold text-lg text-foreground">{value}</p>
      {subValue && (
        <p className={`text-xs mt-1 ${
          trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
        }`}>
          {subValue}
        </p>
      )}
    </div>
  );
}
