import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface SampleOffering {
  id: string;
  image: string;
  name: string;
  sponsor: string;
  offeringSize: number;
  minInvestment: number;
  targetReturn: string;
  duration: string;
  fundedPercent: number;
  status: 'funding' | 'coming_soon' | 'closed';
}

interface AvailableOfferingCardProps {
  offering: SampleOffering;
}

export function AvailableOfferingCard({ offering }: AvailableOfferingCardProps) {
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fundedAmount = (offering.offeringSize * offering.fundedPercent) / 100;

  const statusConfig = {
    funding: { label: 'FUNDING', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    coming_soon: { label: 'COMING SOON', className: 'bg-muted text-muted-foreground border-border' },
    closed: { label: 'CLOSED', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const status = statusConfig[offering.status];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={offering.image} 
          alt={offering.name}
          className="w-full h-full object-cover"
        />
        <Badge 
          variant="outline" 
          className={`absolute top-2 right-2 ${status.className}`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground line-clamp-1">{offering.name}</h4>
          <p className="text-xs text-muted-foreground">{offering.sponsor}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Target Return</p>
            <p className="font-semibold text-primary">{offering.targetReturn}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{offering.duration}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Minimum</p>
            <p className="font-medium text-foreground">{formatCurrency(offering.minInvestment)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Offering Size</p>
            <p className="font-medium text-foreground">{formatCurrency(offering.offeringSize)}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{offering.fundedPercent}% funded</span>
            <span className="text-muted-foreground">{formatCurrency(fundedAmount)} / {formatCurrency(offering.offeringSize)}</span>
          </div>
          <Progress value={offering.fundedPercent} className="h-2" />
        </div>

        {/* CTA */}
        <Button 
          className="w-full" 
          size="sm"
          disabled={offering.status === 'closed'}
          onClick={() => navigate(`/offerings/${offering.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
