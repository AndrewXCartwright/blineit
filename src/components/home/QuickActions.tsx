import { useNavigate } from "react-router-dom";
import { Calculator, Users, Eye, Lightbulb, LucideIcon } from "lucide-react";
interface QuickAction {
  icon: LucideIcon | string;
  label: string;
  route: string;
}
const actions: QuickAction[] = [{
  icon: Calculator,
  label: "Calculators",
  route: "/calculators"
}, {
  icon: Users,
  label: "Community",
  route: "/community"
}, {
  icon: Eye,
  label: "Watchlist",
  route: "/watchlist"
}, {
  icon: Lightbulb,
  label: "Insights",
  route: "/insights"
}];
const QuickActions = () => {
  const navigate = useNavigate();
  return <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <span className="text-sm font-semibold text-foreground">
          ⚡ Quick Actions
        </span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((action, index) => <button key={index} onClick={() => navigate(action.route)} className="cursor-pointer transition-all duration-200 bg-card hover:bg-accent border border-border hover:border-bull rounded-xl py-4 px-2 text-center hover:-translate-y-0.5">
            {/* Icon */}
            <div className="mb-2 text-2xl flex items-center justify-center">
              {typeof action.icon === "string" ? action.icon : <action.icon size={24} className="text-bull" />}
            </div>

            {/* Label */}
            <p className="font-semibold text-muted-foreground text-sm">
              {action.label}
            </p>
          </button>)}
      </div>
    </div>;
};
export default QuickActions;