import { 
  CreditCard, 
  Mail, 
  Shield, 
  Webhook, 
  Settings, 
  Lock,
  Globe,
  Bell
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function PlatformSettings() {
  const settingsSections = [
    {
      id: "payments",
      title: "Payment Settings",
      description: "Configure payment channels and processing",
      icon: CreditCard,
      status: "pending",
      statusText: "Awaiting DigiShares Connection",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Payment channels will be configured through DigiShares integration.
              Available methods will include ACH, wire transfer, and credit card processing.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ACH Payments</p>
                <p className="text-sm text-muted-foreground">Bank transfers via ACH network</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Wire Transfers</p>
                <p className="text-sm text-muted-foreground">Domestic and international wires</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
              </div>
              <Switch disabled />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      title: "Email Settings",
      description: "Configure email notifications and templates",
      icon: Mail,
      status: "pending",
      statusText: "Configure Templates",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Welcome Emails</p>
                <p className="text-sm text-muted-foreground">Send to new investors on signup</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Investment Confirmations</p>
                <p className="text-sm text-muted-foreground">Send after successful investments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Distribution Notifications</p>
                <p className="text-sm text-muted-foreground">Notify investors of distributions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>From Email Address</Label>
            <Input placeholder="noreply@blineit.com" disabled />
          </div>
        </div>
      ),
    },
    {
      id: "compliance",
      title: "Compliance Settings",
      description: "KYC/AML and regulatory configuration",
      icon: Shield,
      status: "pending",
      statusText: "Configure Rules",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require KYC for Investment</p>
                <p className="text-sm text-muted-foreground">All investors must complete KYC</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Accreditation Verification</p>
                <p className="text-sm text-muted-foreground">Require accredited investor status</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AML Screening</p>
                <p className="text-sm text-muted-foreground">Screen against OFAC and sanctions lists</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Investment Limit (Non-Accredited)</Label>
            <Input type="number" placeholder="10000" disabled />
            <p className="text-xs text-muted-foreground">Maximum investment for non-accredited investors</p>
          </div>
        </div>
      ),
    },
    {
      id: "webhooks",
      title: "API & Webhook Settings",
      description: "Configure API access and webhook endpoints",
      icon: Webhook,
      status: "pending",
      statusText: "No Webhooks Configured",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Webhook URLs will be provided for DigiShares integration events including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Investment completed</li>
              <li>KYC status updated</li>
              <li>Distribution processed</li>
              <li>Document signed</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label>Webhook Endpoint URL</Label>
            <Input placeholder="https://api.yourdomain.com/webhooks/digishares" disabled />
          </div>
          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <div className="flex gap-2">
              <Input type="password" value="••••••••••••••••" disabled className="flex-1" />
              <Button variant="outline" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const getStatusBadge = (status: string, text: string) => {
    if (status === "active") {
      return <Badge className="bg-success/20 text-success border-success/30">{text}</Badge>;
    }
    return <Badge variant="secondary">{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings for DigiShares integration
        </p>
      </div>

      {/* DigiShares Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">DigiShares Connection</CardTitle>
                <CardDescription>Platform API connection status</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
              Not Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm">
                Connect to DigiShares to enable tokenization, compliance, and payment features.
              </p>
            </div>
            <Button disabled>
              Connect DigiShares
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {settingsSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(section.status, section.statusText)}
              </div>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
