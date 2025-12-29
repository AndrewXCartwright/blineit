import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GroupMessage } from '@/hooks/useGroupMessages';

interface MessageInputProps {
  onSend: (content: string, parentId?: string) => Promise<boolean>;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  replyingTo?: GroupMessage | null;
  onCancelReply?: () => void;
  onTyping?: (typing: boolean) => void;
}

export function MessageInput({
  onSend,
  sending,
  disabled,
  placeholder = "Type a message...",
  replyingTo,
  onCancelReply,
  onTyping,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Handle typing indicator
  const handleChange = (value: string) => {
    setContent(value);

    // Notify typing
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;

    const success = await onSend(content.trim(), replyingTo?.id);
    if (success) {
      setContent('');
      onCancelReply?.();
      onTyping?.(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-l-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium">
              Replying to {replyingTo.sender?.display_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[40px] max-h-[120px] resize-none py-2",
            disabled && "opacity-50"
          )}
          rows={1}
        />

        <Button
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
