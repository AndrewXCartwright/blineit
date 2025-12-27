import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mail, Bell, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetClass: {
    name: string;
    icon: string;
    launchDate: string;
  };
}

export function WaitlistModal({ isOpen, onClose, assetClass }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSubmitted(true);
    toast.success("You're on the list!", {
      description: `We'll notify you when ${assetClass.name} launches.`
    });
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-4 bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl">{assetClass.icon}</span>
          </div>
          <DialogTitle className="font-display text-xl text-center">
            {assetClass.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            Coming {assetClass.launchDate}
          </DialogDescription>
        </DialogHeader>
        
        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">You're on the waitlist!</h3>
            <p className="text-sm text-muted-foreground">
              We'll email you when {assetClass.name} launches.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Get notified when we launch
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your@email.com"
                  className={`w-full bg-secondary border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    error ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {error && (
                <p className="text-destructive text-xs mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-display font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Joining..."
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Join Waitlist
                </>
              )}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
