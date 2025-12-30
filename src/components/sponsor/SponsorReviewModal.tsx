import { useState } from "react";
import { Star, MessageCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SponsorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorId: string;
  sponsorName: string;
  dealId?: string;
  dealName?: string;
  onSuccess?: () => void;
}

interface RatingCategory {
  key: string;
  label: string;
  value: number;
}

export function SponsorReviewModal({
  isOpen,
  onClose,
  sponsorId,
  sponsorName,
  dealId,
  dealName,
  onSuccess,
}: SponsorReviewModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showName, setShowName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [categoryRatings, setCategoryRatings] = useState<RatingCategory[]>([
    { key: "communication", label: "Communication", value: 0 },
    { key: "transparency", label: "Transparency", value: 0 },
    { key: "returns", label: "Returns vs Projections", value: 0 },
    { key: "professionalism", label: "Professionalism", value: 0 },
  ]);

  const [categoryHover, setCategoryHover] = useState<Record<string, number>>({});

  const handleCategoryRating = (key: string, value: number) => {
    setCategoryRatings(prev => 
      prev.map(cat => cat.key === key ? { ...cat, value } : cat)
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select an overall rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("submit_sponsor_review", {
        p_sponsor_id: sponsorId,
        p_deal_id: dealId || null,
        p_overall_rating: overallRating,
        p_communication_rating: categoryRatings.find(c => c.key === "communication")?.value || null,
        p_transparency_rating: categoryRatings.find(c => c.key === "transparency")?.value || null,
        p_returns_rating: categoryRatings.find(c => c.key === "returns")?.value || null,
        p_professionalism_rating: categoryRatings.find(c => c.key === "professionalism")?.value || null,
        p_review_text: reviewText.trim() || null,
        p_show_name: showName,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || "Failed to submit review");
      }

      toast({
        title: "Review submitted!",
        description: result.message || "Your review will be published after a brief review period.",
      });

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setOverallRating(0);
    setHoverRating(0);
    setReviewText("");
    setShowName(false);
    setCategoryRatings(prev => prev.map(cat => ({ ...cat, value: 0 })));
  };

  const renderStars = (
    rating: number, 
    hover: number, 
    onRate: (value: number) => void,
    onHover: (value: number) => void,
    size: "lg" | "sm" = "sm"
  ) => {
    const starSize = size === "lg" ? "w-8 h-8" : "w-5 h-5";
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= (hover || rating)
                  ? "text-warning fill-warning"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            How was your experience with {sponsorName}?
            {dealName && (
              <span className="block mt-1 text-foreground font-medium">
                Deal: {dealName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="text-center space-y-3">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <div className="flex justify-center">
              {renderStars(
                overallRating,
                hoverRating,
                setOverallRating,
                setHoverRating,
                "lg"
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {overallRating === 0 && "Select a rating"}
              {overallRating === 1 && "Poor"}
              {overallRating === 2 && "Fair"}
              {overallRating === 3 && "Good"}
              {overallRating === 4 && "Very Good"}
              {overallRating === 5 && "Excellent"}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-sm text-muted-foreground">
              Rate specific areas (optional)
            </Label>
            <div className="grid gap-3">
              {categoryRatings.map((category) => (
                <div 
                  key={category.key}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <span className="text-sm font-medium">{category.label}</span>
                  {renderStars(
                    category.value,
                    categoryHover[category.key] || 0,
                    (value) => handleCategoryRating(category.key, value),
                    (value) => setCategoryHover(prev => ({ ...prev, [category.key]: value }))
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="review-text">Your Review (optional)</Label>
              <span className="text-xs text-muted-foreground">
                {reviewText.length}/500
              </span>
            </div>
            <Textarea
              id="review-text"
              placeholder="Share your experience with this sponsor..."
              rows={4}
              maxLength={500}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {showName ? (
                <Eye className="w-5 h-5 text-primary" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {showName ? "Show my name" : "Post as 'Verified Investor'"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {showName 
                    ? "Your name will be visible with your review" 
                    : "Your identity will be kept private"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={showName}
              onCheckedChange={setShowName}
            />
          </div>

          {/* Info Note */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Your review will be posted as a "Verified Investor" after a 24-hour review period.
              Only investors who have invested with this sponsor can leave reviews.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || overallRating === 0}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
