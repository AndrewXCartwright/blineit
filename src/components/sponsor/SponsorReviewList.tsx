import { useState } from "react";
import { Star, Flag, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: string;
  investorName: string;
  isVerified: boolean;
  overallRating: number;
  communicationRating?: number;
  transparencyRating?: number;
  returnsRating?: number;
  professionalismRating?: number;
  reviewText?: string;
  dealName?: string;
  createdAt: string;
}

interface RatingSummary {
  averageOverall: number;
  averageCommunication: number;
  averageTransparency: number;
  averageReturns: number;
  averageProfessionalism: number;
  totalReviews: number;
}

interface SponsorReviewListProps {
  reviews: Review[];
  ratingSummary: RatingSummary;
  sponsorId: string;
}

export function SponsorReviewList({
  reviews,
  ratingSummary,
  sponsorId,
}: SponsorReviewListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const reviewsPerPage = 5;
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "text-warning fill-warning"
                : star - 0.5 <= rating
                ? "text-warning fill-warning/50"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleOpenReport = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for your report",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReport(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Report submitted",
      description: "Thank you for your feedback. We'll review this report.",
    });

    setReportModalOpen(false);
    setSelectedReviewId(null);
    setReportReason("");
    setReportDetails("");
    setSubmittingReport(false);
  };

  const ratingCategories = [
    { label: "Communication", value: ratingSummary.averageCommunication },
    { label: "Transparency", value: ratingSummary.averageTransparency },
    { label: "Returns vs Projections", value: ratingSummary.averageReturns },
    { label: "Professionalism", value: ratingSummary.averageProfessionalism },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-secondary/50">
            {/* Overall Rating */}
            <div className="text-center sm:border-r border-border sm:pr-6">
              <div className="font-display text-5xl font-bold text-foreground mb-1">
                {ratingSummary.averageOverall.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-1">
                {renderStars(ratingSummary.averageOverall, "lg")}
              </div>
              <div className="text-sm text-muted-foreground">
                {ratingSummary.totalReviews} {ratingSummary.totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="flex-1 space-y-3">
              {ratingCategories.map((category) => (
                <div key={category.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-40">
                    {category.label}
                  </span>
                  <div className="flex-1">
                    <Progress value={category.value * 20} className="h-2" />
                  </div>
                  <span className="text-sm font-medium text-foreground w-10 text-right">
                    {category.value > 0 ? category.value.toFixed(1) : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to share your experience
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {review.investorName}
                        </span>
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      {review.dealName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Invested in {review.dealName}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex gap-0.5 justify-end">
                        {renderStars(review.overallRating)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {review.reviewText && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {review.reviewText}
                    </p>
                  )}

                  {/* Category Ratings (if provided) */}
                  {(review.communicationRating || review.transparencyRating || 
                    review.returnsRating || review.professionalismRating) && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-border text-xs">
                      {review.communicationRating && (
                        <span className="text-muted-foreground">
                          Communication: <span className="text-foreground font-medium">{review.communicationRating}/5</span>
                        </span>
                      )}
                      {review.transparencyRating && (
                        <span className="text-muted-foreground">
                          Transparency: <span className="text-foreground font-medium">{review.transparencyRating}/5</span>
                        </span>
                      )}
                      {review.returnsRating && (
                        <span className="text-muted-foreground">
                          Returns: <span className="text-foreground font-medium">{review.returnsRating}/5</span>
                        </span>
                      )}
                      {review.professionalismRating && (
                        <span className="text-muted-foreground">
                          Professionalism: <span className="text-foreground font-medium">{review.professionalismRating}/5</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Report Button */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => handleOpenReport(review.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Flag className="w-3 h-3" />
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-destructive" />
              Report Review
            </DialogTitle>
            <DialogDescription>
              Help us maintain quality by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for report *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fake">Fake review</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional details (optional)</Label>
              <Textarea
                placeholder="Provide more context about your report..."
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSubmitReport}
              disabled={submittingReport || !reportReason}
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
