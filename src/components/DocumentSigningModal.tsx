import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SignatureCapture } from './SignatureCapture';
import { DocumentEnvelope, DocumentField, useDocuments } from '@/hooks/useDocuments';
import { format } from 'date-fns';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Check, 
  Pen,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelope: DocumentEnvelope | null;
  onSigned?: () => void;
}

// Demo document content
const DEMO_DOCUMENT_PAGES = [
  {
    title: 'PRIVATE PLACEMENT MEMORANDUM',
    content: `SUNSET APARTMENTS LLC
A Texas Limited Liability Company

$2,400,000 Class A Membership Units

─────────────────────────────────

THESE SECURITIES HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED (THE "SECURITIES ACT"), OR THE SECURITIES LAWS OF ANY STATE AND ARE BEING OFFERED AND SOLD IN RELIANCE ON EXEMPTIONS FROM THE REGISTRATION REQUIREMENTS OF SAID ACT AND SUCH LAWS.

THE SECURITIES ARE SUBJECT TO RESTRICTIONS ON TRANSFERABILITY AND RESALE AND MAY NOT BE TRANSFERRED OR RESOLD EXCEPT AS PERMITTED UNDER THE SECURITIES ACT AND SUCH LAWS PURSUANT TO REGISTRATION OR EXEMPTION THEREFROM.`
  },
  {
    title: 'RISK FACTORS',
    content: `INVESTMENT IN THE COMPANY INVOLVES SIGNIFICANT RISKS. THE FOLLOWING RISK FACTORS SHOULD BE CAREFULLY CONSIDERED:

1. ILLIQUIDITY OF INVESTMENT
There is no public market for the Securities, and none is expected to develop. The Securities are subject to substantial restrictions on transfer.

2. OPERATING RISKS
Real estate investments are subject to varying degrees of risk, including changes in local or national economic conditions, neighborhood values, competitive overbuilding, and increased operating costs.

3. LACK OF DIVERSIFICATION
The Company's investments will be concentrated in a single property, subjecting investors to greater risk than a more diversified portfolio.`
  },
  {
    title: 'SUBSCRIPTION TERMS',
    content: `MINIMUM INVESTMENT
The minimum investment is $1,000. The Manager may accept subscriptions for lesser amounts in its sole discretion.

SUBSCRIPTION PROCEDURE
To subscribe for Securities, an investor must:
1. Complete and execute the Subscription Agreement
2. Complete the Investor Questionnaire
3. Deliver payment for the Securities

CLOSING
The offering will close upon the earlier of (i) the sale of all Securities offered, or (ii) the date determined by the Manager.`
  }
];

