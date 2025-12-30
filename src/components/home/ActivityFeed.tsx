import { useState } from "react";

type TabType = "activity" | "news" | "stats";

const activities = [
  { initials: "MK", user: "@MikeK", action: "just invested $5,000 in Austin Mixed-Use", time: "2m" },
  { initials: "SJ", user: "@SarahJ", action: "won $1,200 on Miami occupancy bet", time: "8m" },
  { initials: "TC", user: "@TomC", action: "is now following GreenGrid Solar", time: "15m" },
];

const newsItems = [
  { title: "Miami Real Estate Market Hits Record Highs", meta: "Market News • 1h ago" },
  { title: "New Tax Benefits for Real Estate Investors", meta: "Regulations • 3h ago" },
  { title: "GreenGrid Solar Announces Expansion Plans", meta: "Startups • 5h ago" },
];

const platformStats = [
  { value: "$124M", label: "Total Invested" },
  { value: "12,847", label: "Active Users" },
  { value: "89", label: "Properties Listed" },
  { value: "234", label: "Predictions Active" },
];

const ActivityFeed = () => {
  const [activeTab, setActiveTab] = useState<TabType>("activity");

  const tabs: { id: TabType; label: string }[] = [
    { id: "activity", label: "Activity" },
    { id: "news", label: "News" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div className="mb-4">
      {/* Tabs Row */}
      <div className="flex gap-4 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="cursor-pointer transition-colors"
            style={{
              fontSize: "12px",
              paddingBottom: "6px",
              color: activeTab === tab.id ? "white" : "#666",
              borderBottom: activeTab === tab.id ? "2px solid #00d4aa" : "2px solid transparent",
              background: "none",
              border: "none",
              borderBottomStyle: "solid",
              borderBottomWidth: "2px",
              borderBottomColor: activeTab === tab.id ? "#00d4aa" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity Tab Content */}
      {activeTab === "activity" && (
        <div>
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5"
              style={{
                padding: "10px 0",
                borderBottom: index < activities.length - 1 ? "1px solid #1e1e32" : "none",
              }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center font-semibold flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00d4aa, #00a8cc)",
                  fontSize: "12px",
                  color: "white",
                }}
              >
                {activity.initials}
              </div>

              {/* Text */}
              <p
                className="flex-1"
                style={{
                  fontSize: "11px",
                  lineHeight: 1.4,
                  color: "#ccc",
                }}
              >
                <span className="font-bold" style={{ color: "#00d4aa" }}>
                  {activity.user}
                </span>{" "}
                {activity.action}
              </p>

              {/* Time */}
              <span style={{ fontSize: "9px", color: "#666" }}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* News Tab Content */}
      {activeTab === "news" && (
        <div>
          {newsItems.map((news, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              style={{
                padding: "10px 0",
                borderBottom: index < newsItems.length - 1 ? "1px solid #1e1e32" : "none",
              }}
            >
              {/* Thumbnail */}
              <div
                className="flex-shrink-0"
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#2a2a4a",
                  borderRadius: "8px",
                }}
              />

              {/* Text */}
              <div className="flex-1">
                <p
                  className="font-semibold text-white mb-1"
                  style={{ fontSize: "12px" }}
                >
                  {news.title}
                </p>
                <p style={{ fontSize: "10px", color: "#666" }}>
                  {news.meta}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab Content */}
      {activeTab === "stats" && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {platformStats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              style={{
                background: "#0f0f1a",
                borderRadius: "10px",
                padding: "14px 10px",
              }}
            >
              <p
                className="font-semibold text-white"
                style={{ fontSize: "16px" }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: "10px", color: "#666" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
