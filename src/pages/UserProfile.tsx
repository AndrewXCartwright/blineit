import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, Users, TrendingUp, Trophy, Shield, Star, MessageCircle, Loader2 } from "lucide-react";
import { usePublicProfile } from "@/hooks/useSocial";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { useState } from "react";

const BADGE_INFO: Record<string, { emoji: string; label: string }> = {
  early_adopter: { emoji: "🔥", label: "Early Adopter" },
  diamond_hands: { emoji: "💎", label: "Diamond Hands" },
  top_predictor: { emoji: "🏆", label: "Top Predictor" },
  sharp_shooter: { emoji: "🎯", label: "Sharp Shooter" },
  bull_master: { emoji: "🐂", label: "Bull Master" },
  bear_master: { emoji: "🐻", label: "Bear Master" },
  whale: { emoji: "👑", label: "Whale" },
  influencer: { emoji: "🌟", label: "Influencer" },
  connector: { emoji: "🤝", label: "Connector" },
  verified: { emoji: "✅", label: "Verified" },
};

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, toggleFollow } = usePublicProfile(userId || "");
  const { startConversation } = useConversations();
  const [startingChat, setStartingChat] = useState(false);

  const isOwnProfile = user?.id === userId;

  const handleMessage = async () => {
    if (!userId) return;
    setStartingChat(true);
    try {
      const conversationId = await startConversation(userId);
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/community" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="px-4 py-6 space-y-6">
          <div className="text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground">This profile doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/community" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl">
              {profile.display_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {profile.display_name}
            </h2>
            {profile.is_verified_investor && (
              <span className="text-primary text-xl">✓</span>
            )}
          </div>

          {profile.bio && (
            <p className="text-muted-foreground max-w-md mx-auto mb-3">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <span>𝕏</span>
                @{profile.twitter_handle}
              </a>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {format(new Date(profile.created_at), "MMMM yyyy")}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                <CountUp end={profile.followers_count} />
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                <CountUp end={profile.following_count} />
              </p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display font-bold text-xl text-foreground">
                <CountUp end={profile.prediction_win_rate} />%
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex justify-center gap-3">
              <Button
                onClick={toggleFollow}
                variant={profile.is_following ? "outline" : "default"}
                className="gap-2 min-w-[120px]"
              >
                <Users className="w-4 h-4" />
                {profile.is_following ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleMessage} disabled={startingChat}>
                {startingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Message
              </Button>
            </div>
          )}

          {isOwnProfile && (
            <Link to="/settings/profile">
              <Button variant="outline" className="gap-2">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => {
                const info = BADGE_INFO[badge] || { emoji: "🏅", label: badge };
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm"
                  >
                    <span>{info.emoji}</span>
                    <span className="text-foreground">{info.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs Placeholder */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-muted-foreground">
            Posts, comments, and activity coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}
