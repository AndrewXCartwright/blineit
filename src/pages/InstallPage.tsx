import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Smartphone, Zap, Bell, Wifi, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const InstallPage = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();

  const handleInstall = async () => {
    await installApp();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Install App</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center">
          <div className="text-6xl mb-4">🐝</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">B-LINE-IT</h2>
          <p className="text-muted-foreground">
            Get the best experience by installing our app
          </p>
        </div>

        {/* Status */}
        {isInstalled ? (
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-foreground mb-1">App Installed</h3>
              <p className="text-sm text-muted-foreground">
                You're using the installed version of B-LINE-IT
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {isIOS ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Install on iPhone/iPad
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Tap the Share button</p>
                        <p className="text-sm text-muted-foreground">Look for ⬆️ at the bottom of Safari</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Scroll and tap "Add to Home Screen"</p>
                        <p className="text-sm text-muted-foreground">You might need to scroll down to find it</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Tap "Add" to confirm</p>
                        <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Ready to Install
                  </h3>
                  <Button size="lg" onClick={handleInstall} className="w-full">
                    <Download className="h-5 w-5 mr-2" />
                    Install B-LINE-IT
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Visit this page on a mobile device or supported browser to install the app.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Why Install?</h3>
          
          <div className="grid gap-3">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Faster Loading</h4>
                  <p className="text-sm text-muted-foreground">Instant access without browser loading</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get alerts for trades and market updates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Works Offline</h4>
                  <p className="text-sm text-muted-foreground">View your portfolio without internet</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Full-Screen Mode</h4>
                  <p className="text-sm text-muted-foreground">Native app experience without browser chrome</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Auto Updates</h4>
                  <p className="text-sm text-muted-foreground">Always get the latest features automatically</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Secure</h4>
                  <p className="text-sm text-muted-foreground">Same security as our website</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
