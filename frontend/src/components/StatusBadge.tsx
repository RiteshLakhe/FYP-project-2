import { PROPERTY_STATUSES, statusClassName, type PropertyStatus } from "@/lib/propertyStatus";

interface StatusBadgeProps {
  status?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const StatusBadge = ({ status, size = "md", className = "" }: StatusBadgeProps) => {
  const normalized = (PROPERTY_STATUSES as readonly string[]).includes(status || "")
    ? (status as PropertyStatus)
    : "For Rent";

  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "";

  return (
    <span className={`status-badge ${statusClassName(normalized)} ${sizeClass} ${className}`}>
      {normalized}
    </span>
  );
};

export default StatusBadge;
