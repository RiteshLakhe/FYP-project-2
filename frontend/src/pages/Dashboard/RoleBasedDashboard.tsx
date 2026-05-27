import AdminDashboard from "@/pages/Admin/AdminDashboard";
import TenantDashboard from "@/pages/Dashboard/TenantDashboard";
import { useUser } from "@/context/UserContext";

const RoleBasedDashboard = () => {
  const { user } = useUser();

  if (user?.currentRole === "admin") {
    return <AdminDashboard />;
  }

  return <TenantDashboard />;
};

export default RoleBasedDashboard;
