import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DocumentSigningModal } from './DocumentSigningModal';
import { DocumentEnvelope, DocumentTemplate, useDocuments } from '@/hooks/useDocuments';
import { 
  FileText, 
  Check, 
  Lock, 
  Eye, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface InvestmentDocumentsProps {
  investmentType: 'equity' | 'debt';
  propertyId?: string;
  loanId?: string;
  investmentAmount?: number;
  onAllSigned?: () => void;
  onBack?: () => void;
}

export const InvestmentDocuments = ({
  investmentType,
  propertyId,
  loanId,
  investmentAmount,
  onAllSigned,
  onBack
}: InvestmentDocumentsProps) => {
  const { 
    templates, 
    envelopes, 
    createEnvelopesForInvestment,
    getTemplatesForInvestment,
    loading
  } = useDocuments();

  const [documentEnvelopes, setDocumentEnvelopes] = useState<DocumentEnvelope[]>([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState<DocumentEnvelope | null>(null);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const requiredTemplates = getTemplatesForInvestment(investmentType);

  useEffect(() => {
    const initializeDocuments = async () => {
      if (requiredTemplates.length > 0 && !loading) {
        setInitializing(true);
        await createEnvelopesForInvestment(investmentType, propertyId, loanId, investmentAmount);
        setInitializing(false);
      }
    };
    initializeDocuments();
  }, [investmentType, propertyId, loanId, loading]);

  useEffect(() => {
    // Match envelopes to templates
    const matched = requiredTemplates.map(template => {
      return envelopes.find(e => 
        e.template_id === template.id &&
        e.property_id === propertyId &&
        e.loan_id === loanId
      );
    }).filter(Boolean) as DocumentEnvelope[];

    setDocumentEnvelopes(matched);
  }, [envelopes, requiredTemplates, propertyId, loanId]);

  const signedCount = documentEnvelopes.filter(e => 
    e.status === 'signed' || e.status === 'completed'
  ).length;
  const totalCount = requiredTemplates.length;
  const allSigned = signedCount === totalCount && totalCount > 0;
  const progress = totalCount > 0 ? (signedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (allSigned) {
      onAllSigned?.();
    }
  }, [allSigned]);

  const getDocumentStatus = (envelope: DocumentEnvelope | undefined, index: number) => {
    if (!envelope) return 'loading';
    if (envelope.status === 'signed' || envelope.status === 'completed') return 'signed';
    
    // Check if previous documents are signed
    const previousEnvelopes = documentEnvelopes.slice(0, index);
    const allPreviousSigned = previousEnvelopes.every(e => 
      e.status === 'signed' || e.status === 'completed'
    );
    
    if (!allPreviousSigned && index > 0) return 'locked';
    return 'ready';
  };

  const handleOpenDocument = (envelope: DocumentEnvelope) => {
    setSelectedEnvelope(envelope);
    setIsSigningOpen(true);
  };

  if (initializing || loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
        <p className="text-sm text-muted-foreground mt-4">Preparing documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review & Sign Documents
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Before investing, please review and sign these required documents
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {requiredTemplates.map((template, index) => {
          const envelope = documentEnvelopes.find(e => e.template_id === template.id);
          const status = getDocumentStatus(envelope, index);

          return (
            <div 
              key={template.id}
              className={`border rounded-lg p-4 transition-all ${
                status === 'ready' ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    status === 'signed' ? 'bg-green-100 text-green-600' :
                    status === 'locked' ? 'bg-muted text-muted-foreground' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {status === 'signed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {template.description}
                    </p>
                    {status === 'signed' && envelope?.signed_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Signed {format(new Date(envelope.signed_at), 'MMM d, yyyy \'at\' h:mm a')}
                      </p>
                    )}
                    {status === 'locked' && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Sign previous document first
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status === 'signed' ? (
                    <>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <Check className="w-3 h-3 mr-1" />
                        Signed
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </>
                  ) : status === 'locked' ? (
                    <Button variant="outline" size="sm" disabled>
                      <Lock className="w-4 h-4 mr-1" />
                      Locked
                    </Button>
                  ) : status === 'ready' && envelope ? (
                    <Button size="sm" onClick={() => handleOpenDocument(envelope)}>
                      Review & Sign
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Loading...
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {signedCount} of {totalCount} documents signed
          </span>
          {allSigned && (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              All Complete
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {allSigned && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-green-900">All Documents Signed</h4>
            <p className="text-sm text-green-700">You're ready to proceed with your investment</p>
          </div>
        </div>
      )}

      <DocumentSigningModal
        isOpen={isSigningOpen}
        onClose={() => setIsSigningOpen(false)}
        envelope={selectedEnvelope}
        onSigned={() => setSelectedEnvelope(null)}
      />
    </div>
  );
};
