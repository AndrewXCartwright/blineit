import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, AlertTriangle, Gem, Landmark } from "lucide-react";

interface InvestmentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentInfoModal({ isOpen, onClose }: InvestmentInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            Equity vs Debt Investing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Equity Section */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-purple-500">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">EQUITY</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Share in property appreciation</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Receive rental income dividends</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Voting rights on major decisions</span>
              </div>
              <div className="flex items-start gap-2 mt-3 pt-2 border-t border-purple-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Value can go down</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Returns vary</span>
              </div>
            </div>
          </div>

          {/* Debt Section */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-500">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">DEBT</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Fixed, predictable returns</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Secured by real asset (1st lien)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Priority over equity in default</span>
              </div>
              <div className="flex items-start gap-2 mt-3 pt-2 border-t border-blue-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">No upside if property booms</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Capped returns</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
