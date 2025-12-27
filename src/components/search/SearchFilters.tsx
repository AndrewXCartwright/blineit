import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  type: 'properties' | 'loans' | 'predictions';
  resultsCount?: number;
}

const locations = [
  'Austin, TX',
  'Miami, FL',
  'Phoenix, AZ',
  'Denver, CO',
  'Nashville, TN',
  'Atlanta, GA',
  'Dallas, TX',
  'Seattle, WA',
];

const propertyTypes = [
  'Multifamily',
  'Single Family',
  'Commercial',
  'Industrial',
  'Retail',
  'Mixed Use',
];

const loanTypes = [
  'Bridge',
  'Construction',
  'Stabilized',
  'Mezzanine',
  'Preferred Equity',
];

const loanTerms = [
  { label: '0-12 months', value: '0-12' },
  { label: '12-24 months', value: '12-24' },
  { label: '24-36 months', value: '24-36' },
  { label: '36+ months', value: '36+' },
];

const loanPositions = ['1st Lien', '2nd Lien', 'Mezzanine'];

export function SearchFilters({ filters, onChange, type, resultsCount }: SearchFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>(['location', 'type', 'apy']);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof SearchFiltersType, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof SearchFiltersType] !== undefined
  ).length;

  const FilterSection = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
  }) => (
    <Collapsible
      open={openSections.includes(id)}
      onOpenChange={() => toggleSection(id)}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium">
        {title}
        {openSections.includes(id) ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );

  const renderPropertyFilters = () => (
    <>
      <FilterSection title="Location" id="location">
        <div className="grid grid-cols-2 gap-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`loc-${location}`}
                checked={filters.location?.includes(location)}
                onCheckedChange={() => toggleArrayFilter('location', location)}
              />
              <Label htmlFor={`loc-${location}`} className="text-sm cursor-pointer">
                {location}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Property Type" id="type">
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((pType) => (
            <div key={pType} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${pType}`}
                checked={filters.propertyType?.includes(pType)}
                onCheckedChange={() => toggleArrayFilter('propertyType', pType)}
              />
              <Label htmlFor={`type-${pType}`} className="text-sm cursor-pointer">
                {pType}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="APY Range" id="apy">
        <div className="px-2">
          <Slider
            value={[filters.apyMin || 0, filters.apyMax || 20]}
            min={0}
            max={20}
            step={0.5}
            onValueChange={([min, max]) => {
              updateFilter('apyMin', min > 0 ? min : undefined);
              updateFilter('apyMax', max < 20 ? max : undefined);
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Min: {filters.apyMin || 0}%</span>
            <span>Max: {filters.apyMax || 20}%</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Token Price" id="price">
        <div className="px-2">
          <Slider
            value={[filters.priceMin || 0, filters.priceMax || 500]}
            min={0}
            max={500}
            step={10}
            onValueChange={([min, max]) => {
              updateFilter('priceMin', min > 0 ? min : undefined);
              updateFilter('priceMax', max < 500 ? max : undefined);
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Min: ${filters.priceMin || 0}</span>
            <span>Max: ${filters.priceMax || 500}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Occupancy Rate" id="occupancy">
        <div className="space-y-2">
          {[90, 80, 70, 0].map((rate) => (
            <div key={rate} className="flex items-center space-x-2">
              <Checkbox
                id={`occ-${rate}`}
                checked={filters.occupancyMin === rate}
                onCheckedChange={() =>
                  updateFilter('occupancyMin', filters.occupancyMin === rate ? undefined : rate)
                }
              />
              <Label htmlFor={`occ-${rate}`} className="text-sm cursor-pointer">
                {rate > 0 ? `${rate}%+` : 'Any'}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </>
  );

  const renderLoanFilters = () => (
    <>
      <FilterSection title="Loan Type" id="loanType">
        <div className="grid grid-cols-2 gap-2">
          {loanTypes.map((lType) => (
            <div key={lType} className="flex items-center space-x-2">
              <Checkbox
                id={`ltype-${lType}`}
                checked={filters.loanType?.includes(lType)}
                onCheckedChange={() => toggleArrayFilter('loanType', lType)}
              />
              <Label htmlFor={`ltype-${lType}`} className="text-sm cursor-pointer">
                {lType}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="APY Range" id="apy">
        <div className="px-2">
          <Slider
            value={[filters.apyMin || 0, filters.apyMax || 20]}
            min={0}
            max={20}
            step={0.5}
            onValueChange={([min, max]) => {
              updateFilter('apyMin', min > 0 ? min : undefined);
              updateFilter('apyMax', max < 20 ? max : undefined);
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Min: {filters.apyMin || 0}%</span>
            <span>Max: {filters.apyMax || 20}%</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Loan Term" id="loanTerm">
        <div className="space-y-2">
          {loanTerms.map((term) => (
            <div key={term.value} className="flex items-center space-x-2">
              <Checkbox
                id={`term-${term.value}`}
                checked={filters.loanTerm?.includes(term.value)}
                onCheckedChange={() => toggleArrayFilter('loanTerm', term.value)}
              />
              <Label htmlFor={`term-${term.value}`} className="text-sm cursor-pointer">
                {term.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="LTV Ratio" id="ltv">
        <div className="space-y-2">
          {[65, 75, 80, 100].map((ltv) => (
            <div key={ltv} className="flex items-center space-x-2">
              <Checkbox
                id={`ltv-${ltv}`}
                checked={filters.ltvMax === ltv}
                onCheckedChange={() =>
                  updateFilter('ltvMax', filters.ltvMax === ltv ? undefined : ltv)
                }
              />
              <Label htmlFor={`ltv-${ltv}`} className="text-sm cursor-pointer">
                {ltv < 100 ? `Under ${ltv}%` : 'Any'}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Loan Position" id="position">
        <div className="space-y-2">
          {loanPositions.map((position) => (
            <div key={position} className="flex items-center space-x-2">
              <Checkbox
                id={`pos-${position}`}
                checked={filters.loanPosition?.includes(position)}
                onCheckedChange={() => toggleArrayFilter('loanPosition', position)}
              />
              <Label htmlFor={`pos-${position}`} className="text-sm cursor-pointer">
                {position}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </>
  );

  const renderPredictionFilters = () => (
    <>
      <FilterSection title="Location" id="location">
        <div className="grid grid-cols-2 gap-2">
          {locations.slice(0, 6).map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`loc-${location}`}
                checked={filters.location?.includes(location)}
                onCheckedChange={() => toggleArrayFilter('location', location)}
              />
              <Label htmlFor={`loc-${location}`} className="text-sm cursor-pointer">
                {location.split(',')[0]}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Time to Resolution" id="closing">
        <div className="space-y-2">
          {[
            { label: 'Closing in 24 hours', value: '24h' },
            { label: 'Closing this week', value: 'week' },
            { label: 'Closing this month', value: 'month' },
            { label: 'All open markets', value: 'all' },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`close-${option.value}`}
                checked={filters.closingTime === option.value}
                onCheckedChange={() =>
                  updateFilter(
                    'closingTime',
                    filters.closingTime === option.value ? undefined : option.value
                  )
                }
              />
              <Label htmlFor={`close-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Volume" id="volume">
        <div className="space-y-2">
          {[
            { label: 'High (>$10K)', value: 'high' },
            { label: 'Medium ($1K-$10K)', value: 'medium' },
            { label: 'Low (<$1K)', value: 'low' },
            { label: 'Any', value: 'any' },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`vol-${option.value}`}
                checked={filters.volume === option.value}
                onCheckedChange={() =>
                  updateFilter(
                    'volume',
                    filters.volume === option.value ? undefined : option.value
                  )
                }
              />
              <Label htmlFor={`vol-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </>
  );

  const FiltersContent = () => (
    <div className="space-y-2 divide-y divide-border">
      {type === 'properties' && renderPropertyFilters()}
      {type === 'loans' && renderLoanFilters()}
      {type === 'predictions' && renderPredictionFilters()}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-6">
          <FiltersContent />
        </div>
        <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-4">
          <Button className="w-full">
            Show {resultsCount !== undefined ? resultsCount : ''} Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ActiveFilterPills({
  filters,
  onChange,
}: {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
}) {
  const removeFilter = (key: keyof SearchFiltersType, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const updated = (filters[key] as string[]).filter((v) => v !== value);
      onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
    } else {
      const { [key]: _, ...rest } = filters;
      onChange(rest);
    }
  };

  const pills: { label: string; key: keyof SearchFiltersType; value?: string }[] = [];

  if (filters.location) {
    filters.location.forEach((loc) => pills.push({ label: loc, key: 'location', value: loc }));
  }
  if (filters.propertyType) {
    filters.propertyType.forEach((t) => pills.push({ label: t, key: 'propertyType', value: t }));
  }
  if (filters.loanType) {
    filters.loanType.forEach((t) => pills.push({ label: t, key: 'loanType', value: t }));
  }
  if (filters.apyMin !== undefined || filters.apyMax !== undefined) {
    pills.push({
      label: `APY: ${filters.apyMin || 0}%-${filters.apyMax || 20}%`,
      key: 'apyMin',
    });
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    pills.push({
      label: `Price: $${filters.priceMin || 0}-$${filters.priceMax || 500}`,
      key: 'priceMin',
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map((pill, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1">
          {pill.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter(pill.key, pill.value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs"
        onClick={() => onChange({})}
      >
        Clear All
      </Button>
    </div>
  );
}
