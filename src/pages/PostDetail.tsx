import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Building2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CommentSection } from "@/components/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface PostData {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  property_id: string | null;
  tagged_users: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url: string | null;
    is_verified_investor: boolean;
  };
  property?: {
    name: string;
    city: string;
    state: string;
    apy: number;
    token_price: number;
  };
  tagged_profiles?: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  }[];
  is_liked?: boolean;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPost();
  }, [id, user]);

  const fetchPost = async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from("user_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Post not found");
        navigate("/community");
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, is_verified_investor")
        .eq("user_id", data.user_id)
        .single();

      // Fetch property if exists
      let property = null;
      if (data.property_id) {
        const { data: propertyData } = await supabase
          .from("properties")
          .select("id, name, city, state, apy, token_price")
          .eq("id", data.property_id)
          .single();
        property = propertyData;
      }

      // Fetch tagged profiles
      let taggedProfiles: any[] = [];
      if (data.tagged_users && data.tagged_users.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", data.tagged_users);
        taggedProfiles = profiles || [];
      }

      // Check if liked
      let isLiked = false;
      if (user) {
        const { data: like } = await (supabase as any)
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("entity_type", "post")
          .eq("entity_id", id)
          .maybeSingle();
        isLiked = !!like;
      }

      setPost({
        ...data,
        user: profile || { display_name: "Unknown", avatar_url: null, is_verified_investor: false },
        property,
        tagged_profiles: taggedProfiles,
        is_liked: isLiked,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    if (!post) return;

    // Optimistic update
    setPost({
      ...post,
      is_liked: !post.is_liked,
      likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
    });

    const { error } = await (supabase as any).rpc("toggle_like", {
      p_entity_type: "post",
      p_entity_id: post.id,
    });

    if (error) {
      console.error("Error toggling like:", error);
      await fetchPost();
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: `Post by ${post.user?.display_name}`,
        text: post.content.slice(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-semibold text-foreground">Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Post Content */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Link to={`/user/${post.user_id}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.user?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {post.user?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/${post.user_id}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {post.user?.display_name || "Unknown"}
                </Link>
                {post.user?.is_verified_investor && (
                  <span className="text-primary">✓</span>
                )}
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>

              <p className="text-foreground mt-2 whitespace-pre-wrap break-words text-lg">
                {post.content}
              </p>

              {/* Post Image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="mt-4 rounded-xl max-h-[500px] w-full object-cover"
                />
              )}

              {/* Post Video */}
              {post.video_url && (
                <video
                  src={post.video_url}
                  controls
                  className="mt-4 rounded-xl max-h-[500px] w-full"
                />
              )}

              {/* Tagged People */}
              {post.tagged_profiles && post.tagged_profiles.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserPlus className="w-4 h-4" />
                  <span>with</span>
                  {post.tagged_profiles.map((person, index) => (
                    <span key={person.user_id}>
                      <Link to={`/user/${person.user_id}`} className="text-primary hover:underline">
                        {person.display_name}
                      </Link>
                      {index < post.tagged_profiles!.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}

              {/* Tagged Property */}
              {post.property && (
                <Link
                  to={`/property/${post.property_id}`}
                  className="mt-4 block glass-card rounded-xl p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{post.property.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.property.city}, {post.property.state} • {post.property.apy}% APY • ${post.property.token_price}/token
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-colors ${
                    post.is_liked
                      ? "text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${post.is_liked ? "fill-current" : ""}`} />
                  <span>{post.likes_count}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection entityType="post" entityId={post.id} />
      </div>
    </div>
  );
}
