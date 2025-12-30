import { MapPin, TrendingUp, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface SponsorInfo {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  isVerified?: boolean;
}

interface PropertyCardProps {
  id?: string;
  name: string;
  location: string;
  tokens: number;
  yield: number;
  value: number;
  image?: string;
  sponsor?: SponsorInfo | null;
}

export function PropertyCard({ id, name, location, tokens, yield: yieldPercent, value, sponsor }: PropertyCardProps) {
  return (
    <div className="min-w-[200px] glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="h-24 gradient-primary relative">
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        
        {/* Sponsor Logo */}
        {sponsor && (
          <Link 
            to={`/sponsors/${sponsor.id}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 z-10"
          >
            {sponsor.logoUrl ? (
              <img 
                src={sponsor.logoUrl} 
                alt={sponsor.companyName}
                className="w-8 h-8 rounded-full border-2 border-background object-cover bg-background"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {sponsor.companyName.charAt(0)}
              </div>
            )}
          </Link>
        )}
        
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-display font-semibold text-sm text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
          {/* Sponsor Name */}
          {sponsor && (
            <Link 
              to={`/sponsors/${sponsor.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
            >
              <span className="truncate">By {sponsor.companyName}</span>
              {sponsor.isVerified && <BadgeCheck className="w-3 h-3 flex-shrink-0" />}
            </Link>
          )}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Tokens</span>
          <span className="text-sm font-semibold text-foreground">{tokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Yield</span>
          <span className="text-sm font-semibold text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {yieldPercent}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Value</span>
          <span className="text-sm font-semibold text-foreground">${value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
