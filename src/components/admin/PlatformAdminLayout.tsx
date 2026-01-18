import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useIsPlatformAdmin } from "@/hooks/usePlatformAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PlatformAdminLayoutProps {
  children: ReactNode;
}

export function PlatformAdminLayout({ children }: PlatformAdminLayoutProps) {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isPlatformAdmin, loading: platformLoading } = useIsPlatformAdmin();

  const loading = adminLoading || platformLoading;

  useEffect(() => {
    if (!loading && (!isAdmin || !isPlatformAdmin)) {
      toast.error("You don't have platform admin access");
      navigate("/admin");
    }
  }, [isAdmin, isPlatformAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin || !isPlatformAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
