import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Building2, Landmark, Target, Users, 
  ClipboardList, Receipt, Settings, ArrowLeft, ShieldCheck, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Building2, label: "Properties", path: "/admin/properties" },
  { icon: Landmark, label: "Loans", path: "/admin/loans" },
  { icon: Target, label: "Predictions", path: "/admin/predictions" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: ShieldCheck, label: "KYC Reviews", path: "/admin/kyc" },
  { icon: Gift, label: "Referrals", path: "/admin/referrals" },
  { icon: ClipboardList, label: "Waitlists", path: "/admin/waitlists" },
  { icon: Receipt, label: "Transactions", path: "/admin/transactions" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐝</span>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">B-LINE-IT</h1>
            <p className="text-xs text-amber-500 font-medium">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </button>
      </div>
    </aside>
  );
}
