import { useState } from "react";
import { cn } from "@/lib/utils";

export type LoanType = "all" | "bridge" | "construction" | "stabilized" | "mezzanine" | "preferred";

interface LoanTypeFilterProps {
  value: LoanType;
  onChange: (value: LoanType) => void;
}

const loanTypes: { value: LoanType; label: string }[] = [
  { value: "all", label: "All Loans" },
  { value: "bridge", label: "Bridge Loans" },
  { value: "construction", label: "Construction" },
  { value: "stabilized", label: "Stabilized" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "preferred", label: "Preferred Equity" },
];

export function LoanTypeFilter({ value, onChange }: LoanTypeFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {loanTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            value === type.value
              ? "bg-blue-500 text-white"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
