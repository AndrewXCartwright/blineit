import { useNavigate } from "react-router-dom";

interface QuickAction {
  icon: string;
  label: string;
  route: string;
}

const actions: QuickAction[] = [
  { icon: "🧮", label: "Calculators", route: "/calculators" },
  { icon: "👥", label: "Community", route: "/community" },
  { icon: "👁️", label: "Watchlist", route: "/watchlist" },
  { icon: "💡", label: "Insights", route: "/insights" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <span className="text-sm font-semibold text-foreground">
          ⚡ Quick Actions
        </span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="cursor-pointer transition-all duration-200 bg-card hover:bg-accent border border-border hover:border-[#00d4aa] rounded-xl py-4 px-2 text-center hover:-translate-y-0.5"
          >
            {/* Icon */}
            <div className="mb-2 text-2xl">
              {action.icon}
            </div>

            {/* Label */}
            <p className="text-[10px] font-semibold text-muted-foreground">
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
