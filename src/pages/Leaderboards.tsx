import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";

type TabType = "investors" | "sponsors" | "properties" | "startups";

const investorsData = [
  { id: "1", name: "CryptoWhale_42", stat: "$2.4M invested", secondary: "47 properties" },
  { id: "2", name: "DiamondHands", stat: "$1.8M invested", secondary: "32 properties" },
  { id: "3", name: "PropTech_Pro", stat: "$1.2M invested", secondary: "28 properties" },
  { id: "4", name: "RealEstateKing", stat: "$980K invested", secondary: "24 properties" },
  { id: "5", name: "TokenMaster", stat: "$875K invested", secondary: "21 properties" },
  { id: "6", name: "BlockchainBob", stat: "$720K invested", secondary: "18 properties" },
  { id: "7", name: "CryptoQueen", stat: "$650K invested", secondary: "16 properties" },
  { id: "8", name: "InvestorPro", stat: "$580K invested", secondary: "14 properties" },
  { id: "9", name: "WealthBuilder", stat: "$520K invested", secondary: "12 properties" },
  { id: "10", name: "SmartMoney", stat: "$450K invested", secondary: "10 properties" },
];

const sponsorsData = [
  { id: "sponsor-1", name: "Meridian RE", stat: "14 properties", secondary: "$45M raised" },
  { id: "sponsor-2", name: "GreenGrid", stat: "11 properties", secondary: "$32M raised" },
  { id: "sponsor-3", name: "Apex Capital", stat: "9 properties", secondary: "$28M raised" },
  { id: "sponsor-4", name: "Urban Ventures", stat: "8 properties", secondary: "$24M raised" },
  { id: "sponsor-5", name: "Skyline Partners", stat: "7 properties", secondary: "$21M raised" },
  { id: "sponsor-6", name: "Metro Investments", stat: "6 properties", secondary: "$18M raised" },
  { id: "sponsor-7", name: "Coastal Realty", stat: "5 properties", secondary: "$15M raised" },
  { id: "sponsor-8", name: "Summit Holdings", stat: "5 properties", secondary: "$14M raised" },
  { id: "sponsor-9", name: "Prime Estates", stat: "4 properties", secondary: "$12M raised" },
  { id: "sponsor-10", name: "Horizon Group", stat: "4 properties", secondary: "$10M raised" },
];

const propertiesData = [
  { id: "prop-1", name: "Austin Mixed-Use", stat: "+34% this week", secondary: "94% funded" },
  { id: "prop-2", name: "Miami Beach Condo", stat: "+28% this week", secondary: "100% funded" },
  { id: "prop-3", name: "Denver Multifamily", stat: "+22% this week", secondary: "87% funded" },
  { id: "prop-4", name: "Seattle Tech Hub", stat: "+19% this week", secondary: "92% funded" },
  { id: "prop-5", name: "Nashville Retail", stat: "+17% this week", secondary: "78% funded" },
  { id: "prop-6", name: "Phoenix Industrial", stat: "+15% this week", secondary: "85% funded" },
  { id: "prop-7", name: "LA Downtown Loft", stat: "+14% this week", secondary: "100% funded" },
  { id: "prop-8", name: "Chicago Office", stat: "+12% this week", secondary: "71% funded" },
  { id: "prop-9", name: "Boston Brownstone", stat: "+11% this week", secondary: "89% funded" },
  { id: "prop-10", name: "Atlanta Mixed", stat: "+10% this week", secondary: "65% funded" },
];

const startupsData = [
  { id: "startup-1", name: "GreenGrid Solar", stat: "847 followers", secondary: "$12M raised" },
  { id: "startup-2", name: "PropChain", stat: "623 followers", secondary: "$8M raised" },
  { id: "startup-3", name: "TokenEstate", stat: "445 followers", secondary: "$5M raised" },
  { id: "startup-4", name: "RealtyDAO", stat: "392 followers", secondary: "$4.2M raised" },
  { id: "startup-5", name: "BlockBuild", stat: "345 followers", secondary: "$3.8M raised" },
  { id: "startup-6", name: "CryptoHomes", stat: "298 followers", secondary: "$3.2M raised" },
  { id: "startup-7", name: "DeFi Realty", stat: "267 followers", secondary: "$2.8M raised" },
  { id: "startup-8", name: "SmartLease", stat: "234 followers", secondary: "$2.4M raised" },
  { id: "startup-9", name: "PropToken", stat: "198 followers", secondary: "$2.1M raised" },
  { id: "startup-10", name: "EstateChain", stat: "167 followers", secondary: "$1.8M raised" },
];

const tabs: { id: TabType; label: string }[] = [
  { id: "investors", label: "Investors" },
  { id: "sponsors", label: "Sponsors" },
  { id: "properties", label: "Properties" },
  { id: "startups", label: "Startups" },
];

export default function Leaderboards() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "investors";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getData = () => {
    switch (activeTab) {
      case "investors": return investorsData;
      case "sponsors": return sponsorsData;
      case "properties": return propertiesData;
      case "startups": return startupsData;
      default: return [];
    }
  };

  const handleItemClick = (item: { id: string; name: string }) => {
    switch (activeTab) {
      case "investors":
        navigate(`/user/${item.id}`);
        break;
      case "sponsors":
        navigate(`/sponsors/${item.id}`);
        break;
      case "properties":
        navigate(`/explore`);
        break;
      case "startups":
        navigate(`/community`);
        break;
    }
  };

  const data = getData();

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-foreground mb-6">🏆 Leaderboards</h1>

        {/* Tabs Row */}
        <div className="flex gap-5 mb-5 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`bg-transparent border-none text-sm font-medium pb-3 cursor-pointer transition-colors -mb-px ${
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-[#00d4aa]"
                  : "text-muted-foreground border-b-2 border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ranked List */}
        {data.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No {activeTab} to display yet
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.map((item, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl cursor-pointer transition-all duration-200 hover:border-[#00d4aa]"
                >
                  {/* Rank Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isTopThree
                        ? "bg-gradient-to-br from-[#ffd700] to-[#ffb800] text-black"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Avatar/Icon */}
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                    {item.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#00d4aa] m-0 mt-0.5">
                      {item.stat}
                    </p>
                    <p className="text-[11px] text-muted-foreground m-0 mt-0.5">
                      {item.secondary}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
