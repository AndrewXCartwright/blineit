import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export type SortOption = "newest" | "oldest" | "most_upvoted" | "most_discussed";
export type FilterOption = "all" | "verified" | "official";

export interface CommunityComment {
  id: string;
  content: string;
  user_id: string;
  property_id: string | null;
  loan_id: string | null;
  parent_id: string | null;
  is_pinned: boolean;
  is_official: boolean;
  upvote_count: number;
  reply_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  is_verified_investor?: boolean;
  has_upvoted?: boolean;
  replies?: CommunityComment[];
}

interface UseCommunityCommentsParams {
  propertyId?: string;
  loanId?: string;
  sort?: SortOption;
  filter?: FilterOption;
}

export function useCommunityComments({ 
  propertyId, 
  loanId, 
  sort = "newest",
  filter = "all" 
}: UseCommunityCommentsParams) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!propertyId && !loanId) return;

    try {
      setLoading(true);

      // Build query for top-level comments
      let query = supabase
        .from("community_comments")
        .select(`
          *
        `)
        .is("parent_id", null)
        .is("deleted_at", null);

      if (propertyId) {
        query = query.eq("property_id", propertyId);
      } else if (loanId) {
        query = query.eq("loan_id", loanId);
      }

      // Apply filters
      if (filter === "official") {
        query = query.eq("is_official", true);
      }

      // Apply sorting
      switch (sort) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "most_upvoted":
          query = query.order("upvote_count", { ascending: false });
          break;
        case "most_discussed":
          query = query.order("reply_count", { ascending: false });
          break;
        default:
          query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      }

      const { data: commentsData, error } = await query;

      if (error) throw error;

      // Fetch user profiles for comments
      const userIds = [...new Set((commentsData || []).map(c => c.user_id))];
      let profiles: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        profiles = (profilesData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      // Check verified investor status
      let verifiedInvestors: Set<string> = new Set();
      if (propertyId && userIds.length > 0) {
        const { data: holdings } = await supabase
          .from("user_holdings")
          .select("user_id")
          .eq("property_id", propertyId)
          .in("user_id", userIds)
          .gt("tokens", 0);

        verifiedInvestors = new Set((holdings || []).map(h => h.user_id));
      } else if (loanId && userIds.length > 0) {
        const { data: investments } = await supabase
          .from("user_loan_investments")
          .select("user_id")
          .eq("loan_id", loanId)
          .in("user_id", userIds)
          .eq("status", "active");

        verifiedInvestors = new Set((investments || []).map(i => i.user_id));
      }

      // Check user upvotes
      let userUpvotes: Set<string> = new Set();
      if (user && commentsData && commentsData.length > 0) {
        const { data: upvotes } = await supabase
          .from("comment_upvotes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentsData.map(c => c.id));

        userUpvotes = new Set((upvotes || []).map(u => u.comment_id));
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: repliesData } = await supabase
            .from("community_comments")
            .select("*")
            .eq("parent_id", comment.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: true })
            .limit(10);

          const replyUserIds = [...new Set((repliesData || []).map(r => r.user_id))];
          const missingUserIds = replyUserIds.filter(id => !profiles[id]);

          if (missingUserIds.length > 0) {
            const { data: moreProfiles } = await supabase
              .from("profiles")
              .select("user_id, display_name, avatar_url")
              .in("user_id", missingUserIds);

            (moreProfiles || []).forEach(p => {
              profiles[p.user_id] = p;
            });
          }

          // Check reply user upvotes
          if (user && repliesData && repliesData.length > 0) {
            const { data: replyUpvotes } = await supabase
              .from("comment_upvotes")
              .select("comment_id")
              .eq("user_id", user.id)
              .in("comment_id", repliesData.map(r => r.id));

            (replyUpvotes || []).forEach(u => userUpvotes.add(u.comment_id));
          }

          const replies: CommunityComment[] = (repliesData || []).map(reply => ({
            ...reply,
            user: profiles[reply.user_id] ? {
              id: reply.user_id,
              display_name: profiles[reply.user_id].display_name || "Anonymous",
              avatar_url: profiles[reply.user_id].avatar_url,
            } : undefined,
            is_verified_investor: verifiedInvestors.has(reply.user_id),
            has_upvoted: userUpvotes.has(reply.id),
          }));

          return {
            ...comment,
            user: profiles[comment.user_id] ? {
              id: comment.user_id,
              display_name: profiles[comment.user_id].display_name || "Anonymous",
              avatar_url: profiles[comment.user_id].avatar_url,
            } : undefined,
            is_verified_investor: verifiedInvestors.has(comment.user_id),
            has_upvoted: userUpvotes.has(comment.id),
            replies,
          } as CommunityComment;
        })
      );

      // Apply verified filter after fetching
      let filteredComments = commentsWithReplies;
      if (filter === "verified") {
        filteredComments = commentsWithReplies.filter(c => c.is_verified_investor);
      }

      setComments(filteredComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [propertyId, loanId, sort, filter, user]);

  const postComment = useCallback(async (content: string, parentId?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post a comment",
        variant: "destructive",
      });
      return false;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from("community_comments").insert({
        content: content.trim(),
        user_id: user.id,
        property_id: propertyId || null,
        loan_id: loanId || null,
        parent_id: parentId || null,
      });

      if (error) throw error;

      // Update reply count if this is a reply
      if (parentId) {
        await supabase.rpc("increment_reply_count", { comment_id: parentId });
      }

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });

      await fetchComments();
      return true;
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user, propertyId, loanId, fetchComments]);

  const toggleUpvote = useCallback(async (commentId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upvote",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("toggle_comment_upvote", {
        p_comment_id: commentId,
      });

      if (error) throw error;

      // Optimistic update
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const action = (data as any)?.action;
          return {
            ...comment,
            has_upvoted: action === "added",
            upvote_count: action === "added" 
              ? comment.upvote_count + 1 
              : comment.upvote_count - 1,
          };
        }
        // Check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                const action = (data as any)?.action;
                return {
                  ...reply,
                  has_upvoted: action === "added",
                  upvote_count: action === "added"
                    ? reply.upvote_count + 1
                    : reply.upvote_count - 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error("Error toggling upvote:", error);
      toast({
        title: "Error",
        description: "Failed to update upvote",
        variant: "destructive",
      });
    }
  }, [user]);

  const reportComment = useCallback(async (commentId: string, reason: string, details?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to report a comment",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from("comment_reports").insert({
        comment_id: commentId,
        reported_by: user.id,
        reason,
        details,
      });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });

      return true;
    } catch (error) {
      console.error("Error reporting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
      return false;
    }
  }, [user]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("community_comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });

      await fetchComments();
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchComments]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Set up realtime subscription
  useEffect(() => {
    if (!propertyId && !loanId) return;

    const channel = supabase
      .channel(`community_comments_${propertyId || loanId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_comments",
          filter: propertyId 
            ? `property_id=eq.${propertyId}` 
            : `loan_id=eq.${loanId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, loanId, fetchComments]);

  return {
    comments,
    loading,
    submitting,
    postComment,
    toggleUpvote,
    reportComment,
    deleteComment,
    refetch: fetchComments,
    totalCount: comments.length,
  };
}
