import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useUserData();
  
  const displayName = profile?.display_name || profile?.name || user?.email?.split("@")[0] || t('common.user');

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="B-LINE-IT" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              {user ? `${t('dashboard.welcome')}, ${displayName}` : "B-LINE-IT"}
            </h1>
            <p className="text-xs text-muted-foreground">{t('common.tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/search')}>
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle size="sm" />
          <LanguageSelector variant="icon" />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
