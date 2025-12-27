import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Type, Upload, Eraser } from 'lucide-react';

interface SignatureCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string, type: 'typed' | 'drawn', saveForFuture: boolean) => void;
  userName?: string;
  savedSignature?: string | null;
}

const FONT_STYLES = [
  { value: 'elegant', label: 'Elegant', className: 'font-serif italic' },
  { value: 'formal', label: 'Formal', className: 'font-serif' },
  { value: 'casual', label: 'Casual', className: 'font-sans' },
  { value: 'script', label: 'Script', className: 'font-serif italic text-2xl' }
];

export const SignatureCapture = ({ 
  isOpen, 
  onClose, 
  onSign, 
  userName = '',
  savedSignature
}: SignatureCaptureProps) => {
  const [activeTab, setActiveTab] = useState<'type' | 'draw' | 'upload'>('type');
  const [typedName, setTypedName] = useState(userName);
  const [fontStyle, setFontStyle] = useState('elegant');
  const [saveForFuture, setSaveForFuture] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && userName) {
      setTypedName(userName);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApply = () => {
    if (activeTab === 'type') {
      if (!typedName.trim()) return;
      onSign(typedName.trim(), 'typed', saveForFuture);
    } else if (activeTab === 'draw') {
      if (!hasDrawn) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSign(dataUrl, 'drawn', saveForFuture);
    }
    onClose();
  };

  const getCurrentFont = () => {
    return FONT_STYLES.find(f => f.value === fontStyle)?.className || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Add Your Signature
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Type
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4 mt-4">
            <div className="border rounded-lg p-6 bg-white min-h-[120px] flex items-center justify-center">
              <span className={`text-3xl text-foreground ${getCurrentFont()}`}>
                {typedName || 'Your Name'}
              </span>
            </div>

            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your full name"
            />

            <Select value={fontStyle} onValueChange={setFontStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select font style" />
              </SelectTrigger>
              <SelectContent>
                {FONT_STYLES.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span className={font.className}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>

          <TabsContent value="draw" className="space-y-4 mt-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={350}
                height={150}
                className="border rounded-lg w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={clearCanvas}
              >
                <Eraser className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Draw your signature above
            </p>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload signature image coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="save-signature"
            checked={saveForFuture}
            onCheckedChange={(checked) => setSaveForFuture(!!checked)}
          />
          <label htmlFor="save-signature" className="text-sm text-muted-foreground">
            Save this signature for future documents
          </label>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            className="flex-1"
            disabled={activeTab === 'type' ? !typedName.trim() : activeTab === 'draw' ? !hasDrawn : true}
          >
            Apply Signature
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
