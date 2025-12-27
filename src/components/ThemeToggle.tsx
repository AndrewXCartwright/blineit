import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300",
        "border border-border/50 hover:border-primary/30",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative">
        {theme === "dark" ? (
          <Moon className={cn(iconSizes[size], "text-primary transition-transform duration-300")} />
        ) : (
          <Sun className={cn(iconSizes[size], "text-accent transition-transform duration-300")} />
        )}
      </div>
    </button>
  );
}

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300",
          theme === "dark" 
            ? "bg-primary/20 border-primary text-foreground" 
            : "bg-secondary/50 border-border/50 text-muted-foreground hover:border-border"
        )}
      >
        <Moon className="w-5 h-5" />
        <span className="font-medium">Dark</span>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300",
          theme === "light" 
            ? "bg-primary/20 border-primary text-foreground" 
            : "bg-secondary/50 border-border/50 text-muted-foreground hover:border-border"
        )}
      >
        <Sun className="w-5 h-5" />
        <span className="font-medium">Light</span>
      </button>
    </div>
  );
}
