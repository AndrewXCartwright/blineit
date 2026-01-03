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
            className={`cursor-pointer transition-colors text-xs pb-1.5 bg-transparent border-0 border-b-2 ${
              activeTab === tab.id
                ? "text-foreground border-bull"
                : "text-muted-foreground border-transparent"
            }`}
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
              className={`flex items-center gap-2.5 py-2.5 ${
                index < activities.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex items-center justify-center font-semibold flex-shrink-0 w-9 h-9 rounded-full gradient-bull text-xs text-white">
                {activity.initials}
              </div>

              {/* Text */}
              <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-bold text-bull">
                  {activity.user}
                </span>{" "}
                {activity.action}
              </p>

              {/* Time */}
              <span className="text-[9px] text-muted-foreground">
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
              className={`flex items-center gap-3 py-2.5 ${
                index < newsItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-[60px] h-[60px] bg-muted rounded-lg" />

              {/* Text */}
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1 text-xs">
                  {news.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {news.meta}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab Content */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-2 gap-2.5">
          {platformStats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-card border border-border rounded-[10px] py-3.5 px-2.5"
            >
              <p className="font-semibold text-foreground text-base">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground">
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
