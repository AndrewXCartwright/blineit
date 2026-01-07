import { Info } from "lucide-react";
import type { ExampleOffering } from "@/data/investmentTypes";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExampleOfferingCardProps {
  offering: ExampleOffering;
}

export function ExampleOfferingCard({ offering }: ExampleOfferingCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative rounded-2xl border border-dashed border-primary/30 bg-primary/5 overflow-hidden">
      {/* Example watermark */}
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
          <Info className="w-3 h-3 mr-1" />
          Example Offering
        </Badge>
      </div>

      <div className="p-5">
        <h4 className="font-display font-bold text-lg text-foreground pr-28 mb-1">
          {offering.name}
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Sponsor: {offering.sponsor}
        </p>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Offering Size</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(offering.offeringSize)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Token Price</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(offering.tokenPrice)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(offering.minimumInvestment)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Target Return</p>
            <p className="text-lg font-bold text-primary">{offering.targetReturn}</p>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground">Expected Duration</p>
          <p className="text-base font-semibold text-foreground">{offering.duration}</p>
        </div>

        {/* Additional details */}
        <div className="space-y-2 mb-4">
          {Object.entries(offering.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Sample asset accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="sample" className="border-t border-border/50">
            <AccordionTrigger className="text-sm font-semibold py-3">
              Sample Asset in Portfolio
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-background/50 rounded-lg p-3 space-y-2">
                <p className="font-semibold text-foreground text-sm mb-2">
                  {offering.sampleAsset.name}
                </p>
                {Object.entries(offering.sampleAsset.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
