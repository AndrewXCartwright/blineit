import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, CheckCircle2, Star, TrendingUp, DollarSign, 
  MessageCircle, ChevronRight, Briefcase 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorReviewModal } from "@/components/sponsor/SponsorReviewModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface SponsorInfo {
  id: string;
  companyName: string;
  logoUrl?: string;
  isVerified: boolean;
  yearsInBusiness: number;
  totalDeals: number;
  averageRating: number;
  reviewCount: number;
  totalCapitalRaised: number;
  averageIrr: number;
  bio: string;
}

interface SponsorCardProps {
  sponsor: SponsorInfo;
  propertyName?: string;
  dealId?: string;
  hasInvested?: boolean;
}

export function SponsorCard({ sponsor, propertyName, dealId, hasInvested = false }: SponsorCardProps) {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sending, setSending] = useState(false);

  const truncatedBio = sponsor.bio.length > 150 
    ? sponsor.bio.slice(0, 150) + "..." 
    : sponsor.bio;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your message to the sponsor",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: `Your inquiry has been sent to ${sponsor.companyName}`,
    });
    
    setShowInquiryModal(false);
    setInquirySubject("");
    setInquiryMessage("");
    setSending(false);
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-5 border-2 border-primary/30 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="w-15 h-15 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/20">
            {sponsor.logoUrl ? (
              <img 
                src={sponsor.logoUrl} 
                alt={sponsor.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-7 h-7 text-primary" />
            )}
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/sponsors/${sponsor.id}`}
                className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors truncate"
              >
                {sponsor.companyName}
              </Link>
              {sponsor.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {sponsor.yearsInBusiness} years
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                {sponsor.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-secondary/50">
          <div className="text-center">
            <div className="text-lg font-display font-bold text-foreground">
              {sponsor.totalDeals}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              🏢 Deals
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-display font-bold text-foreground">
              {formatCurrency(sponsor.totalCapitalRaised)}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              💰 Raised
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-display font-bold text-foreground">
              {sponsor.averageRating.toFixed(1)}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              ⭐ Rating
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-display font-bold text-success">
              {sponsor.averageIrr}%
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              📈 Avg IRR
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {showFullBio ? sponsor.bio : truncatedBio}
            {sponsor.bio.length > 150 && (
              <button 
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-primary font-medium ml-1 hover:underline"
              >
                {showFullBio ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-3">
            <Link 
              to={`/sponsors/${sponsor.id}`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                View Full Profile
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button 
              onClick={() => setShowInquiryModal(true)}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Sponsor
            </Button>
          </div>
          
          {/* Rate Sponsor Button - only show if invested */}
          {hasInvested && (
            <Button 
              variant="secondary"
              className="w-full"
              onClick={() => setShowReviewModal(true)}
            >
              <Star className="w-4 h-4 mr-2" />
              Rate This Sponsor
            </Button>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Contact {sponsor.companyName}
            </DialogTitle>
            <DialogDescription>
              Send a message to the sponsor about {propertyName || "this property"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Question about the investment..."
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="I'm interested in learning more about this property..."
                rows={4}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInquiry} disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <SponsorReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        sponsorId={sponsor.id}
        sponsorName={sponsor.companyName}
        dealId={dealId}
        dealName={propertyName}
      />
    </>
  );
}
