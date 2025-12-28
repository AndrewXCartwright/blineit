import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccreditation } from "@/hooks/useAccreditation";
import { format, differenceInDays } from "date-fns";

const AccreditationStatus = () => {
  const navigate = useNavigate();
  const { accreditation, isLoading } = useAccreditation();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          badgeVariant: 'default' as const,
          label: 'Verified'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          badgeVariant: 'secondary' as const,
          label: 'Pending Review'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          badgeVariant: 'destructive' as const,
          label: 'Rejected'
        };
      case 'expired':
        return {
          icon: RefreshCw,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          badgeVariant: 'outline' as const,
          label: 'Expired'
        };
      default:
        return {
          icon: Shield,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          badgeVariant: 'outline' as const,
          label: 'Not Started'
        };
    }
  };

  // Mock data for demo
  const mockAccreditation = accreditation || {
    verification_status: 'verified',
    accreditation_type: 'income',
    investor_type: 'individual',
    verified_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      { name: 'Tax Return 2023', uploaded_at: '2024-01-15' },
      { name: 'CPA Letter', uploaded_at: '2024-01-15' }
    ]
  };

  const statusConfig = getStatusConfig(mockAccreditation.verification_status);
  const StatusIcon = statusConfig.icon;
  const daysUntilExpiry = mockAccreditation.expires_at 
    ? differenceInDays(new Date(mockAccreditation.expires_at), new Date())
    : null;

  const verificationSteps = [
    { label: 'Application Submitted', completed: true, date: '2024-01-15' },
    { label: 'Documents Uploaded', completed: true, date: '2024-01-15' },
    { label: 'Under Review', completed: mockAccreditation.verification_status !== 'pending', date: '2024-01-16' },
    { label: 'Verification Complete', completed: mockAccreditation.verification_status === 'verified', date: mockAccreditation.verified_at ? format(new Date(mockAccreditation.verified_at), 'yyyy-MM-dd') : null }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Accreditation Status</h1>
          </div>
        </header>
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Accreditation Status</h1>
        </div>
      </header>
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <Card className={statusConfig.bgColor}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${statusConfig.bgColor}`}>
                <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">Accreditation Status</h2>
                  <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {mockAccreditation.verification_status === 'verified' 
                    ? `Verified on ${format(new Date(mockAccreditation.verified_at!), 'MMM d, yyyy')}`
                    : mockAccreditation.verification_status === 'pending'
                    ? 'Your application is being reviewed'
                    : mockAccreditation.verification_status === 'rejected'
                    ? 'Your application needs additional information'
                    : 'Start your verification to access exclusive offerings'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Warning */}
        {daysUntilExpiry !== null && daysUntilExpiry <= 60 && mockAccreditation.verification_status === 'verified' && (
          <Card className="border-orange-500/50 bg-orange-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-orange-700 dark:text-orange-300">
                    Accreditation expires in {daysUntilExpiry} days
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Renew before {format(new Date(mockAccreditation.expires_at!), 'MMM d, yyyy')} to maintain access
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/accreditation')}>
                  Renew Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1 rounded-full ${step.completed ? 'bg-green-500' : 'bg-muted'}`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? '' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {step.date && step.completed && (
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    )}
                  </div>
                  {index < verificationSteps.length - 1 && (
                    <div className="absolute left-[1.1rem] mt-6 h-8 w-0.5 bg-muted" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accreditation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accreditation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Investor Type</p>
                <p className="font-medium capitalize">{mockAccreditation.investor_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Qualification Method</p>
                <p className="font-medium capitalize">{mockAccreditation.accreditation_type}</p>
              </div>
              {mockAccreditation.verified_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Verified Date</p>
                  <p className="font-medium">{format(new Date(mockAccreditation.verified_at), 'MMM d, yyyy')}</p>
                </div>
              )}
              {mockAccreditation.expires_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Expiration Date</p>
                  <p className="font-medium">{format(new Date(mockAccreditation.expires_at), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(mockAccreditation.documents as any[] || []).map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {doc.uploaded_at}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {mockAccreditation.verification_status === 'verified' && (
            <Button onClick={() => navigate('/institutional')} className="w-full">
              Access Exclusive Offerings
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {mockAccreditation.verification_status === 'rejected' && (
            <Button onClick={() => navigate('/accreditation')} className="w-full">
              Resubmit Application
            </Button>
          )}
          {!accreditation && (
            <Button onClick={() => navigate('/accreditation')} className="w-full">
              Start Verification
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccreditationStatus;
