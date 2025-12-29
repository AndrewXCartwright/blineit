import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Comment {
  id: string;
  user_id: string;
  parent_id: string | null;
  entity_type: string;
  entity_id: string;
  content: string;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string;
    avatar_url: string | null;
    is_verified_investor: boolean;
  };
  replies?: Comment[];
  is_liked?: boolean;
}

export interface UserPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  property_id: string | null;
  prediction_id: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
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
  is_liked?: boolean;
}

export interface PublicProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  twitter_handle: string | null;
  website_url: string | null;
  location: string | null;
  is_verified_investor: boolean;
  followers_count: number;
  following_count: number;
  prediction_win_rate: number;
  created_at: string;
  badges?: string[];
  is_following?: boolean;
}

// Hook for comments on a specific entity
export function useComments(entityType: string, entityId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!entityId) return;

    try {
      // Fetch top-level comments
      const { data, error } = await (supabase as any)
        .from("comments")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .is("parent_id", null)
        .eq("is_hidden", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // Fetch user profiles for comments
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds as string[]);

        if (profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => {
            acc[p.user_id] = p;
            return acc;
          }, {});
        }
      }

      // Check likes if user is logged in
      let likesSet = new Set<string>();
      if (user) {
        const { data: likes } = await (supabase as any)
          .from("likes")
          .select("entity_id")
          .eq("user_id", user.id)
          .eq("entity_type", "comment")
          .in("entity_id", (data || []).map((c: any) => c.id));

        if (likes) {
          likesSet = new Set(likes.map((l: any) => l.entity_id));
        }
      }

      const commentsWithUsers = (data || []).map((comment: any) => ({
        ...comment,
        user: profilesMap[comment.user_id] || { display_name: "Unknown", avatar_url: null },
        is_liked: likesSet.has(comment.id),
      }));

      setComments(commentsWithUsers);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return false;
    }

    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc("add_comment", {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_content: content,
        p_parent_id: parentId || null,
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Failed to add comment");
        return false;
      }

      toast.success("Comment added");
      await fetchComments();
      return true;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              is_liked: !c.is_liked,
              likes_count: c.is_liked ? c.likes_count - 1 : c.likes_count + 1,
            }
          : c
      )
    );

    const { error } = await (supabase as any).rpc("toggle_like", {
      p_entity_type: "comment",
      p_entity_id: commentId,
    });

    if (error) {
      console.error("Error toggling like:", error);
      await fetchComments(); // Revert on error
    }
  };

  return {
    comments,
    loading,
    submitting,
    addComment,
    toggleLike,
    refetch: fetchComments,
  };
}

// Hook for user posts feed
export function usePosts(feedType: "following" | "trending" | "new" = "new") {
  const { user } = useAuth();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      let query = (supabase as any)
        .from("user_posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(30);

      if (feedType === "trending") {
        query = query.order("likes_count", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      // Fetch user profiles
      const userIds = [...new Set((data || []).map((p: any) => p.user_id))];
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds as string[]);

        if (profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => {
            acc[p.user_id] = p;
            return acc;
          }, {});
        }
      }

      // Fetch properties if any
      const propertyIds = (data || []).filter((p: any) => p.property_id).map((p: any) => p.property_id);
      let propertiesMap: Record<string, any> = {};

      if (propertyIds.length > 0) {
        const { data: properties } = await supabase
          .from("properties")
          .select("id, name, city, state, apy, token_price")
          .in("id", propertyIds);

        if (properties) {
          propertiesMap = properties.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // Check likes
      let likesSet = new Set<string>();
      if (user) {
        const { data: likes } = await (supabase as any)
          .from("likes")
          .select("entity_id")
          .eq("user_id", user.id)
          .eq("entity_type", "post")
          .in("entity_id", (data || []).map((p: any) => p.id));

        if (likes) {
          likesSet = new Set(likes.map((l: any) => l.entity_id));
        }
      }

      const postsWithData = (data || []).map((post: any) => ({
        ...post,
        user: profilesMap[post.user_id] || { display_name: "Unknown", avatar_url: null },
        property: post.property_id ? propertiesMap[post.property_id] : null,
        is_liked: likesSet.has(post.id),
      }));

      setPosts(postsWithData);
    } finally {
      setLoading(false);
    }
  }, [feedType, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (content: string, propertyId?: string, predictionId?: string, imageUrl?: string) => {
    if (!user) {
      toast.error("Please sign in to post");
      return false;
    }

    try {
      const { error } = await (supabase as any).from("user_posts").insert({
        user_id: user.id,
        content,
        property_id: propertyId || null,
        prediction_id: predictionId || null,
        image_url: imageUrl || null,
      });

      if (error) {
        toast.error("Failed to create post");
        return false;
      }

      toast.success("Post created");
      await fetchPosts();
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
    
    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );

    const { error } = await (supabase as any).rpc("toggle_like", {
      p_entity_type: "post",
      p_entity_id: postId,
    });

    if (error) {
      console.error("Error toggling like:", error);
      await fetchPosts();
    }
  };

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    uploadImage,
    refetch: fetchPosts,
  };
}

// Hook for public profiles
export function usePublicProfile(userId: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio, twitter_handle, website_url, location, is_verified_investor, followers_count, following_count, prediction_win_rate, created_at")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      // Fetch badges
      const { data: badges } = await (supabase as any)
        .from("user_badges")
        .select("badge_type")
        .eq("user_id", userId);

      // Check if following
      let isFollowing = false;
      if (user && user.id !== userId) {
        const { data: follow } = await (supabase as any)
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .maybeSingle();
        isFollowing = !!follow;
      }

      setProfile({
        ...data,
        badges: badges?.map((b: any) => b.badge_type) || [],
        is_following: isFollowing,
      } as PublicProfile);
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow");
      return;
    }

    if (!profile) return;

    // Optimistic update
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            is_following: !prev.is_following,
            followers_count: prev.is_following
              ? prev.followers_count - 1
              : prev.followers_count + 1,
          }
        : null
    );

    const { error } = await (supabase as any).rpc("toggle_follow", {
      p_following_id: userId,
    });

    if (error) {
      console.error("Error toggling follow:", error);
      await fetchProfile();
    }
  };

  return {
    profile,
    loading,
    toggleFollow,
    refetch: fetchProfile,
  };
}

// Hook for leaderboard
export function useLeaderboard(type: "predictions" | "investors" | "referrals" = "predictions") {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      let query = supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, is_verified_investor, prediction_win_rate, total_invested, referral_earnings")
        .eq("show_on_leaderboard", true)
        .limit(50);

      if (type === "predictions") {
        query = query.order("prediction_win_rate", { ascending: false });
      } else if (type === "investors") {
        query = query.order("total_invested", { ascending: false });
      } else {
        query = query.order("referral_earnings", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      setLeaders(data || []);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaders, loading };
}
