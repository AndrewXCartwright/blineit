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
        <span className="font-semibold" style={{ fontSize: "14px" }}>
          ⚡ Quick Actions
        </span>
      </div>

      {/* Grid Container */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1e1e32 0%, #252542 100%)",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "16px 8px",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#00d4aa";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2a2a4a";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <div
              className="mb-2"
              style={{ fontSize: "24px" }}
            >
              {action.icon}
            </div>

            {/* Label */}
            <p
              className="font-semibold"
              style={{ fontSize: "10px", color: "#ccc" }}
            >
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
