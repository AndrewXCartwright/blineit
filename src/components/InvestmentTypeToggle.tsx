import { Gem, Landmark, Info } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InvestmentInfoModal } from "./InvestmentInfoModal";

export type InvestmentType = "equity" | "debt";

interface InvestmentTypeToggleProps {
  value: InvestmentType;
  onChange: (type: InvestmentType) => void;
}

export function InvestmentTypeToggle({ value, onChange }: InvestmentTypeToggleProps) {
  const { t } = useTranslation();
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowInfoModal(true)}
          className="absolute -top-1 -right-1 z-10 p-1.5 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={t('investmentType.learnAbout')}
        >
          <Info className="w-4 h-4" />
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Equity Toggle */}
          <button
            onClick={() => onChange("equity")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              value === "equity"
                ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                : "border-border bg-secondary/50 hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl ${value === "equity" ? "bg-purple-500" : "bg-purple-500/30"}`}>
                <Gem className={`w-5 h-5 ${value === "equity" ? "text-white" : "text-purple-400"}`} />
              </div>
              <span className="font-display font-bold text-foreground">{t('investmentType.equity')}</span>
            </div>
            <p className="text-sm font-semibold text-purple-400 mb-1">{t('investmentType.ownIt')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('investmentType.equityDescription')}
            </p>
          </button>

          {/* Debt Toggle */}
          <button
            onClick={() => onChange("debt")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              value === "debt"
                ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                : "border-border bg-secondary/50 hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl ${value === "debt" ? "bg-blue-500" : "bg-blue-500/30"}`}>
                <Landmark className={`w-5 h-5 ${value === "debt" ? "text-white" : "text-blue-400"}`} />
              </div>
              <span className="font-display font-bold text-foreground">{t('investmentType.debt')}</span>
            </div>
            <p className="text-sm font-semibold text-blue-400 mb-1">{t('investmentType.lendIt')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('investmentType.debtDescription')}
            </p>
          </button>
        </div>
      </div>

      <InvestmentInfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
    </>
  );
}
