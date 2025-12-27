import { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useComparison } from '@/hooks/useComparison';

interface SaveComparisonDialogProps {
  defaultName?: string;
}

export function SaveComparisonDialog({ defaultName = '' }: SaveComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const { saveComparison, items, isLoading } = useComparison();

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveComparison(name);
    setOpen(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="comparison-name">Comparison Name</Label>
            <Input
              id="comparison-name"
              placeholder="Austin vs Miami Properties"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-sm">Items included:</Label>
            <ul className="mt-2 text-sm space-y-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Comparison'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
