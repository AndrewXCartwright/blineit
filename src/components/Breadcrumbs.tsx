import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Auto-generate breadcrumbs from path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Convert slug to readable label
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto ${className}`}
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors shrink-0"
        aria-label={t("common.home", "Home")}
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {item.href ? (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;