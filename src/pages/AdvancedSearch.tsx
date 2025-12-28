import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, Building2, Landmark, Target, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearch, SearchFilters } from '@/hooks/useSearch';

const propertyTypes = ['Multifamily', 'Commercial', 'Industrial', 'Retail', 'Office', 'Mixed Use'];
const loanTypes = ['Bridge', 'Fix & Flip', 'Construction', 'Permanent', 'Mezzanine'];
const loanPositions = ['Senior', 'Mezzanine', 'Subordinate'];
const states = ['CA', 'TX', 'FL', 'NY', 'AZ', 'CO', 'WA', 'GA', 'NC', 'TN'];

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const { setFilters, setSearchType, setSearchQuery } = useSearch();
  const [activeTab, setActiveTab] = useState('properties');
  const [localFilters, setLocalFilters] = useState<SearchFilters>({});
  const [query, setQuery] = useState('');

  const handleApplyFilters = () => {
    setSearchQuery(query);
    setSearchType(activeTab as any);
    setFilters(localFilters);
    navigate(`/search?type=${activeTab}${query ? `&q=${encodeURIComponent(query)}` : ''}`);
  };

  const handleReset = () => {
    setLocalFilters({});
    setQuery('');
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setLocalFilters(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated.length > 0 ? updated : undefined };
    });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(k => localFilters[k as keyof SearchFilters] !== undefined).length;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Advanced Search</h1>
              <p className="text-sm text-muted-foreground">Find exactly what you're looking for</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Query */}
        <Card>
          <CardContent className="pt-6">
            <Label className="mb-2 block">Search Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Asset Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-2">
              <Landmark className="h-4 w-4" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-2">
              <Target className="h-4 w-4" />
              Predictions
            </TabsTrigger>
          </TabsList>

          {/* Property Filters */}
          <TabsContent value="properties" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type}`}
                        checked={localFilters.propertyType?.includes(type) || false}
                        onCheckedChange={() => toggleArrayFilter('propertyType', type)}
                      />
                      <Label htmlFor={`property-${type}`} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {states.map(state => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${state}`}
                        checked={localFilters.location?.includes(state) || false}
                        onCheckedChange={() => toggleArrayFilter('location', state)}
                      />
                      <Label htmlFor={`state-${state}`} className="text-sm">{state}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">APY Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Min APY</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.apyMin || ''}
                      onChange={(e) => updateFilter('apyMin', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Max APY</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={localFilters.apyMax || ''}
                      onChange={(e) => updateFilter('apyMax', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Minimum Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={localFilters.minInvestment?.toString() || ''}
                  onValueChange={(v) => updateFilter('minInvestment', v ? Number(v) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any amount</SelectItem>
                    <SelectItem value="50">$50 or less</SelectItem>
                    <SelectItem value="100">$100 or less</SelectItem>
                    <SelectItem value="500">$500 or less</SelectItem>
                    <SelectItem value="1000">$1,000 or less</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Filters */}
          <TabsContent value="loans" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {loanTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`loan-${type}`}
                        checked={localFilters.loanType?.includes(type) || false}
                        onCheckedChange={() => toggleArrayFilter('loanType', type)}
                      />
                      <Label htmlFor={`loan-${type}`} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {loanPositions.map(pos => (
                    <div key={pos} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pos-${pos}`}
                        checked={localFilters.loanPosition?.includes(pos) || false}
                        onCheckedChange={() => toggleArrayFilter('loanPosition', pos)}
                      />
                      <Label htmlFor={`pos-${pos}`} className="text-sm">{pos}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Max LTV Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={[localFilters.ltvMax || 100]}
                    onValueChange={([v]) => updateFilter('ltvMax', v < 100 ? v : undefined)}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium text-foreground">{localFilters.ltvMax || 100}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">APY Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Min APY</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={localFilters.apyMin || ''}
                      onChange={(e) => updateFilter('apyMin', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground">Max APY</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={localFilters.apyMax || ''}
                      onChange={(e) => updateFilter('apyMax', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prediction Filters */}
          <TabsContent value="predictions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {['active', 'closing_soon', 'resolved'].map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={localFilters.status?.includes(status) || false}
                        onCheckedChange={() => toggleArrayFilter('status', status)}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={localFilters.volume || ''}
                  onValueChange={(v) => updateFilter('volume', v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any volume</SelectItem>
                    <SelectItem value="high">High volume ($100k+)</SelectItem>
                    <SelectItem value="medium">Medium volume ($10k-$100k)</SelectItem>
                    <SelectItem value="low">Low volume (&lt;$10k)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Closing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={localFilters.closingTime || ''}
                  onValueChange={(v) => updateFilter('closingTime', v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    <SelectItem value="24h">Closing in 24 hours</SelectItem>
                    <SelectItem value="7d">Closing in 7 days</SelectItem>
                    <SelectItem value="30d">Closing in 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button className="flex-1" onClick={handleApplyFilters}>
            <Search className="h-4 w-4 mr-2" />
            Search
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}