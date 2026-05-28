export const PROPERTY_STATUSES = [
  "For Rent",
  "For Sale",
  "Sold",
  "Pending",
  "Off Market",
] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const statusClassName = (status?: string | null): string => {
  switch (status) {
    case "For Rent":
      return "status-for-rent";
    case "For Sale":
      return "status-for-sale";
    case "Sold":
      return "status-sold";
    case "Pending":
      return "status-pending";
    case "Off Market":
      return "status-off-market";
    default:
      return "status-for-rent";
  }
};
