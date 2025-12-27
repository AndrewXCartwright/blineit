import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PushPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  isLoading?: boolean;
}

export function PushPermissionModal({
  isOpen,
  onClose,
  onEnable,
  isLoading = false,
}: PushPermissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
            <Bell className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-display">
            Enable Push Notifications?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Get instant alerts when:
          </p>

          <ul className="text-left space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="text-foreground">Your predictions win</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-foreground">Interest payments arrive</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <span className="text-foreground">New properties match your interests</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span className="text-foreground">Referrals sign up or invest</span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={onEnable}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Enabling..." : "Enable"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              Not Now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            You can change this anytime in Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
