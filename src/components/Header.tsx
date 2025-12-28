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
    <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-3 sm:px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <img 
            src={logo} 
            alt="B-LINE-IT" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain flex-shrink-0" 
          />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm sm:text-lg text-foreground truncate">
              {user ? `${t('dashboard.welcome')}, ${displayName}` : "B-LINE-IT"}
            </h1>
            <p className="text-xs text-muted-foreground truncate hidden xs:block">{t('common.tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/search')}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label={t("common.search", "Search")}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <ThemeToggle size="sm" />
          <LanguageSelector variant="icon" />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
