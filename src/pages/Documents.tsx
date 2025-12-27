import { useState } from 'react';
import { useDocuments, DocumentEnvelope } from '@/hooks/useDocuments';
import { DocumentSigningModal } from '@/components/DocumentSigningModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';
import { format } from 'date-fns';
import { 
  FileText, 
  AlertCircle, 
  Check, 
  Download, 
  Eye,
  ChevronRight,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const navigate = useNavigate();
  const { envelopes, getPendingDocuments, getSignedDocuments, loading } = useDocuments();
  const [selectedEnvelope, setSelectedEnvelope] = useState<DocumentEnvelope | null>(null);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('action');

  const pendingDocs = getPendingDocuments();
  const signedDocs = getSignedDocuments();

  const handleOpenDocument = (envelope: DocumentEnvelope) => {
    setSelectedEnvelope(envelope);
    setIsSigningOpen(true);
  };

  const getExpiresIn = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Document Center</h1>
            <p className="text-muted-foreground">Manage your investment documents</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="action" className="relative">
              Action Required
              {pendingDocs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingDocs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="signed">Signed</TabsTrigger>
            <TabsTrigger value="all">All Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="action" className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : pendingDocs.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg">All caught up!</h3>
                <p className="text-muted-foreground">No documents requiring your signature</p>
              </div>
            ) : (
              pendingDocs.map((envelope) => (
                <div 
                  key={envelope.id}
                  className="border rounded-lg p-4 bg-card hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {envelope.template?.name || 'Document'}
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Sign Now
                          </Badge>
                        </h3>
                        {envelope.investment_amount && (
                          <p className="text-sm text-muted-foreground">
                            ${envelope.investment_amount.toLocaleString()} Investment
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getExpiresIn(envelope.expires_at)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleOpenDocument(envelope)}>
                      Review & Sign
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="signed" className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : signedDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No signed documents</h3>
                <p className="text-muted-foreground">Documents you sign will appear here</p>
              </div>
            ) : (
              signedDocs.map((envelope) => (
                <div 
                  key={envelope.id}
                  className="border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {envelope.template?.name || 'Document'}
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Signed
                          </Badge>
                        </h3>
                        {envelope.signed_at && (
                          <p className="text-sm text-muted-foreground">
                            Signed {format(new Date(envelope.signed_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : envelopes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No documents yet</h3>
                <p className="text-muted-foreground">Your investment documents will appear here</p>
              </div>
            ) : (
              envelopes.map((envelope) => {
                const isSigned = envelope.status === 'signed' || envelope.status === 'completed';
                return (
                  <div 
                    key={envelope.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSigned ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {isSigned ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {envelope.template?.name || 'Document'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isSigned && envelope.signed_at
                              ? `Signed ${format(new Date(envelope.signed_at), 'MMM d, yyyy')}`
                              : `Created ${format(new Date(envelope.created_at), 'MMM d, yyyy')}`
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant={isSigned ? 'outline' : 'secondary'}>
                        {envelope.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DocumentSigningModal
        isOpen={isSigningOpen}
        onClose={() => setIsSigningOpen(false)}
        envelope={selectedEnvelope}
      />

      <BottomNav />
    </div>
  );
};

export default Documents;
