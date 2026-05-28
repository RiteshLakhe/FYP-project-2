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
import StatusBadge from "@/components/StatusBadge";
import PropertyImageManager from "@/components/PropertyImageManager";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/propertyStatus";
import { FiUsers, FiHome, FiRefreshCcw, FiSearch, FiSave, FiTrash2 } from "react-icons/fi";
import LocationMapPicker from "@/components/LocationMapPicker";
import TagInput from "@/components/TagInput";

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
  status?: PropertyStatus;
  imgUrls?: string[];
  userId: string | PropertyOwner;
  totalArea?: number;
  dimension?: number;
  floor?: string;
  roadType?: string;
  propertyFace?: string;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  halls?: number;
  furnishing?: string;
  balcony?: number;
  parkingSpace?: string;
  negotiable?: string;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    mapLabel: string;
    landmark?: string;
  };
}

interface PropertyEditForm {
  title: string;
  description: string;
  address: string;
  city: string;
  municipality: string;
  wardNo: string;
  category: string;
  propertyType: string;
  price: string;
  priceInWords: string;
  status: PropertyStatus;
  totalArea: string;
  dimension: string;
  floor: string;
  roadType: string;
  propertyFace: string;
  bedrooms: string;
  bathrooms: string;
  kitchens: string;
  halls: string;
  furnishing: string;
  balcony: string;
  parkingSpace: string;
  negotiable: string;
  tags: string[];
  latitude: number;
  longitude: number;
  mapLabel: string;
  landmark: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-600";

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

