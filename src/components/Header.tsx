import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Bot, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useMessageGroups } from "@/hooks/useMessageGroups";
import { useConversations } from "@/hooks/useMessages";
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
  
  const { groups } = useMessageGroups();
  const { conversations } = useConversations();
  
  const displayName = profile?.display_name || profile?.name || user?.email?.split("@")[0] || t('common.user');
  
  // Calculate total unread messages
  const totalUnread = (groups?.reduce((sum, g) => sum + (g.unread_count || 0), 0) || 0) + 
    (conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0);

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-3 sm:px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
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
            onClick={() => navigate('/advisor')}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label="AI Investment Advisor"
          >
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/search')}
            className="h-9 w-9 sm:h-10 sm:w-10"
            aria-label={t("common.search", "Search")}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/messages')}
            className="h-9 w-9 sm:h-10 sm:w-10 relative"
            aria-label="Messages"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </Button>
          <ThemeToggle size="sm" />
          <LanguageSelector variant="icon" />
          <NotificationBell />
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
