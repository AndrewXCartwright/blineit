import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Building2, CheckCircle2, MapPin, Globe, Linkedin, 
  MessageCircle, Star, Calendar, TrendingUp, Briefcase, DollarSign,
  Play, ChevronRight, Users, Target, Clock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";

interface Sponsor {
  id: string;
  companyName: string;
  logoUrl: string | null;
  isVerified: boolean;
  location: string;
  website: string | null;
  linkedIn: string | null;
  yearsInBusiness: number;
  totalDeals: number;
  totalCapitalRaised: number;
  averageRating: number;
  reviewCount: number;
  bio: string;
  investmentPhilosophy: string;
  teamHighlights: { name: string; role: string; experience: string }[];
  averageIrr: number;
  averageHoldPeriod: number;
  assetTypes: string[];
  geographicFocus: string[];
  videoUrl: string | null;
  ratings: {
    communication: number;
    transparency: number;
    returnsVsProjections: number;
    professionalism: number;
  };
}

const mockPastProjects = [
  {
    id: "1",
    name: "Sunset Gardens Apartments",
    location: "Tampa, FL",
    imageUrl: "",
    finalIrr: 22.4,
    holdPeriod: 3.5,
    exitDate: "2024",
  },
  {
    id: "2",
    name: "Industrial Park West",
    location: "Dallas, TX",
    imageUrl: "",
    finalIrr: 19.8,
    holdPeriod: 4.0,
    exitDate: "2024",
  },
  {
    id: "3",
    name: "Metro Mixed-Use Center",
    location: "Atlanta, GA",
    imageUrl: "",
    finalIrr: 16.2,
    holdPeriod: 5.0,
    exitDate: "2023",
  },
  {
    id: "4",
    name: "Coastal View Residences",
    location: "Miami, FL",
    imageUrl: "",
    finalIrr: 24.1,
    holdPeriod: 3.2,
    exitDate: "2023",
  },
];

const mockCurrentDeals = [
  {
    id: "deal-1",
    name: "Parkview Apartments",
    location: "Austin, TX",
    imageUrl: "",
    targetIrr: 17,
    raiseGoal: 5000000,
    amountRaised: 3250000,
    minimumInvestment: 500,
    status: "active",
  },
  {
    id: "deal-2",
    name: "Northgate Business Center",
    location: "Phoenix, AZ",
    imageUrl: "",
    targetIrr: 15,
    raiseGoal: 8000000,
    amountRaised: 6400000,
    minimumInvestment: 1000,
    status: "active",
  },
];

const mockReviews = [
  {
    id: "1",
    investorName: "Verified Investor",
    rating: 5,
    text: "Exceptional communication throughout the investment. Quarterly updates were detailed and transparent. Exceeded projected returns by 3%.",
    date: "2024-11-15",
    dealName: "Sunset Gardens Apartments",
  },
  {
    id: "2",
    investorName: "Michael R.",
    rating: 5,
    text: "Professional team that delivers on their promises. This was my third investment with Starwood and I continue to be impressed.",
    date: "2024-10-22",
    dealName: "Industrial Park West",
  },
  {
    id: "3",
    investorName: "Verified Investor",
    rating: 4,
    text: "Good returns and solid communication. Minor delays in distributions but they kept us informed. Would invest again.",
    date: "2024-09-18",
    dealName: "Metro Mixed-Use Center",
  },
  {
    id: "4",
    investorName: "Jennifer K.",
    rating: 5,
    text: "Best sponsor I've worked with on this platform. The level of detail in their reports is unmatched.",
    date: "2024-08-05",
  },
];

