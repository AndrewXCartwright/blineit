import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, Clock, Mail, Phone, MapPin, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export default function SponsorPending() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sponsorProfile, loading, isVerified, isRejected } = useSponsor();

  useEffect(() => {
    if (isVerified) {
      navigate("/sponsor/dashboard");
    }
  }, [isVerified, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/sponsor/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <Badge variant="secondary" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            Sponsor
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {isRejected ? (
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {isRejected ? "Application Not Approved" : "Application Under Review"}
              </CardTitle>
              <CardDescription className="mt-2">
                {isRejected
                  ? sponsorProfile?.rejection_reason || "Your application was not approved at this time."
                  : "We're reviewing your sponsor application. You'll be notified within 48 hours."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {sponsorProfile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={isRejected ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    {sponsorProfile.verification_status}
                  </Badge>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-medium">Submitted Information</h4>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{sponsorProfile.company_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{sponsorProfile.contact_email}</span>
                  </div>
                  
                  {sponsorProfile.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{sponsorProfile.contact_phone}</span>
                    </div>
                  )}
                  
                  {sponsorProfile.business_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{sponsorProfile.business_address}</span>
                    </div>
                  )}
                </div>

                {sponsorProfile.years_in_business || sponsorProfile.deals_completed ? (
                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    {sponsorProfile.years_in_business && (
                      <div className="text-center">
                        <div className="text-lg font-bold">{sponsorProfile.years_in_business}</div>
                        <div className="text-xs text-muted-foreground">Years</div>
                      </div>
                    )}
                    {sponsorProfile.deals_completed > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-bold">{sponsorProfile.deals_completed}</div>
                        <div className="text-xs text-muted-foreground">Deals</div>
                      </div>
                    )}
                    {sponsorProfile.average_irr && (
                      <div className="text-center">
                        <div className="text-lg font-bold">{sponsorProfile.average_irr}%</div>
                        <div className="text-xs text-muted-foreground">Avg IRR</div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Need help?</p>
                  <p className="text-muted-foreground text-xs">
                    Contact our sponsor support team for any questions about your application.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link to="/contact-support">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              
              {isRejected && (
                <Button asChild>
                  <Link to="/sponsor/register">
                    Reapply
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
