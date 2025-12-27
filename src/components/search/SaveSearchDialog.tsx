import { useState } from 'react';
import { Save, Bell } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';

interface SaveSearchDialogProps {
  filters: SearchFiltersType;
  searchType: string;
  onSave: (name: string, notifyNewMatches: boolean) => void;
  isSaving?: boolean;
}

export function SaveSearchDialog({ filters, searchType, onSave, isSaving }: SaveSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notifyNewMatches, setNotifyNewMatches] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, notifyNewMatches);
    setOpen(false);
    setName('');
    setNotifyNewMatches(false);
  };

  const formatFilters = () => {
    const parts: string[] = [];
    
    if (filters.location?.length) {
      parts.push(`Location: ${filters.location.join(', ')}`);
    }
    if (filters.propertyType?.length) {
      parts.push(`Type: ${filters.propertyType.join(', ')}`);
    }
    if (filters.apyMin !== undefined || filters.apyMax !== undefined) {
      parts.push(`APY: ${filters.apyMin || 0}% - ${filters.apyMax || 20}%`);
    }
    if (filters.loanType?.length) {
      parts.push(`Loan Type: ${filters.loanType.join(', ')}`);
    }
    
    return parts;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save This Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="High Yield Austin Properties"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-sm">Current Filters:</Label>
            <ul className="mt-2 text-sm space-y-1">
              {formatFilters().map((filter, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {filter}
                </li>
              ))}
              {formatFilters().length === 0 && (
                <li className="text-muted-foreground">No filters applied</li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="notify" className="cursor-pointer">
                  Notify me when new matches are listed
                </Label>
                <p className="text-xs text-muted-foreground">
                  Email + Push notification
                </p>
              </div>
            </div>
            <Switch
              id="notify"
              checked={notifyNewMatches}
              onCheckedChange={setNotifyNewMatches}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
