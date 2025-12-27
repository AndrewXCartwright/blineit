import { useState } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, Pin, Flag } from "lucide-react";
import { useComments, Comment } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentSectionProps {
  entityType: "property" | "loan" | "prediction" | "post";
  entityId: string;
  userPosition?: { type: "BULL" | "BEAR"; price: number } | null;
}

export function CommentSection({ entityType, entityId, userPosition }: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, toggleLike } = useComments(entityType, entityId);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "top">("new");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    const success = await addComment(replyContent, parentId);
    if (success) {
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") {
      return b.likes_count - a.likes_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Discussion ({comments.length} comments)
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "new" | "top")}
          className="text-sm bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground"
        >
          <option value="new">Newest</option>
          <option value="top">Top</option>
        </select>
      </div>

      {/* New Comment Input */}
      {user ? (
        <div className="glass-card rounded-xl p-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none mb-3"
            maxLength={2000}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              size="sm"
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-muted-foreground text-sm">
            <Link to="/auth" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {sortedComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onLike={() => toggleLike(comment.id)}
            onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            isReplying={replyingTo === comment.id}
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onSubmitReply={() => handleReply(comment.id)}
            submitting={submitting}
            entityType={entityType}
            userPosition={userPosition}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  onLike: () => void;
  onReply: () => void;
  isReplying: boolean;
  replyContent: string;
  onReplyContentChange: (value: string) => void;
  onSubmitReply: () => void;
  submitting: boolean;
  entityType: string;
  userPosition?: { type: "BULL" | "BEAR"; price: number } | null;
  isReply?: boolean;
}

function CommentCard({
  comment,
  onLike,
  onReply,
  isReplying,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  submitting,
  entityType,
  userPosition,
  isReply = false,
}: CommentCardProps) {
  const { user } = useAuth();

  return (
    <div className={`glass-card rounded-xl p-4 ${isReply ? "ml-8 bg-secondary/30" : ""}`}>
      <div className="flex items-start gap-3">
        <Link to={`/user/${comment.user_id}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {comment.user?.display_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/user/${comment.user_id}`}
              className="font-medium text-foreground hover:underline"
            >
              {comment.user?.display_name || "Unknown"}
            </Link>
            {comment.user?.is_verified_investor && (
              <span className="text-primary text-sm">✓</span>
            )}
            {comment.is_pinned && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                <Pin className="w-3 h-3" />
                PINNED
              </span>
            )}
            {entityType === "prediction" && userPosition && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  userPosition.type === "BULL"
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {userPosition.type === "BULL" ? "🐂" : "🐻"} {userPosition.type} @ {userPosition.price}¢
              </span>
            )}
          </div>

          <p className="text-foreground mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 transition-colors ${
                comment.is_liked
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <Heart className={`w-4 h-4 ${comment.is_liked ? "fill-current" : ""}`} />
              {comment.likes_count}
            </button>

            {!isReply && (
              <button
                onClick={onReply}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {comment.replies_count > 0 ? `${comment.replies_count} replies` : "Reply"}
              </button>
            )}

            <span className="text-muted-foreground/60">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-auto p-1 rounded hover:bg-secondary transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Flag className="w-4 h-4" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                maxLength={2000}
              />
              <Button
                onClick={onSubmitReply}
                disabled={!replyContent.trim() || submitting}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
