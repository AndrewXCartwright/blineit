import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Gift, Home, Target, Landmark, DollarSign, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function ReferralLanding() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validCode, setValidCode] = useState(false);

  useEffect(() => {
    const validateReferralCode = async () => {
      if (!code) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, name")
          .eq("referral_code", code.toUpperCase())
          .maybeSingle();

        if (data) {
          setReferrerName(data.display_name || data.name || "A friend");
          setValidCode(true);
          // Store referral code in localStorage for signup
          localStorage.setItem("referral_code", code.toUpperCase());
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
      } finally {
        setLoading(false);
      }
    };

    validateReferralCode();
  }, [code]);

  const handleSignUp = () => {
    navigate("/auth?ref=" + code);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!validCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Invalid Referral Link</h1>
          <p className="text-muted-foreground">This referral code doesn't exist or has expired.</p>
          <Button onClick={() => navigate("/auth")} className="mt-4">
            Sign Up Anyway
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <img src={logo} alt="B-LINE-IT" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="font-display text-3xl font-bold text-foreground">B-LINE-IT</h1>
        </div>

        {/* Invitation Message */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            <span className="font-semibold text-foreground">{referrerName}</span> invited you to join B-LINE-IT!
          </p>
        </div>

        {/* Welcome Bonus Card */}
        <div className="glass-card rounded-2xl p-6 text-center space-y-4 glow-gold">
          <div className="inline-flex p-3 rounded-full gradient-gold">
            <Gift className="w-8 h-8 text-accent-foreground" />
          </div>
          
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              YOUR WELCOME BONUS
            </h2>
            <p className="text-3xl font-display font-bold text-success">
              Get $50
            </p>
            <p className="text-muted-foreground">when you invest $500+</p>
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {referrerName} also gets $50!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground">Tokenized Real Estate</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground">Prediction Markets</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground">Fixed-Income Debt</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <span className="text-foreground">Start with just $100</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSignUp}
          size="lg"
          className="w-full py-6 text-lg font-display font-bold gradient-primary glow-primary"
        >
          Create Free Account
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
