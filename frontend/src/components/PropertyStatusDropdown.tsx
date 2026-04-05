import { API_ENDPOINTS } from "@/services/Endpoints";
import { Axios } from "@/services/AxiosInstance";
import { toast } from "react-toastify";

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
    <select
      value={currentStatus}
      onChange={handleChange}
      className="border rounded px-2 py-1 text-sm"
    >
      {["Active", "Inactive", "Pending", "Rented"].map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
