import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, MessageCircle, Flag, MoreVertical, Pin, 
  CheckCircle2, Shield, Trash2, ChevronDown, ChevronUp 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommunityComment } from "@/hooks/useCommunityComments";
import { CommentInput } from "./CommentInput";
import { ReportCommentModal } from "./ReportCommentModal";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CommentCardProps {
  comment: CommunityComment;
  onUpvote: (commentId: string) => void;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  onReport: (commentId: string, reason: string, details?: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  isReply?: boolean;
  submitting?: boolean;
}

export function CommentCard({
  comment,
  onUpvote,
  onReply,
  onReport,
  onDelete,
  isReply = false,
  submitting = false,
}: CommentCardProps) {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwnComment = user?.id === comment.user_id;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  const displayName = comment.user?.display_name || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleReply = async (content: string) => {
    return await onReply(content, comment.id);
  };

  const handleReport = async (reason: string, details?: string) => {
    return await onReport(comment.id, reason, details);
  };

  return (
    <div className={cn(
      "relative",
      isReply && "pl-8 border-l-2 border-border/50 ml-6"
    )}>
      {/* Pinned indicator */}
      {comment.is_pinned && !isReply && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2">
          <Pin className="w-3 h-3" />
          <span className="font-medium">PINNED</span>
        </div>
      )}

      <div className={cn(
        "glass-card rounded-xl p-4",
        comment.is_pinned && !isReply && "border-amber-400/30",
        comment.is_official && "border-primary/30"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground text-sm">
                  {displayName}
                </span>

                {comment.is_official && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary">
                    <Shield className="w-3 h-3" />
                    Official
                  </span>
                )}

                {comment.is_verified_investor && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-success/20 text-success">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Investor
                  </span>
                )}
              </div>

              <span className="text-xs text-muted-foreground">
                {timeAgo}
                {comment.is_edited && " · edited"}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnComment && (
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              {!isOwnComment && (
                <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-foreground text-sm mt-3 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => onUpvote(comment.id)}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              comment.has_upvoted 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <ThumbsUp className={cn(
              "w-4 h-4",
              comment.has_upvoted && "fill-current"
            )} />
            <span>{comment.upvote_count}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-4">
            <CommentInput
              onSubmit={handleReply}
              placeholder="Write a reply..."
              isReply
              onCancel={() => setShowReplyInput(false)}
              submitting={submitting}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.length > 2 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-xs text-primary mb-3 hover:underline"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide {comment.replies.length} replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View {comment.replies.length} replies
                </>
              )}
            </button>
          )}

          {showReplies && (
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  onUpvote={onUpvote}
                  onReply={onReply}
                  onReport={onReport}
                  onDelete={onDelete}
                  isReply
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportCommentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />
    </div>
  );
}
