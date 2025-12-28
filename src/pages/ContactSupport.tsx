import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  Twitter,
  Linkedin,
  ExternalLink
} from 'lucide-react';

export default function ContactSupport() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">📞 Contact Us</h1>
          <p className="text-muted-foreground">We're here to help</p>
        </div>

        {/* Live Chat */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-2">Chat with our support team</p>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Mon-Fri, 9 AM - 6 PM CT
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ~2 min wait
                </Badge>
              </div>
              <Link to="/help/chat">
                <Button>Start Live Chat</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Email */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground mb-2">Response within 24 hours</p>
              <a 
                href="mailto:support@blineit.com" 
                className="text-primary hover:underline font-medium"
              >
                support@blineit.com
              </a>
            </div>
          </div>
        </Card>

        {/* Phone */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold">General Support</h3>
                <p className="text-sm text-muted-foreground mb-1">Mon-Fri, 9 AM - 5 PM CT</p>
                <a 
                  href="tel:1-800-254-6348" 
                  className="text-primary hover:underline font-medium"
                >
                  1-800-BLINEIT (1-800-254-6348)
                </a>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">VIP Investor Line</h3>
                  <Badge>Accredited</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Mon-Sat, 8 AM - 8 PM CT</p>
                <a 
                  href="tel:1-800-254-8847" 
                  className="text-primary hover:underline font-medium"
                >
                  1-800-BLIT-VIP (1-800-254-8847)
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Mailing Address</h3>
              <p className="text-sm text-muted-foreground mt-2">
                B-LINE-IT Inc.<br />
                123 Blockchain Ave, Suite 400<br />
                Austin, TX 78701
              </p>
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Connect With Us</h3>
          <div className="flex gap-3">
            <a 
              href="https://twitter.com/blineit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </a>
            <a 
              href="https://linkedin.com/company/blineit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </a>
            <a 
              href="https://discord.gg/blineit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Discord
              </Button>
            </a>
          </div>
        </Card>

        {/* Support Hours Summary */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">Support Hours Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Live Chat</span>
              <span>Mon-Fri, 9 AM - 6 PM CT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone Support</span>
              <span>Mon-Fri, 9 AM - 5 PM CT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIP Line</span>
              <span>Mon-Sat, 8 AM - 8 PM CT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>24/7 (response within 24h)</span>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
