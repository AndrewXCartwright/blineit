import { Home, Layers, Target, Wallet, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: Layers, label: t('common.explore'), path: "/assets" },
    { icon: Target, label: t('nav.predict'), path: "/predict" },
    { icon: Wallet, label: t('nav.wallet'), path: "/wallet" },
    { icon: User, label: t('nav.profile'), path: "/profile" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 pb-safe"
      role="navigation"
      aria-label={t("nav.mainNavigation", "Main navigation")}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === "/assets" && location.pathname.startsWith("/assets"));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? "text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive ? "gradient-primary" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`} aria-hidden="true" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
