import { useState } from "react";
import { Star, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SponsorReviewModal } from "./SponsorReviewModal";

interface SponsorReviewPromptProps {
  sponsorId: string;
  sponsorName: string;
  sponsorLogoUrl?: string;
  dealId?: string;
  dealName?: string;
  onDismiss?: () => void;
}

export function SponsorReviewPrompt({
  sponsorId,
  sponsorName,
  sponsorLogoUrl,
  dealId,
  dealName,
  onDismiss,
}: SponsorReviewPromptProps) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <>
      <Card className="border-2 border-warning/30 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Sponsor Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
              {sponsorLogoUrl ? (
                <img 
                  src={sponsorLogoUrl} 
                  alt={sponsorName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    Rate Your Experience
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    You invested with <span className="font-medium text-foreground">{sponsorName}</span>
                    {dealName && (
                      <> in <span className="font-medium text-foreground">{dealName}</span></>
                    )}. How was your experience?
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setShowModal(true)}>
                  Leave a Review
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SponsorReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        sponsorId={sponsorId}
        sponsorName={sponsorName}
        dealId={dealId}
        dealName={dealName}
        onSuccess={handleDismiss}
      />
    </>
  );
}
