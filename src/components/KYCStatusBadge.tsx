import { Shield, ShieldCheck, ShieldAlert, Clock, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { KYCStatus } from "@/hooks/useKYC";

interface KYCStatusBadgeProps {
  status: KYCStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const statusConfig: Record<KYCStatus, {
  icon: typeof Shield;
  label: string;
  className: string;
}> = {
  not_started: {
    icon: Shield,
    label: "Not Verified",
    className: "bg-muted text-muted-foreground",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-warning/20 text-warning",
  },
  in_review: {
    icon: Clock,
    label: "In Review",
    className: "bg-primary/20 text-primary",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    className: "bg-success/20 text-success",
  },
  rejected: {
    icon: ShieldX,
    label: "Rejected",
    className: "bg-destructive/20 text-destructive",
  },
};

const sizeConfig = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "w-3 h-3",
  },
  md: {
    container: "px-3 py-1 text-sm gap-1.5",
    icon: "w-4 h-4",
  },
  lg: {
    container: "px-4 py-2 text-base gap-2",
    icon: "w-5 h-5",
  },
};

export function KYCStatusBadge({ status, size = "md", showLabel = true }: KYCStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.className,
        sizeStyles.container
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
