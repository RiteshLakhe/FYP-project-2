import { useCallback, useEffect, useState } from "react";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserSummary {
  _id: string;
  fullname: string;
  email: string;
  phoneNumber?: number;
  roles: string[];
  currentRole: string;
}

interface PropertyOwner {
  _id: string;
  fullname: string;
  email: string;
}

interface PropertySummary {
  _id: string;
  title: string;
  description?: string;
  address: string;
  city?: string;
  municipality?: string;
  wardNo?: string;
  category?: string;
  propertyType?: string;
  price: number;
  priceInWords?: string;
  status?: string;
  userId: string | PropertyOwner;
}

const fieldClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#38B593] focus:ring-2 focus:ring-[#38B593]/20";
const quietButton =
  "rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-500";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    roles: "",
    currentRole: "tenant",
  });
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    municipality: "",
    wardNo: "",
    category: "Room",
    propertyType: "Residential",
    price: "",
    priceInWords: "",
    status: "Active",
  });

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, propertiesRes] = await Promise.all([
        Axios.get(API_ENDPOINTS.USER.GET_ALL_USERS),
        Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL, {
          params: { includeInactive: "true" },
        }),
      ]);

      setUsers(usersRes.data.users || []);
      setProperties(propertiesRes.data.properties || []);
    } catch {
      setError("Unable to load admin data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/registration/signin");
      return;
    }

    if (user.currentRole !== "admin") {
      navigate("/");
      return;
    }

    loadAdminData();
  }, [loadAdminData, navigate, user]);

  const openUser = (userItem: UserSummary) => {
    setSelectedUser(userItem);
    setUserForm({
      fullname: userItem.fullname || "",
      email: userItem.email || "",
      phoneNumber: String(userItem.phoneNumber || ""),
      roles: userItem.roles.join(", "),
      currentRole: userItem.currentRole || userItem.roles[0] || "tenant",
    });
  };

  const openProperty = (property: PropertySummary) => {
    setSelectedProperty(property);
    setPropertyForm({
      title: property.title || "",
      description: property.description || "",
      address: property.address || "",
      city: property.city || "",
      municipality: property.municipality || "",
      wardNo: property.wardNo || "",
      category: property.category || "Room",
      propertyType: property.propertyType || "Residential",
      price: String(property.price || ""),
      priceInWords: property.priceInWords || "",
      status: property.status || "Active",
    });
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    const roles = userForm.roles
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);

    if (!roles.includes(userForm.currentRole)) {
      toast.error("Current role must be included in roles.");
      return;
    }

    try {
      setSaving(true);
      const response = await Axios.put(API_ENDPOINTS.USER.UPDATE_USER(selectedUser._id), {
        fullname: userForm.fullname,
        email: userForm.email,
        phoneNumber: Number(userForm.phoneNumber),
        roles,
        currentRole: userForm.currentRole,
      });

      setUsers((prev) =>
        prev.map((item) => (item._id === selectedUser._id ? response.data.user : item))
      );
      setSelectedUser(null);
      toast.success("User updated.");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userItem: UserSummary) => {
    if (userItem._id === user?.id) {
      toast.error("You cannot delete your own admin account while signed in.");
      return;
    }

    if (!window.confirm(`Delete ${userItem.fullname}?`)) return;

    try {
      await Axios.delete(API_ENDPOINTS.USER.DELETE_USER(userItem._id));
      setUsers((prev) => prev.filter((item) => item._id !== userItem._id));
      toast.success("User deleted.");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const saveProperty = async () => {
    if (!selectedProperty) return;

    try {
      setSaving(true);
      const response = await Axios.put(
        API_ENDPOINTS.PROPERTY.UPDATE(selectedProperty._id),
        {
          ...propertyForm,
          price: Number(propertyForm.price),
        }
      );

      setProperties((prev) =>
        prev.map((item) =>
          item._id === selectedProperty._id ? response.data.property : item
        )
      );
      setSelectedProperty(null);
      toast.success("Property updated.");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProperty = async (property: PropertySummary) => {
    if (!window.confirm(`Delete ${property.title}?`)) return;

    try {
      await Axios.delete(API_ENDPOINTS.PROPERTY.DELETE(property._id));
      setProperties((prev) => prev.filter((item) => item._id !== property._id));
      toast.success("Property deleted.");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to delete property.");
    }
  };

  const ownerName = (property: PropertySummary) => {
    if (!property.userId) {
      return "Deleted owner";
    }

    if (typeof property.userId === "object") {
      return property.userId.fullname || "Deleted owner";
    }

    return "Unknown";
  };

  if (!user || user.currentRole !== "admin") return null;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Review accounts and listings, then edit or remove records directly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total users</p>
            <p className="mt-2 text-3xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total properties</p>
            <p className="mt-2 text-3xl font-semibold">{properties.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Data</p>
            <button
              type="button"
              className="mt-3 rounded-md bg-[#38B593] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e9a7d]"
              onClick={loadAdminData}
            >
              Refresh
            </button>
          </div>
        </div>

        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Users</h2>
          {loading ? (
            <p className="mt-4">Loading users...</p>
          ) : error ? (
            <p className="mt-4 text-red-500">{error}</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Roles</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Current role</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((userItem) => (
                    <tr key={userItem._id}>
                      <td className="px-4 py-3 text-sm text-gray-700">{userItem.fullname}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{userItem.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{userItem.roles.join(", ")}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{userItem.currentRole}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className={quietButton} onClick={() => openUser(userItem)}>
                            View/Edit
                          </button>
                          <button
                            className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                            onClick={() => deleteUser(userItem)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Properties</h2>
          {loading ? (
            <p className="mt-4">Loading properties...</p>
          ) : error ? (
            <p className="mt-4 text-red-500">{error}</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-4 py-3 text-sm text-gray-700">{property.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{ownerName(property)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{property.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{property.status || "Active"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">NRS. {property.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className={quietButton} onClick={() => navigate(`/property/${property._id}`)}>
                            View
                          </button>
                          <button className={quietButton} onClick={() => openProperty(property)}>
                            Edit
                          </button>
                          <button
                            className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                            onClick={() => deleteProperty(property)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>View/Edit User</DialogTitle>
            <DialogDescription>Roles should be comma-separated.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Full name</span>
              <input className={fieldClass} value={userForm.fullname} onChange={(event) => setUserForm((prev) => ({ ...prev, fullname: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Email</span>
              <input className={fieldClass} type="email" value={userForm.email} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Phone</span>
              <input className={fieldClass} value={userForm.phoneNumber} onChange={(event) => setUserForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Current role</span>
              <select className={fieldClass} value={userForm.currentRole} onChange={(event) => setUserForm((prev) => ({ ...prev, currentRole: event.target.value }))}>
                <option value="tenant">tenant</option>
                <option value="landlord">landlord</option>
              </select>
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Roles</span>
              <input className={fieldClass} value={userForm.roles} onChange={(event) => setUserForm((prev) => ({ ...prev, roles: event.target.value }))} />
            </label>
          </div>
          <DialogFooter>
            <button className={quietButton} onClick={() => setSelectedUser(null)}>Cancel</button>
            <button className="rounded-md bg-[#38B593] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e9a7d] disabled:opacity-60" disabled={saving} onClick={saveUser}>
              {saving ? "Saving..." : "Save user"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View/Edit Property</DialogTitle>
            <DialogDescription>Update listing details, price, and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Title</span>
              <input className={fieldClass} value={propertyForm.title} onChange={(event) => setPropertyForm((prev) => ({ ...prev, title: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Description</span>
              <textarea className={`${fieldClass} min-h-24`} value={propertyForm.description} onChange={(event) => setPropertyForm((prev) => ({ ...prev, description: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Address</span>
              <input className={fieldClass} value={propertyForm.address} onChange={(event) => setPropertyForm((prev) => ({ ...prev, address: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>City</span>
              <input className={fieldClass} value={propertyForm.city} onChange={(event) => setPropertyForm((prev) => ({ ...prev, city: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Municipality</span>
              <input className={fieldClass} value={propertyForm.municipality} onChange={(event) => setPropertyForm((prev) => ({ ...prev, municipality: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Ward no.</span>
              <input className={fieldClass} value={propertyForm.wardNo} onChange={(event) => setPropertyForm((prev) => ({ ...prev, wardNo: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Status</span>
              <select className={fieldClass} value={propertyForm.status} onChange={(event) => setPropertyForm((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Rented">Rented</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>Category</span>
              <select className={fieldClass} value={propertyForm.category} onChange={(event) => setPropertyForm((prev) => ({ ...prev, category: event.target.value }))}>
                <option value="Room">Room</option>
                <option value="Appartment">Appartment</option>
                <option value="Commercial Space">Commercial Space</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>Property type</span>
              <select className={fieldClass} value={propertyForm.propertyType} onChange={(event) => setPropertyForm((prev) => ({ ...prev, propertyType: event.target.value }))}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>Price</span>
              <input className={fieldClass} type="number" value={propertyForm.price} onChange={(event) => setPropertyForm((prev) => ({ ...prev, price: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm">
              <span>Price in words</span>
              <input className={fieldClass} value={propertyForm.priceInWords} onChange={(event) => setPropertyForm((prev) => ({ ...prev, priceInWords: event.target.value }))} />
            </label>
          </div>
          <DialogFooter>
            <button className={quietButton} onClick={() => setSelectedProperty(null)}>Cancel</button>
            <button className="rounded-md bg-[#38B593] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e9a7d] disabled:opacity-60" disabled={saving} onClick={saveProperty}>
              {saving ? "Saving..." : "Save property"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
