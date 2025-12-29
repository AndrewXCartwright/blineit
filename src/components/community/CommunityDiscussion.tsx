import { useState } from "react";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useCommunityComments, SortOption, FilterOption } from "@/hooks/useCommunityComments";
import { CommentInput } from "./CommentInput";
import { CommentCard } from "./CommentCard";
import { CommentSortFilter } from "./CommentSortFilter";
import { Skeleton } from "@/components/Skeleton";

interface CommunityDiscussionProps {
  propertyId?: string;
  loanId?: string;
}

export function CommunityDiscussion({ propertyId, loanId }: CommunityDiscussionProps) {
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterOption>("all");

  const {
    comments,
    loading,
    submitting,
    postComment,
    toggleUpvote,
    reportComment,
    deleteComment,
    totalCount,
  } = useCommunityComments({ propertyId, loanId, sort, filter });

  const handlePostComment = async (content: string) => {
    return await postComment(content);
  };

  const handleReply = async (content: string, parentId: string) => {
    return await postComment(content, parentId);
  };

  const handleReport = async (commentId: string, reason: string, details?: string) => {
    return await reportComment(commentId, reason, details);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            Community Discussion
          </h3>
          <span className="text-sm text-muted-foreground">
            ({totalCount} {totalCount === 1 ? "comment" : "comments"})
          </span>
        </div>

        <CommentSortFilter
          sort={sort}
          filter={filter}
          onSortChange={setSort}
          onFilterChange={setFilter}
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80">
          <span className="font-semibold">Disclaimer:</span> Comments are for discussion purposes only and do not constitute investment advice. Always conduct your own research before making investment decisions.
        </p>
      </div>

      {/* Comment Input */}
      <CommentInput
        onSubmit={handlePostComment}
        submitting={submitting}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-12" />
              <div className="flex gap-4">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-display font-semibold text-foreground mb-2">
              No comments yet
            </h4>
            <p className="text-muted-foreground text-sm">
              Be the first to share your thoughts on this investment!
            </p>
          </div>
        ) : (
          // Comments
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onUpvote={toggleUpvote}
              onReply={handleReply}
              onReport={handleReport}
              onDelete={deleteComment}
              submitting={submitting}
            />
          ))
        )}
      </div>
    </div>
  );
}