export default function SponsorProfile() {
  const { sponsorId } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  useEffect(() => {
    async function fetchSponsor() {
      if (!sponsorId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("sponsor_profiles")
        .select("*")
        .eq("id", sponsorId)
        .single();
      
      if (error || !data) {
        console.error("Error fetching sponsor:", error);
        setLoading(false);
        return;
      }

      // Get review count
      const { count: reviewCount } = await supabase
        .from("sponsor_reviews")
        .select("*", { count: 'exact', head: true })
        .eq("sponsor_id", sponsorId);

      // Extract location from business_address if available
      let location = 'United States';
      if (data.business_address) {
        // Try to parse city, state from address
        const addressParts = data.business_address.split(',');
        if (addressParts.length >= 2) {
          location = addressParts.slice(-2).join(',').trim();
        }
      }

      setSponsor({
        id: data.id,
        companyName: data.company_name,
        logoUrl: data.company_logo_url,
        isVerified: data.verification_status === 'verified',
        location,
        website: data.website_url,
        linkedIn: data.linkedin_url,
        yearsInBusiness: data.years_in_business || 0,
        totalDeals: data.deals_completed || 0,
        totalCapitalRaised: data.total_assets_managed || 0,
        averageRating: 4.5, // TODO: Calculate from reviews
        reviewCount: reviewCount || 0,
        bio: data.bio || '',
        investmentPhilosophy: data.investment_thesis || '',
        teamHighlights: [], // TODO: Fetch from team members table
        averageIrr: data.average_irr || 0,
        averageHoldPeriod: 4, // Default hold period
        assetTypes: data.asset_specialties || [],
        geographicFocus: data.geographic_focus || [],
        videoUrl: data.intro_video_url,
        ratings: {
          communication: 4.9,
          transparency: 4.8,
          returnsVsProjections: 4.6,
          professionalism: 4.9,
        },
      });
      setLoading(false);
    }

    fetchSponsor();
  }, [sponsorId]);

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: `Your inquiry has been sent to ${sponsor?.companyName}`,
    });
    
    setShowInquiryModal(false);
    setInquirySubject("");
    setInquiryMessage("");
    setSending(false);
  };

  const paginatedReviews = mockReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );
  const totalPages = Math.ceil(mockReviews.length / reviewsPerPage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-warning fill-warning"
            : i < rating
            ? "text-warning fill-warning/50"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="flex gap-6">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">Sponsor Not Found</h2>
          <p className="text-muted-foreground mb-4">The sponsor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/sponsors")}>
            Browse All Sponsors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Sponsor Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
              {sponsor.logoUrl ? (
                <img 
                  src={sponsor.logoUrl} 
                  alt={sponsor.companyName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Building2 className="w-12 h-12 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {sponsor.companyName}
                </h1>
                {sponsor.isVerified && (
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Verified Sponsor
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-muted-foreground mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {sponsor.location}
                </span>
                {sponsor.website && (
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {sponsor.linkedIn && (
                  <a 
                    href={sponsor.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>

              <Button onClick={() => setShowInquiryModal(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Sponsor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Briefcase className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold text-foreground">
                {sponsor.yearsInBusiness}
              </div>
              <div className="text-sm text-muted-foreground">Years in Business</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold text-foreground">
                {sponsor.totalDeals}
              </div>
              <div className="text-sm text-muted-foreground">Deals on Platform</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold text-foreground">
                {formatCurrency(sponsor.totalCapitalRaised)}
              </div>
              <div className="text-sm text-muted-foreground">Capital Raised</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-6 h-6 text-warning fill-warning mx-auto mb-2" />
              <div className="font-display text-2xl font-bold text-foreground">
                {sponsor.averageRating}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              About {sponsor.companyName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Company Overview</h4>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {sponsor.bio}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-2">Investment Philosophy</h4>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {sponsor.investmentPhilosophy}
              </p>
            </div>

            {sponsor.teamHighlights && sponsor.teamHighlights.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Leadership Team</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {sponsor.teamHighlights.map((member, i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/50">
                        <div className="font-semibold text-foreground">{member.name}</div>
                        <div className="text-sm text-primary">{member.role}</div>
                        <div className="text-xs text-muted-foreground mt-1">{member.experience}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Track Record Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Track Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl bg-success/10 border border-success/20">
                  <div>
                    <div className="text-sm text-muted-foreground">Average IRR Achieved</div>
                    <div className="font-display text-3xl font-bold text-success">
                      {sponsor.averageIrr}%
                    </div>
                  </div>
                  <TrendingUp className="w-10 h-10 text-success/50" />
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Average Hold Period</div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {sponsor.averageHoldPeriod} years
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Asset Types</div>
                  <div className="flex flex-wrap gap-2">
                    {sponsor.assetTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Geographic Focus</div>
                  <div className="flex flex-wrap gap-2">
                    {sponsor.geographicFocus.map((region) => (
                      <Badge key={region} variant="outline">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Video */}
        {sponsor.videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Introduction from the Sponsor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                <iframe
                  src={sponsor.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Sponsor Introduction Video"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Past Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {mockPastProjects.map((project) => (
                <div 
                  key={project.id}
                  className="rounded-xl border border-border overflow-hidden bg-secondary/30 hover:border-primary/30 transition-colors"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-primary/40" />
                    )}
                    <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                      Exited {project.exitDate}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground mb-1">{project.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Final IRR: </span>
                        <span className="font-semibold text-success">{project.finalIrr}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hold: </span>
                        <span className="font-semibold text-foreground">{project.holdPeriod} yrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Offerings */}
        {mockCurrentDeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Current Offerings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCurrentDeals.map((deal) => (
                  <div 
                    key={deal.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-full sm:w-32 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      {deal.imageUrl ? (
                        <img 
                          src={deal.imageUrl} 
                          alt={deal.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-primary/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{deal.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {deal.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-success border-success/30">
                          {deal.targetIrr}% Target IRR
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            {formatCurrency(deal.amountRaised)} raised
                          </span>
                          <span className="text-foreground font-medium">
                            {Math.round((deal.amountRaised / deal.raiseGoal) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(deal.amountRaised / deal.raiseGoal) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Min: {formatCurrency(deal.minimumInvestment)}
                        </span>
                        <Link to={`/property/${deal.id}`}>
                          <Button size="sm">
                            View Deal
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews & Ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Reviews & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-secondary/50">
              <div className="text-center sm:border-r border-border sm:pr-6">
                <div className="font-display text-5xl font-bold text-foreground mb-1">
                  {sponsor.averageRating}
                </div>
                <div className="flex justify-center gap-1 mb-1">
                  {renderStars(sponsor.averageRating)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {sponsor.reviewCount} reviews
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="flex-1 space-y-3">
                {Object.entries(sponsor.ratings).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-40 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex-1">
                      <Progress value={value * 20} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10 text-right">
                      {value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <div 
                  key={review.id}
                  className="p-4 rounded-xl border border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-medium text-foreground">{review.investorName}</div>
                      {review.dealName && (
                        <div className="text-xs text-muted-foreground">
                          Invested in {review.dealName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
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

        {/* Bottom CTA */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-8 text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Invest with {sponsor.companyName}
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore our current offerings and join {sponsor.reviewCount}+ investors 
              who have trusted us with their capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="#current-offerings">
                  View Active Deals
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowInquiryModal(true)}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Inquiry Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Contact {sponsor.companyName}
            </DialogTitle>
            <DialogDescription>
              Send a message to the sponsor. They typically respond within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Question about investments..."
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="I'm interested in learning more about your investment opportunities..."
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
    </div>
  );
}
