import { useState, ReactNode, useEffect, useRef } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function AnimatedTabs({ tabs, defaultTab, className = "" }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const prevTabIndexRef = useRef(0);

  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab);

  useEffect(() => {
    if (activeTabIndex !== prevTabIndexRef.current) {
      setDirection(activeTabIndex > prevTabIndexRef.current ? "right" : "left");
      prevTabIndexRef.current = activeTabIndex;
    }
  }, [activeTabIndex]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content with animation */}
      <div className="mt-4 overflow-hidden">
        <div
          key={activeTab}
          className={`animate-fade-in ${
            direction === "right" ? "tab-content-enter" : "tab-content-enter"
          }`}
        >
          {activeContent}
        </div>
      </div>
    </div>
  );
}
