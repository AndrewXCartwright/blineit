import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption, FilterOption } from "@/hooks/useCommunityComments";

interface CommentSortFilterProps {
  sort: SortOption;
  filter: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
}

export function CommentSortFilter({
  sort,
  filter,
  onSortChange,
  onFilterChange,
}: CommentSortFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={sort} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
          <SelectItem value="most_discussed">Most Discussed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filter} onValueChange={(value) => onFilterChange(value as FilterOption)}>
        <SelectTrigger className="w-[160px] bg-secondary/50 border-border">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Comments</SelectItem>
          <SelectItem value="verified">Verified Investors</SelectItem>
          <SelectItem value="official">Official Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