export const DocumentSigningModal = ({ 
  isOpen, 
  onClose, 
  envelope,
  onSigned
}: DocumentSigningModalProps) => {
  const { signDocument, markAsViewed, saveSignature } = useDocuments();
  const [currentPage, setCurrentPage] = useState(0);
  const [hasReadDocument, setHasReadDocument] = useState(false);
  const [acknowledgeRead, setAcknowledgeRead] = useState(false);
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);
  const [acknowledgeAccredited, setAcknowledgeAccredited] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const totalPages = DEMO_DOCUMENT_PAGES.length + 1; // +1 for signature page

  useEffect(() => {
    if (isOpen && envelope) {
      markAsViewed(envelope.id);
      setCurrentPage(0);
      setHasReadDocument(false);
      setAcknowledgeRead(false);
      setAcknowledgeRisks(false);
      setAcknowledgeAccredited(false);
      setSignature(null);
    }
  }, [isOpen, envelope?.id]);

  useEffect(() => {
    if (currentPage === DEMO_DOCUMENT_PAGES.length - 1) {
      setHasReadDocument(true);
    }
  }, [currentPage]);

  const handleSign = async (signatureData: string, type: 'typed' | 'drawn', save: boolean) => {
    setSignature(signatureData);
    if (save) {
      await saveSignature(signatureData, type);
    }
  };

  const handleSubmitSignature = async () => {
    if (!envelope || !signature) return;

    setSigning(true);
    const fields = [
      { field_name: 'acknowledge_read', field_value: 'true' },
      { field_name: 'acknowledge_risks', field_value: 'true' },
      { field_name: 'acknowledge_accredited', field_value: 'true' }
    ];

    const success = await signDocument(envelope.id, signature, fields);
    setSigning(false);

    if (success) {
      toast.success('📧 Demo: Document would be sent via DocuSign');
      onSigned?.();
      onClose();
    }
  };

  const canSign = acknowledgeRead && acknowledgeRisks && acknowledgeAccredited && signature;
  const isSignaturePage = currentPage === totalPages - 1;

  if (!envelope) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {envelope.template?.name || 'Document'}
              </DialogTitle>
              <Badge variant="outline">
                Page {currentPage + 1} of {totalPages}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            {isSignaturePage ? (
              <div className="space-y-6 p-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">Investor Acknowledgments</h3>
                  <p className="text-sm text-muted-foreground">
                    Please review and confirm the following before signing
                  </p>
                </div>

                {envelope.investment_amount && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Investment Amount:</span>
                      <span className="font-semibold text-lg">
                        ${envelope.investment_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id="acknowledge-read"
                      checked={acknowledgeRead}
                      onCheckedChange={(c) => setAcknowledgeRead(!!c)}
                    />
                    <label htmlFor="acknowledge-read" className="text-sm cursor-pointer">
                      I have read and understand the Private Placement Memorandum and all related disclosure documents.
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id="acknowledge-risks"
                      checked={acknowledgeRisks}
                      onCheckedChange={(c) => setAcknowledgeRisks(!!c)}
                    />
                    <label htmlFor="acknowledge-risks" className="text-sm cursor-pointer">
                      I understand this is a high-risk investment and I may lose some or all of my investment.
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id="acknowledge-accredited"
                      checked={acknowledgeAccredited}
                      onCheckedChange={(c) => setAcknowledgeAccredited(!!c)}
                    />
                    <label htmlFor="acknowledge-accredited" className="text-sm cursor-pointer">
                      I am an accredited investor as defined by SEC regulations.
                    </label>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-3">Signature:</p>
                  {signature ? (
                    <div className="flex items-center justify-between">
                      <div className="bg-white border rounded p-4 min-w-[200px]">
                        {signature.startsWith('data:') ? (
                          <img src={signature} alt="Signature" className="h-12 object-contain" />
                        ) : (
                          <span className="font-serif italic text-2xl">{signature}</span>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => setShowSignature(true)}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full h-16 border-primary text-primary"
                      onClick={() => setShowSignature(true)}
                    >
                      <Pen className="w-5 h-5 mr-2" />
                      Click to Sign
                    </Button>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Date: {format(new Date(), 'MMMM dd, yyyy')}
                </div>

                {!canSign && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Please check all boxes and add your signature to continue
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-8 min-h-[400px]">
                <h2 className="text-xl font-bold mb-4 text-center">
                  {DEMO_DOCUMENT_PAGES[currentPage].title}
                </h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
                  {DEMO_DOCUMENT_PAGES[currentPage].content}
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex-shrink-0 border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>
              </div>

              {isSignaturePage ? (
                <Button 
                  onClick={handleSubmitSignature}
                  disabled={!canSign || signing}
                >
                  {signing ? 'Signing...' : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Sign Document
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => setCurrentPage(p => p + 1)}>
                  {currentPage === DEMO_DOCUMENT_PAGES.length - 1 ? 'Continue to Sign' : 'Next Page'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {!isSignaturePage && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Fields remaining: 1 signature • Read all pages before signing
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SignatureCapture
        isOpen={showSignature}
        onClose={() => setShowSignature(false)}
        onSign={handleSign}
      />
    </>
  );
};
