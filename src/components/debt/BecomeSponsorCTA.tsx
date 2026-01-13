import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BecomeSponsorCTAProps {
  investmentTitle: string;
}

export function BecomeSponsorCTA({ investmentTitle }: BecomeSponsorCTAProps) {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl p-5 border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            Are You a Sponsor?
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Have {investmentTitle} opportunities to offer investors? List your offerings on B Line It and access our network of accredited investors.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/sponsor/register')}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Learn About Becoming a Sponsor
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
