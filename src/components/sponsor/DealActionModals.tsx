import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Pause, 
  Play, 
  XCircle, 
  CalendarDays, 
  DollarSign, 
  FileText, 
  LogOut,
  AlertTriangle,
  Users,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { SponsorDeal } from "@/hooks/useSponsorDeals";

interface DealActionModalsProps {
  deal: SponsorDeal;
  onUpdate: () => void;
}

// Pause/Resume Modal
export function PauseResumeModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: () => void;
}) {
  const isPaused = deal.status === "paused";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isPaused ? <Play className="h-5 w-5 text-green-500" /> : <Pause className="h-5 w-5 text-yellow-500" />}
            {isPaused ? "Resume Raise" : "Pause Raise"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPaused 
              ? "Are you sure you want to resume accepting investments for this deal? Investors will be able to invest again."
              : "Are you sure you want to pause this raise? New investments will be temporarily suspended until you resume."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isPaused ? "Resume Raise" : "Pause Raise"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Close Deal Early Modal
export function CloseEarlyModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Close Deal Early
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Are you sure you want to close this deal early? This action cannot be undone.</p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Raised:</span>
                <span className="font-medium">${deal.amount_raised?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investors:</span>
                <span className="font-medium">{deal.investor_count || 0}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              All investors will be notified that the deal has been closed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Close Deal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Extend Deadline Modal
export function ExtendDeadlineModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: (newDate: Date, notifyInvestors: boolean) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [notifyInvestors, setNotifyInvestors] = useState(true);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate, notifyInvestors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Extend Deadline
          </DialogTitle>
          <DialogDescription>
            Select a new deadline for this raise. Investors will be notified of the extension.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify Investors</Label>
              <p className="text-sm text-muted-foreground">Send email notification about the extension</p>
            </div>
            <Switch checked={notifyInvestors} onCheckedChange={setNotifyInvestors} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!selectedDate}>Extend Deadline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Record Distribution Modal
interface DistributionData {
  amount: number;
  date: Date;
  type: string;
  memo: string;
}

export function RecordDistributionModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: (data: DistributionData) => void;
}) {
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [distributionType, setDistributionType] = useState("cash");
  const [memo, setMemo] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const investorCount = deal.investor_count || 5; // Mock
  const perInvestorAmount = amount ? parseFloat(amount) / investorCount : 0;

  const handleConfirm = () => {
    if (amount && selectedDate) {
      onConfirm({
        amount: parseFloat(amount),
        date: selectedDate,
        type: distributionType,
        memo,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Record Distribution
          </DialogTitle>
          <DialogDescription>
            Record a distribution to investors. They will be notified automatically.
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Total Distribution Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Distribution Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Distribution Type</Label>
              <Select value={distributionType} onValueChange={setDistributionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash Distribution</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="return_of_capital">Return of Capital</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Memo / Notes</Label>
              <Textarea
                placeholder="Add any notes about this distribution..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Distribution Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate && format(selectedDate, "PPP")}</span>
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{distributionType.replace("_", " ")}</span>
                <span className="text-muted-foreground">Investors:</span>
                <span className="font-medium">{investorCount}</span>
                <span className="text-muted-foreground">Avg per Investor:</span>
                <span className="font-medium">${perInvestorAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              {memo && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground text-sm">Memo:</span>
                  <p className="text-sm">{memo}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm">
                All {investorCount} investors will receive an email notification about this distribution.
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {showPreview ? (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)}>Back</Button>
              <Button onClick={handleConfirm}>Confirm Distribution</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setShowPreview(true)} disabled={!amount || !selectedDate}>
                Preview Distribution
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Upload Update Modal
export function UploadUpdateModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: (data: { title: string; content: string; attachments: File[]; notifyInvestors: boolean }) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [notifyInvestors, setNotifyInvestors] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    onConfirm({ title, content, attachments, notifyInvestors });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Post Update
          </DialogTitle>
          <DialogDescription>
            Share an update with your investors. This could be a quarterly report, milestone announcement, or any relevant news.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Update Title</Label>
            <Input
              placeholder="e.g., Q4 2024 Quarterly Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Update Content</Label>
            <Textarea
              placeholder="Write your update here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="update-attachments"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <label 
                htmlFor="update-attachments" 
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload financial statements or documents
                </span>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notify Investors</Label>
              <p className="text-sm text-muted-foreground">Send email notification about this update</p>
            </div>
            <Switch checked={notifyInvestors} onCheckedChange={setNotifyInvestors} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!title || !content}>Post Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exit Deal Modal
export function ExitDealModal({ 
  open, 
  onOpenChange, 
  deal, 
  onConfirm 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  deal: SponsorDeal;
  onConfirm: (data: { salePrice: number; finalDistribution: number; exitNotes: string }) => void;
}) {
  const [salePrice, setSalePrice] = useState("");
  const [finalDistribution, setFinalDistribution] = useState("");
  const [exitNotes, setExitNotes] = useState("");
  const [step, setStep] = useState(1);

  const totalInvested = deal.amount_raised || 100000; // Mock
  const returnMultiple = salePrice ? parseFloat(salePrice) / totalInvested : 0;
  const projectedIRR = 15; // Mock calculation

  const handleConfirm = () => {
    onConfirm({
      salePrice: parseFloat(salePrice),
      finalDistribution: parseFloat(finalDistribution),
      exitNotes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            Exit Deal
          </DialogTitle>
          <DialogDescription>
            Record the final exit for this deal. This will trigger final distributions and move the deal to "Exited" status.
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600">This action is permanent</p>
                <p className="text-sm text-muted-foreground">
                  Once you exit this deal, it cannot be undone. All investors will receive their final distributions.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sale Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Final Distribution Amount (after fees)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={finalDistribution}
                  onChange={(e) => setFinalDistribution(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Exit Notes</Label>
              <Textarea
                placeholder="Add any notes about the exit..."
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <h4 className="font-semibold">Exit Summary</h4>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Sale Price:</span>
                <span className="font-medium">${parseFloat(salePrice).toLocaleString()}</span>
                <span className="text-muted-foreground">Total Invested:</span>
                <span className="font-medium">${totalInvested.toLocaleString()}</span>
                <span className="text-muted-foreground">Return Multiple:</span>
                <span className="font-medium">{returnMultiple.toFixed(2)}x</span>
                <span className="text-muted-foreground">Est. IRR:</span>
                <span className="font-medium">{projectedIRR}%</span>
                <span className="text-muted-foreground">Final Distribution:</span>
                <span className="font-medium">${parseFloat(finalDistribution).toLocaleString()}</span>
                <span className="text-muted-foreground">Investors:</span>
                <span className="font-medium">{deal.investor_count || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">What happens next:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Final distributions will be processed</li>
                <li>• All investors will be notified</li>
                <li>• Exit report will be generated</li>
                <li>• Deal status will change to "Exited"</li>
              </ul>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleConfirm}>Confirm Exit</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!salePrice || !finalDistribution}>
                Review Exit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
