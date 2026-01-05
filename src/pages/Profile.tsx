import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Trophy, Target, Building2, Wallet, ShieldCheck, AlertCircle, Crown, Gift, Palette, Users, MessageCircle, FileText, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useKYC } from "@/hooks/useKYC";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useReferrals } from "@/hooks/useReferrals";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { ReferralCard } from "@/components/ReferralCard";
import { KYCStatusBadge } from "@/components/KYCStatusBadge";
import { ThemeSwitcher } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { toast } from "sonner";
export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { profile, holdings, bets, loading, refetch } = useUserData();
  const { kycStatus, isVerified } = useKYC();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const menuItems = [
    { icon: Bell, label: t('profile.notifications'), link: "/settings/notifications" },
    { icon: Shield, label: t('profile.security'), link: "/security" },
    { icon: Settings, label: "Settings", link: "/settings" },
    { icon: HelpCircle, label: t('profile.helpSupport'), link: "/help" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile photo updated!');
      refetch();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate stats
  const totalBets = bets.length;
  const wonBets = bets.filter(b => b.status === "won").length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center px-4">
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title={t('profile.signInToView')}
          description={t('profile.trackInvestments')}
          actionLabel={t('auth.signIn')}
          actionLink="/auth"
        />
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.name || user.email?.split("@")[0] || "User";
  const email = profile?.email || user.email || "";

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">{t('profile.title')}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className="h-9 w-9"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative w-20 h-20 mx-auto mb-4 rounded-full gradient-primary glow-primary flex items-center justify-center group cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {displayName}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {email}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <KYCStatusBadge status={kycStatus} />
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full gradient-gold text-accent-foreground text-sm font-medium">
              <Wallet className="w-4 h-4" />
              $<CountUp end={profile?.wallet_balance || 0} decimals={0} />
            </span>
            {holdings.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                <Trophy className="w-4 h-4" />
                {t('profile.investor')}
              </span>
            )}
          </div>
          
          {/* Social Stats */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <Link to="/community" className="text-center hover:opacity-80 transition-opacity">
              <p className="font-display font-bold text-lg text-foreground">
                <CountUp end={profile?.followers_count || 0} />
              </p>
              <p className="text-xs text-muted-foreground">{t('profile.followers')}</p>
            </Link>
            <Link to="/community" className="text-center hover:opacity-80 transition-opacity">
              <p className="font-display font-bold text-lg text-foreground">
                <CountUp end={profile?.following_count || 0} />
              </p>
              <p className="text-xs text-muted-foreground">{t('profile.following')}</p>
            </Link>
            <Link to="/community" className="text-center hover:opacity-80 transition-opacity">
              <p className="font-display font-bold text-lg text-foreground">
                <CountUp end={profile?.posts_count || 0} />
              </p>
              <p className="text-xs text-muted-foreground">{t('profile.posts')}</p>
            </Link>
          </div>
        </div>

        {/* KYC Verification Prompt */}
        {!isVerified && kycStatus !== "in_review" && (
          <div className="glass-card rounded-2xl p-5 animate-fade-in border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground mb-1">{t('profile.completeVerification')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('profile.verifyIdentity')}
                </p>
                <Button onClick={() => navigate("/kyc")} size="sm" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t('profile.startVerification')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-1">
            <Building2 className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={holdings.length} />
            </p>
            <p className="text-xs text-muted-foreground">{t('profile.properties')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-2">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={totalBets} />
            </p>
            <p className="text-xs text-muted-foreground">{t('profile.totalBets')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-3">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={winRate} />%
            </p>
            <p className="text-xs text-muted-foreground">{t('profile.winRate')}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in stagger-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">{t('dashboard.quickActions')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/messages" className="glass-card rounded-xl p-4 text-center hover:bg-secondary/50 transition-colors">
              <div className="p-3 rounded-xl bg-primary/20 mx-auto w-fit mb-2">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('common.messages', 'Messages')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.directMessages', 'Direct messages')}</p>
            </Link>
            <Link to="/community" className="glass-card rounded-xl p-4 text-center hover:bg-secondary/50 transition-colors">
              <div className="p-3 rounded-xl bg-emerald-500/20 mx-auto w-fit mb-2">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('profile.community')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.socialFeed', 'Social feed')}</p>
            </Link>
            <Link to="/risk" className="glass-card rounded-xl p-4 text-center hover:bg-secondary/50 transition-colors">
              <div className="p-3 rounded-xl bg-orange-500/20 mx-auto w-fit mb-2">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('profile.riskAssessment', 'Risk Assessment')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.aiAnalysis', 'AI-powered analysis')}</p>
            </Link>
            <Link to="/documents" className="glass-card rounded-xl p-4 text-center hover:bg-secondary/50 transition-colors">
              <div className="p-3 rounded-xl bg-accent/20 mx-auto w-fit mb-2">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('common.documents')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.manageDocs', 'Manage your docs')}</p>
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <ReferralCard />
          <Link
            to="/referrals"
            className="block text-center text-sm text-primary hover:underline"
          >
            {t('profile.viewAllReferrals')} →
          </Link>
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <Link
            to="/admin"
            className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors animate-fade-in border border-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="font-medium text-foreground">{t('profile.adminDashboard')}</span>
                <p className="text-xs text-muted-foreground">{t('profile.managePlatform')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        )}

        {/* Quick Links */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in stagger-4">
          <Link
            to="/wallet"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{t('profile.viewWallet')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/explore"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/20">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <span className="font-medium text-foreground">{t('profile.exploreProperties')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/predict"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">{t('profile.predictionMarkets')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/community"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{t('profile.community')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in stagger-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground">{t('profile.appearance')}</h3>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Menu */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in stagger-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.link}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0 interactive-card"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors animate-fade-in stagger-6 interactive-card"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('profile.logOut')}</span>
        </button>
      </main>
    </div>
  );
}
