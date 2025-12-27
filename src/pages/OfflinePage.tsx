import { WifiOff, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">You're Offline</h1>
          <p className="text-muted-foreground mb-8">
            Some features require an internet connection.
          </p>

          <div className="space-y-4 text-left mb-8">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Available offline:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>View cached portfolio</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>Browse saved properties</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>Read downloaded documents</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Unavailable offline:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  <span>Place trades or bets</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  <span>Real-time prices</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  <span>Send messages</span>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;