  const [userQuery, setUserQuery] = useState("");
  const [propertyQuery, setPropertyQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [userForm, setUserForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    roles: "",
    currentRole: "tenant",
  });
  const [propertyForm, setPropertyForm] = useState<PropertyEditForm>({
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
    status: "For Rent",
    totalArea: "",
    dimension: "",
    floor: "",
    roadType: "Paved",
    propertyFace: "East",
    bedrooms: "",
    bathrooms: "",
    kitchens: "",
    halls: "",
    furnishing: "",
    balcony: "",
    parkingSpace: "",
    negotiable: "No",
    tags: [],
    latitude: 27.7172,
    longitude: 85.324,
    mapLabel: "",
    landmark: "",
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
      status: (property.status as PropertyStatus) || "For Rent",
      totalArea: String(property.totalArea ?? ""),
      dimension: String(property.dimension ?? ""),
      floor: property.floor || "",
      roadType: property.roadType || "Paved",
      propertyFace: property.propertyFace || "East",
      bedrooms: String(property.bedrooms ?? ""),
      bathrooms: String(property.bathrooms ?? ""),
      kitchens: String(property.kitchens ?? ""),
      halls: String(property.halls ?? ""),
      furnishing: property.furnishing || "",
      balcony: String(property.balcony ?? ""),
      parkingSpace: property.parkingSpace || "",
      negotiable: property.negotiable || "No",
      tags: property.tags || [],
      latitude: property.location?.latitude || 27.7172,
      longitude: property.location?.longitude || 85.324,
      mapLabel: property.location?.mapLabel || "",
      landmark: property.location?.landmark || "",
    });
  };

  const updatePropertyImages = (imgUrls: string[]) => {
    if (!selectedProperty) return;
    const updated = { ...selectedProperty, imgUrls };
    setSelectedProperty(updated);
    setProperties((prev) =>
      prev.map((p) => (p._id === selectedProperty._id ? updated : p))
    );
    // Pull fresh data so all actors see the new image set
    loadAdminData();
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
      loadAdminData();
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
      const payload = {
        ...propertyForm,
        price: Number(propertyForm.price),
        totalArea: propertyForm.totalArea ? Number(propertyForm.totalArea) : undefined,
        dimension: propertyForm.dimension ? Number(propertyForm.dimension) : undefined,
        bedrooms: propertyForm.bedrooms ? Number(propertyForm.bedrooms) : undefined,
        bathrooms: propertyForm.bathrooms ? Number(propertyForm.bathrooms) : undefined,
        kitchens: propertyForm.kitchens ? Number(propertyForm.kitchens) : undefined,
        halls: propertyForm.halls ? Number(propertyForm.halls) : undefined,
        balcony: propertyForm.balcony ? Number(propertyForm.balcony) : undefined,
      };
      const response = await Axios.put(
        API_ENDPOINTS.PROPERTY.UPDATE(selectedProperty._id),
        payload
      );

      setProperties((prev) =>
        prev.map((item) =>
          item._id === selectedProperty._id ? response.data.property : item
        )
      );
      setSelectedProperty(null);
      toast.success("Property updated.");
      // Re-fetch authoritative list so changes are visible to every actor on next load
      loadAdminData();
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
    if (!property.userId) return "Deleted owner";
    if (typeof property.userId === "object") return property.userId.fullname || "Deleted owner";
    return "Unknown";
  };

  const filteredUsers = users.filter((u) =>
    u.fullname.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase())
  );
  const filteredProperties = properties.filter((p) => {
    const q = propertyQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      ownerName(p).toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || (p.status || "For Rent") === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (!user || user.currentRole !== "admin") return null;

  return (
    <div className="page-reveal mx-auto max-w-[1440px] px-4 lg:px-8 py-10 space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 md:p-10 text-white">
        <p className="eyebrow text-blue-200">Admin console</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
          Manage users, listings, and statuses.
        </h1>
        <p className="text-blue-100/80 mt-2 max-w-2xl">
          Edit any property field including images, prices, location and status.
          Remove accounts or listings as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total users" value={users.length} icon={<FiUsers />} tone="blue" />
        <StatCard label="Total properties" value={properties.length} icon={<FiHome />} tone="emerald" />
        <StatCard
          label="Refresh data"
          icon={<FiRefreshCcw />}
          tone="amber"
          action={
            <button onClick={loadAdminData} className="btn-primary !py-2 !px-4 mt-2">
              Refresh now
            </button>
          }
        />
      </div>

      {/* Users */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Search users..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading users...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 rounded-lg">
                <tr>
                  {["Name", "Email", "Roles", "Current role", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{u.fullname}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{u.roles.join(", ")}</td>
                    <td className="px-4 py-3"><span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold uppercase">{u.currentRole}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => openUser(u)}>Edit</button>
                        <button className="btn-danger !py-1.5 !px-3 !text-xs" onClick={() => deleteUser(u)}>
                          <FiTrash2 size={12} /> Delete
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

      {/* Properties */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Properties</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="All">All statuses</option>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="Search by title, address, owner..."
                value={propertyQuery}
                onChange={(e) => setPropertyQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading properties...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Property", "Owner", "Address", "Status", "Price", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        {property.imgUrls?.[0] && (
                          <img
                            src={property.imgUrls[0]}
                            alt=""
                            className="h-12 w-16 rounded-md object-cover"
                          />
                        )}
                        <span className="font-semibold text-slate-800 line-clamp-1">{property.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ownerName(property)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 line-clamp-1 max-w-[260px]">{property.address}</td>
                    <td className="px-4 py-3"><StatusBadge status={property.status || "For Rent"} /></td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">Rs. {property.price?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => navigate(`/property/${property._id}`)}>View</button>
                        <button className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => openProperty(property)}>Edit</button>
                        <button className="btn-danger !py-1.5 !px-3 !text-xs" onClick={() => deleteProperty(property)}>
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No properties match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* User edit dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Roles should be comma-separated.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className={inputClass} value={userForm.fullname} onChange={(e) => setUserForm((p) => ({ ...p, fullname: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className={inputClass} type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <input className={inputClass} value={userForm.phoneNumber} onChange={(e) => setUserForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
            </Field>
            <Field label="Current role">
              <select className={inputClass} value={userForm.currentRole} onChange={(e) => setUserForm((p) => ({ ...p, currentRole: e.target.value }))}>
                <option value="tenant">tenant</option>
                <option value="landlord">landlord</option>
              </select>
            </Field>
            <Field label="Roles (comma separated)" className="sm:col-span-2">
              <input className={inputClass} value={userForm.roles} onChange={(e) => setUserForm((p) => ({ ...p, roles: e.target.value }))} />
            </Field>
          </div>
          <DialogFooter>
            <button className="btn-secondary" onClick={() => setSelectedUser(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={saveUser}>
              <FiSave /> {saving ? "Saving..." : "Save user"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property edit dialog */}
      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Edit property
              <StatusBadge status={propertyForm.status} />
            </DialogTitle>
            <DialogDescription>Update every field including images, price, and status.</DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-8">
              {/* Image management */}
              <section className="rounded-xl border border-slate-200 p-5">
                <PropertyImageManager
                  propertyId={selectedProperty._id}
                  images={selectedProperty.imgUrls || []}
                  onChange={updatePropertyImages}
                />
              </section>

              {/* Status & pricing */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Status & Pricing</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Status">
                    <select className={inputClass} value={propertyForm.status} onChange={(e) => setPropertyForm((p) => ({ ...p, status: e.target.value as PropertyStatus }))}>
                      {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Price">
                    <input className={inputClass} type="number" value={propertyForm.price} onChange={(e) => setPropertyForm((p) => ({ ...p, price: e.target.value }))} />
                  </Field>
                  <Field label="Price in words">
                    <input className={inputClass} value={propertyForm.priceInWords} onChange={(e) => setPropertyForm((p) => ({ ...p, priceInWords: e.target.value }))} />
                  </Field>
                  <Field label="Negotiable">
                    <select className={inputClass} value={propertyForm.negotiable} onChange={(e) => setPropertyForm((p) => ({ ...p, negotiable: e.target.value }))}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Basics */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Basics</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title" className="sm:col-span-2">
                    <input className={inputClass} value={propertyForm.title} onChange={(e) => setPropertyForm((p) => ({ ...p, title: e.target.value }))} />
                  </Field>
                  <Field label="Description" className="sm:col-span-2">
                    <textarea className={`${inputClass} min-h-24`} value={propertyForm.description} onChange={(e) => setPropertyForm((p) => ({ ...p, description: e.target.value }))} />
                  </Field>
                  <Field label="Category">
                    <select className={inputClass} value={propertyForm.category} onChange={(e) => setPropertyForm((p) => ({ ...p, category: e.target.value }))}>
                      <option value="Room">Room</option>
                      <option value="Appartment">Appartment</option>
                      <option value="Commercial Space">Commercial Space</option>
                    </select>
                  </Field>
                  <Field label="Property type">
                    <select className={inputClass} value={propertyForm.propertyType} onChange={(e) => setPropertyForm((p) => ({ ...p, propertyType: e.target.value }))}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Location */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Location</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Address" className="sm:col-span-2">
                    <input className={inputClass} value={propertyForm.address} onChange={(e) => setPropertyForm((p) => ({ ...p, address: e.target.value }))} />
                  </Field>
                  <Field label="City"><input className={inputClass} value={propertyForm.city} onChange={(e) => setPropertyForm((p) => ({ ...p, city: e.target.value }))} /></Field>
                  <Field label="Municipality"><input className={inputClass} value={propertyForm.municipality} onChange={(e) => setPropertyForm((p) => ({ ...p, municipality: e.target.value }))} /></Field>
                  <Field label="Ward no."><input className={inputClass} value={propertyForm.wardNo} onChange={(e) => setPropertyForm((p) => ({ ...p, wardNo: e.target.value }))} /></Field>
                  <Field label="Road type">
                    <select className={inputClass} value={propertyForm.roadType} onChange={(e) => setPropertyForm((p) => ({ ...p, roadType: e.target.value }))}>
                      <option value="Paved">Paved</option>
                      <option value="Gravelled">Gravelled</option>
                      <option value="Alley">Alley</option>
                    </select>
                  </Field>
                  <Field label="Property face">
                    <select className={inputClass} value={propertyForm.propertyFace} onChange={(e) => setPropertyForm((p) => ({ ...p, propertyFace: e.target.value }))}>
                      {["East","West","North","South","South-East","South-West","North-East","North-West"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
              </section>

              {/* Specs */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Specifications</h3>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  <Field label="Total area"><input type="number" className={inputClass} value={propertyForm.totalArea} onChange={(e) => setPropertyForm((p) => ({ ...p, totalArea: e.target.value }))} /></Field>
                  <Field label="Dimension"><input type="number" className={inputClass} value={propertyForm.dimension} onChange={(e) => setPropertyForm((p) => ({ ...p, dimension: e.target.value }))} /></Field>
                  <Field label="Floor"><input className={inputClass} value={propertyForm.floor} onChange={(e) => setPropertyForm((p) => ({ ...p, floor: e.target.value }))} /></Field>
                  <Field label="Furnishing">
                    <select className={inputClass} value={propertyForm.furnishing} onChange={(e) => setPropertyForm((p) => ({ ...p, furnishing: e.target.value }))}>
                      <option value="">—</option>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </Field>
                  <Field label="Bedrooms"><input type="number" className={inputClass} value={propertyForm.bedrooms} onChange={(e) => setPropertyForm((p) => ({ ...p, bedrooms: e.target.value }))} /></Field>
                  <Field label="Bathrooms"><input type="number" className={inputClass} value={propertyForm.bathrooms} onChange={(e) => setPropertyForm((p) => ({ ...p, bathrooms: e.target.value }))} /></Field>
                  <Field label="Kitchens"><input type="number" className={inputClass} value={propertyForm.kitchens} onChange={(e) => setPropertyForm((p) => ({ ...p, kitchens: e.target.value }))} /></Field>
                  <Field label="Halls"><input type="number" className={inputClass} value={propertyForm.halls} onChange={(e) => setPropertyForm((p) => ({ ...p, halls: e.target.value }))} /></Field>
                  <Field label="Balcony"><input type="number" className={inputClass} value={propertyForm.balcony} onChange={(e) => setPropertyForm((p) => ({ ...p, balcony: e.target.value }))} /></Field>
                  <Field label="Parking"><input className={inputClass} value={propertyForm.parkingSpace} onChange={(e) => setPropertyForm((p) => ({ ...p, parkingSpace: e.target.value }))} /></Field>
                </div>
              </section>

              {/* Map + landmark */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Map location & landmark</h3>
                <LocationMapPicker
                  value={{ lat: propertyForm.latitude, lng: propertyForm.longitude }}
                  onChange={({ lat, lng }) =>
                    setPropertyForm((p) => ({ ...p, latitude: lat, longitude: lng }))
                  }
                  landmark={propertyForm.landmark}
                  onLandmarkChange={(landmark) =>
                    setPropertyForm((p) => ({ ...p, landmark }))
                  }
                />
                <Field label="Map label (area)">
                  <input
                    className={inputClass}
                    value={propertyForm.mapLabel}
                    onChange={(e) => setPropertyForm((p) => ({ ...p, mapLabel: e.target.value }))}
                  />
                </Field>
              </section>

              {/* Tags */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Tags</h3>
                <TagInput
                  value={propertyForm.tags}
                  onChange={(tags) => setPropertyForm((p) => ({ ...p, tags }))}
                />
              </section>
            </div>
          )}

          <DialogFooter>
            <button className="btn-secondary" onClick={() => setSelectedProperty(null)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={saveProperty}>
              <FiSave /> {saving ? "Saving..." : "Save property"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className={labelClass}>{label}</span>
    {children}
  </label>
);

const StatCard = ({
  label,
  value,
  icon,
  tone,
  action,
}: {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
  tone: "blue" | "emerald" | "amber";
  action?: React.ReactNode;
}) => {
  const accent =
    tone === "blue"
      ? "bg-blue-50 text-blue-600"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-amber-50 text-amber-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500">{label}</p>
          {value !== undefined && <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>}
          {action}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${accent} text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
