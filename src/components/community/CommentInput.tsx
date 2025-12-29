import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface CommentInputProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  maxLength?: number;
  isReply?: boolean;
  onCancel?: () => void;
  submitting?: boolean;
}

export function CommentInput({
  onSubmit,
  placeholder = "Share your thoughts...",
  maxLength = 500,
  isReply = false,
  onCancel,
  submitting = false,
}: CommentInputProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    const success = await onSubmit(content);
    if (success) {
      setContent("");
      onCancel?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <div className="glass-card rounded-xl p-4 text-center">
        <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
        <Button
          onClick={() => navigate("/auth")}
          className="gradient-gold text-accent-foreground"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${isReply ? "" : "glass-card rounded-xl p-4"}`}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[80px] bg-secondary/50 border-border resize-none"
        disabled={submitting}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${content.length >= maxLength ? "text-destructive" : "text-muted-foreground"}`}>
          {content.length}/{maxLength}
        </span>
        <div className="flex gap-2">
          {isReply && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            size="sm"
            className="gradient-gold text-accent-foreground"
          >
            {submitting ? (
              <span className="animate-pulse">Posting...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isReply ? "Reply" : "Post"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
