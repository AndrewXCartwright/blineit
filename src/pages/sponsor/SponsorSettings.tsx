import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Monitor,
  MapPin,
  Download,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Lock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const mockSessions = [
  { id: '1', device: 'Chrome on MacOS', location: 'San Francisco, CA', lastActive: 'Now', current: true },
  { id: '2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
  { id: '3', device: 'Firefox on Windows', location: 'New York, NY', lastActive: '3 days ago', current: false },
];

const mockLoginHistory = [
  { id: '1', date: '2024-01-15 10:30 AM', device: 'Chrome on MacOS', location: 'San Francisco, CA', status: 'success' },
  { id: '2', date: '2024-01-14 03:15 PM', device: 'Safari on iPhone', location: 'San Francisco, CA', status: 'success' },
  { id: '3', date: '2024-01-13 09:00 AM', device: 'Chrome on MacOS', location: 'San Francisco, CA', status: 'success' },
  { id: '4', date: '2024-01-12 11:45 PM', device: 'Unknown Device', location: 'Mumbai, India', status: 'failed' },
];

const mockApiKeys = [
  { id: '1', name: 'Production API', prefix: 'sk_live_****', created: '2024-01-01', lastUsed: '2 hours ago' },
  { id: '2', name: 'Development API', prefix: 'sk_test_****', created: '2023-12-15', lastUsed: '5 days ago' },
];

const mockPaymentHistory = [
  { id: '1', date: '2024-01-15', description: 'Q4 Distribution - Sunset Apartments', amount: 245000, type: 'distribution' },
  { id: '2', date: '2024-01-01', description: 'Platform Fee - January', amount: -1250, type: 'fee' },
  { id: '3', date: '2023-12-15', description: 'Q3 Distribution - Downtown Office', amount: 189000, type: 'distribution' },
  { id: '4', date: '2023-12-01', description: 'Platform Fee - December', amount: -1250, type: 'fee' },
];

export default function SponsorSettings() {
  const { user, signOut } = useAuth();
  const { sponsorProfile } = useSponsor();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Form states
  const [contactName, setContactName] = useState(sponsorProfile?.contact_name || 'John Smith');
  const [contactEmail, setContactEmail] = useState(sponsorProfile?.contact_email || 'john@sunsetproperties.com');
  const [contactPhone, setContactPhone] = useState(sponsorProfile?.contact_phone || '(555) 123-4567');
  const [bio, setBio] = useState('Experienced real estate professional with 15+ years in multifamily investments.');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/johnsmith');
  const [notificationMethod, setNotificationMethod] = useState('email');

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Settings saved successfully");
    setIsLoading(false);
  };

  const handleCopyKey = (keyId: string) => {
    navigator.clipboard.writeText('sk_live_xxxxxxxxxxxxxxxxxxxx');
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success('API key copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/sponsor/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/sponsor/dashboard">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </Link>
            <Badge variant="secondary" className="hidden sm:flex bg-primary/10 text-primary">
              <Building2 className="h-3 w-3 mr-1" />
              Sponsor
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your sponsor profile and account preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4 hidden sm:block" />
              Company
            </TabsTrigger>
            <TabsTrigger value="banking" className="gap-2">
              <CreditCard className="h-4 w-4 hidden sm:block" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:block" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your contact details visible to investors and platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">JS</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG up to 2MB. Recommended 400x400px
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">
                      <User className="h-3 w-3 inline mr-1" />
                      Contact Name
                    </Label>
                    <Input
                      id="contact_name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">
                      <Mail className="h-3 w-3 inline mr-1" />
                      Contact Email
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="contact_email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@company.com"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">Verify</Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">
                      <Phone className="h-3 w-3 inline mr-1" />
                      Contact Phone
                    </Label>
                    <Input
                      id="contact_phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">
                      <Linkedin className="h-3 w-3 inline mr-1" />
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell investors about your background and experience..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">This will be shown on your deal pages</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details visible to investors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB. Recommended 400x400px
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="company_name"
                        defaultValue={sponsorProfile?.company_name || "Sunset Properties LLC"}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" className="shrink-0">Re-verify</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Changing requires re-verification</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">Years in Business</Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      defaultValue="15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_address">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Business Address
                  </Label>
                  <Textarea
                    id="business_address"
                    defaultValue="123 Investment Blvd, Suite 400&#10;San Francisco, CA 94105"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ein">EIN / Tax ID</Label>
                    <div className="relative">
                      <Input
                        id="ein"
                        type={showPassword ? "text" : "password"}
                        value="XX-XXXXXXX"
                        readOnly
                        className="pr-10 bg-muted"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Contact support to change</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <Globe className="h-3 w-3 inline mr-1" />
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      defaultValue="https://sunsetproperties.com"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description">Company Description</Label>
                  <Textarea
                    id="company_description"
                    placeholder="Tell investors about your company, experience, and investment philosophy..."
                    rows={4}
                    defaultValue="Sunset Properties LLC is a premier real estate investment firm specializing in multifamily acquisitions across the Western United States. With over $500M in assets under management, we deliver consistent returns to our investor partners."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Documents</CardTitle>
                <CardDescription>Upload updated legal and verification documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Articles of Incorporation, Operating Agreement, etc.
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Bank Account</CardTitle>
                <CardDescription>Account for receiving distributions and platform fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Chase Business Checking</p>
                      <p className="text-sm text-muted-foreground">Account ending in ****4521</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Verified</Badge>
                </div>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Banking Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Distributions and platform fees</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPaymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className={`text-right font-medium ${payment.amount < 0 ? 'text-destructive' : 'text-green-500'}`}>
                          {payment.amount < 0 ? '-' : '+'}${Math.abs(payment.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>Download your tax forms</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download W-9
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Notification Method</Label>
                  <Select value={notificationMethod} onValueChange={setNotificationMethod}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Investment Notifications</h4>
                  {[
                    { id: "new_investment", label: "New Investment Received", desc: "When an investor commits to your deal" },
                    { id: "deal_funded", label: "Deal Fully Funded", desc: "When a deal reaches 100% funding" },
                    { id: "milestones", label: "Deal Milestones", desc: "When deals reach 25%, 50%, 75% funded" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Communication</h4>
                  {[
                    { id: "investor_message", label: "New Investor Message", desc: "When you receive a message from an investor" },
                    { id: "document_requests", label: "Document Requests", desc: "When investors request additional documents" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Platform Updates</h4>
                  {[
                    { id: "announcements", label: "Platform Announcements", desc: "Important updates from B-LINE-IT" },
                    { id: "distribution_reminders", label: "Distribution Reminders", desc: "Reminders about upcoming distributions" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input id="current_password" type="password" />
                  </div>
                  <div />
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input id="new_password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input id="confirm_password" type="password" />
                  </div>
                </div>
                <Button>
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        {twoFactorEnabled ? 'Enabled' : 'Use an authenticator app for 2FA'}
                      </p>
                    </div>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Devices currently logged into your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && <Badge variant="secondary" className="text-xs">Current</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent login attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLoginHistory.map((login) => (
                      <TableRow key={login.id}>
                        <TableCell className="text-muted-foreground">{login.date}</TableCell>
                        <TableCell>{login.device}</TableCell>
                        <TableCell>{login.location}</TableCell>
                        <TableCell>
                          <Badge variant={login.status === 'success' ? 'secondary' : 'destructive'}>
                            {login.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage API keys for integrations</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockApiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {key.prefix} • Last used {key.lastUsed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleCopyKey(key.id)}>
                        {copiedKey === key.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator />

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your sponsor account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
