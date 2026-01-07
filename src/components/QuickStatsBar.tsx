import { useTranslation } from "react-i18next";
import type { InvestmentType } from "./InvestmentTypeToggle";
interface QuickStatsBarProps {
  investmentType: InvestmentType;
}
export function QuickStatsBar({
  investmentType
}: QuickStatsBarProps) {
  const {
    t
  } = useTranslation();
  const equityStats = [{
    key: "avgReturn",
    label: t("quickStats.avgReturn"),
    value: "14.2%"
  }, {
    key: "properties",
    label: t("quickStats.properties"),
    value: "73"
  }, {
    key: "investors",
    label: t("quickStats.investors"),
    value: "12,400"
  }];
  const debtStats = [{
    key: "avgApy",
    label: t("quickStats.avgApy"),
    value: "10.8%"
  }, {
    key: "loans",
    label: t("quickStats.loans"),
    value: "45"
  }, {
    key: "defaultRate",
    label: t("quickStats.defaultRate"),
    value: "0.3%"
  }];
  const stats = investmentType === "equity" ? equityStats : debtStats;
  return <div className={`flex items-center justify-between p-3 rounded-xl ${investmentType === "equity" ? "bg-purple-500/10 border border-purple-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
      {stats.map((stat, index) => <div key={stat.key} className="flex-1 text-center">
          <p className={`text-sm font-bold ${investmentType === "equity" ? "text-purple-400" : "text-blue-400"}`}>
            {stat.value}
          </p>
          <p className="text-muted-foreground text-base">{stat.label}</p>
          {index < stats.length - 1 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-border/50 hidden" />}
        </div>)}
    </div>;
}