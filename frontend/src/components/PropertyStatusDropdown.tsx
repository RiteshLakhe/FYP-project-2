import { API_ENDPOINTS } from "@/services/Endpoints";
import { Axios } from "@/services/AxiosInstance";
import { toast } from "react-toastify";
import { PROPERTY_STATUSES, statusClassName } from "@/lib/propertyStatus";

export default function PropertyStatusDropdown({
  propertyId,
  currentStatus,
  onStatusUpdate,
}: {
  propertyId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      await Axios.patch(API_ENDPOINTS.PROPERTY.UPDATE_STATUS(propertyId), {
        status: newStatus,
      });
      toast.success("Status updated");
      onStatusUpdate(newStatus);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`status-badge ${statusClassName(currentStatus)}`}>
        {currentStatus || "For Rent"}
      </span>
      <select
        value={currentStatus}
        onChange={handleChange}
        className="border border-slate-300 rounded-md px-2 py-1 text-xs font-medium text-slate-700 bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        {PROPERTY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
