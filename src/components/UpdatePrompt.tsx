import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export const UpdatePrompt = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Update Available</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A new version of B-LINE-IT is ready!
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={updateApp}>
                Update Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
