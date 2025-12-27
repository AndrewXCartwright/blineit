import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  type: 'properties' | 'loans' | 'predictions';
  value: string;
  onChange: (value: string) => void;
}

const propertySortOptions: SortOption[] = [
  { value: 'apy_desc', label: 'Highest APY' },
  { value: 'apy_asc', label: 'Lowest APY' },
  { value: 'price_asc', label: 'Lowest Token Price' },
  { value: 'price_desc', label: 'Highest Token Price' },
  { value: 'created_desc', label: 'Newest Listed' },
  { value: 'holders_desc', label: 'Most Popular' },
  { value: 'occupancy_desc', label: 'Highest Occupancy' },
  { value: 'name_asc', label: 'Alphabetical (A-Z)' },
];

const loanSortOptions: SortOption[] = [
  { value: 'apy_desc', label: 'Highest APY' },
  { value: 'apy_asc', label: 'Lowest APY' },
  { value: 'ltv_asc', label: 'Lowest LTV' },
  { value: 'term_asc', label: 'Shortest Term' },
  { value: 'funded_desc', label: 'Most Funded' },
  { value: 'created_desc', label: 'Newest' },
];

const predictionSortOptions: SortOption[] = [
  { value: 'expires_asc', label: 'Closing Soon' },
  { value: 'volume_desc', label: 'Highest Volume' },
  { value: 'created_desc', label: 'Newest' },
  { value: 'contested', label: 'Closest Odds' },
  { value: 'yes_price_desc', label: 'YES Favored' },
  { value: 'no_price_desc', label: 'NO Favored' },
];

export function SortSelect({ type, value, onChange }: SortSelectProps) {
  const options = type === 'properties' 
    ? propertySortOptions 
    : type === 'loans' 
    ? loanSortOptions 
    : predictionSortOptions;

  return (
    <Select value={value || options[0].value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
