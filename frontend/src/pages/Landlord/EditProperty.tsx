import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { toast } from "react-toastify";
import PropertyImageManager from "@/components/PropertyImageManager";
import StatusBadge from "@/components/StatusBadge";
import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/propertyStatus";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import LocationMapPicker from "@/components/LocationMapPicker";
import TagInput from "@/components/TagInput";

interface PropertyState {
  _id: string;
  title: string;
  description: string;
  category: string;
  propertyType: string;
  address: string;
  city: string;
  municipality: string;
  wardNo: string;
  totalArea: number | string;
  floor: string;
  dimension: number | string;
  roadType: string;
  propertyFace: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  kitchens?: number | string;
  halls?: number | string;
  furnishing?: string;
  balcony?: number | string;
  attachedBathroom?: string;
  parkingSpace?: string;
  imgUrls: string[];
  price: number | string;
  priceInWords: string;
  negotiable: string;
  status: PropertyStatus;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    mapLabel: string;
    landmark?: string;
    googleMapsUrl?: string;
  };
}

const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-600";
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20";

const EditProperty = () => {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_BY_ID(propertyId!));
        setProperty(response.data.property);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        toast.error("Failed to load property");
        navigate("/landlord/landlord-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, navigate]);

  const updateField = <K extends keyof PropertyState>(key: K, value: PropertyState[K]) => {
    setProperty((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setSaving(true);
      // Only send editable fields. The server protects against id/userId/createdAt/etc.
      const payload = {
        title: property.title,
        description: property.description,
        category: property.category,
        propertyType: property.propertyType,
        address: property.address,
        city: property.city,
        municipality: property.municipality,
        wardNo: property.wardNo,
        totalArea: Number(property.totalArea),
        dimension: Number(property.dimension),
        floor: property.floor,
        roadType: property.roadType,
        propertyFace: property.propertyFace,
        bedrooms: property.bedrooms ? Number(property.bedrooms) : undefined,
        bathrooms: property.bathrooms ? Number(property.bathrooms) : undefined,
        kitchens: property.kitchens ? Number(property.kitchens) : undefined,
        halls: property.halls ? Number(property.halls) : undefined,
        balcony: property.balcony ? Number(property.balcony) : undefined,
        furnishing: property.furnishing,
        attachedBathroom: property.attachedBathroom,
        parkingSpace: property.parkingSpace,
        price: Number(property.price),
        priceInWords: property.priceInWords,
        negotiable: property.negotiable,
        status: property.status,
        tags: property.tags || [],
        latitude: property.location?.latitude,
        longitude: property.location?.longitude,
        mapLabel: property.location?.mapLabel,
        landmark: property.location?.landmark || "",
      };
      await Axios.put(API_ENDPOINTS.PROPERTY.UPDATE(propertyId!), payload);
      toast.success("Property updated");
      navigate("/landlord/landlord-dashboard");
    } catch (error) {
      console.error("Failed to update property:", error);
      toast.error("Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-16">
        <p className="text-slate-500">Loading property...</p>
      </div>
    );
  }

  return (
    <div className="page-reveal mx-auto max-w-[1200px] px-4 lg:px-8 py-10">
      <button
        onClick={() => navigate("/landlord/landlord-dashboard")}
        className="btn-ghost mb-6">
        <FiArrowLeft /> Back to dashboard
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Edit property</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {property.title}
          </h1>
          <p className="text-slate-600 mt-1">{property.address}</p>
        </div>
        <StatusBadge status={property.status} />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Image Manager - the headline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <PropertyImageManager
            propertyId={property._id}
            images={property.imgUrls}
            onChange={(imgUrls) => updateField("imgUrls", imgUrls)}
          />
        </section>

        {/* Status + key fields */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Listing Status & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Status">
              <select
                className={inputClass}
                value={property.status}
                onChange={(e) => updateField("status", e.target.value as PropertyStatus)}>
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (Rs.)">
              <input
                type="number"
                className={inputClass}
                value={property.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </Field>
            <Field label="Price in words">
              <input
                className={inputClass}
                value={property.priceInWords}
                onChange={(e) => updateField("priceInWords", e.target.value)}
              />
            </Field>
            <Field label="Negotiable">
              <select
                className={inputClass}
                value={property.negotiable}
                onChange={(e) => updateField("negotiable", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Basics */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Basic details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" className="md:col-span-2">
              <input
                className={inputClass}
                value={property.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                className={`${inputClass} min-h-28`}
                value={property.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </Field>
            <Field label="Category">
              <select
                className={inputClass}
                value={property.category}
                onChange={(e) => updateField("category", e.target.value)}>
                <option value="Room">Room</option>
                <option value="Appartment">Apartment</option>
                <option value="Commercial Space">Commercial Space</option>
              </select>
            </Field>
            <Field label="Property type">
              <select
                className={inputClass}
                value={property.propertyType}
                onChange={(e) => updateField("propertyType", e.target.value)}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address" className="md:col-span-2">
              <input
                className={inputClass}
                value={property.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={property.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </Field>
            <Field label="Municipality">
              <input
                className={inputClass}
                value={property.municipality}
                onChange={(e) => updateField("municipality", e.target.value)}
              />
            </Field>
            <Field label="Ward No.">
              <input
                className={inputClass}
                value={property.wardNo}
                onChange={(e) => updateField("wardNo", e.target.value)}
              />
            </Field>
            <Field label="Road type">
              <select
                className={inputClass}
                value={property.roadType}
                onChange={(e) => updateField("roadType", e.target.value)}>
                <option value="Paved">Paved</option>
                <option value="Gravelled">Gravelled</option>
                <option value="Alley">Alley</option>
              </select>
            </Field>
            <Field label="Property face">
              <select
                className={inputClass}
                value={property.propertyFace}
                onChange={(e) => updateField("propertyFace", e.target.value)}>
                {["East","West","North","South","South-East","South-West","North-East","North-West"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* Map + landmark */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-neutral-900">Location on the map</h2>
          <p className="text-sm text-neutral-500 -mt-2">
            Click the map to drop a pin or drag the marker, like in Uber.
          </p>
          <LocationMapPicker
            value={
              property.location
                ? { lat: property.location.latitude, lng: property.location.longitude }
                : null
            }
            onChange={({ lat, lng }) =>
              setProperty((prev) =>
                prev
                  ? {
                      ...prev,
                      location: {
                        ...(prev.location || { mapLabel: prev.address, landmark: "" }),
                        latitude: lat,
                        longitude: lng,
                      } as PropertyState["location"],
                    }
                  : prev
              )
            }
            landmark={property.location?.landmark || ""}
            onLandmarkChange={(landmark) =>
              setProperty((prev) =>
                prev
                  ? {
                      ...prev,
                      location: {
                        ...(prev.location || {
                          latitude: 27.7172,
                          longitude: 85.324,
                          mapLabel: prev.address,
                        }),
                        landmark,
                      } as PropertyState["location"],
                    }
                  : prev
              )
            }
          />
          <Field label="Map label (area name)">
            <input
              className={inputClass}
              value={property.location?.mapLabel || ""}
              onChange={(e) =>
                setProperty((prev) =>
                  prev
                    ? {
                        ...prev,
                        location: {
                          ...(prev.location || {
                            latitude: 27.7172,
                            longitude: 85.324,
                            landmark: "",
                          }),
                          mapLabel: e.target.value,
                        } as PropertyState["location"],
                      }
                    : prev
                )
              }
            />
          </Field>
        </section>

        {/* Tags */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Tags</h2>
            <p className="text-sm text-neutral-500">
              Tags make your listing discoverable. Add up to 12.
            </p>
          </div>
          <TagInput
            value={property.tags || []}
            onChange={(next) => updateField("tags", next)}
          />
        </section>

        {/* Specs */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Total area"><input type="number" className={inputClass} value={property.totalArea} onChange={(e) => updateField("totalArea", e.target.value)} /></Field>
            <Field label="Dimension (sqft)"><input type="number" className={inputClass} value={property.dimension} onChange={(e) => updateField("dimension", e.target.value)} /></Field>
            <Field label="Floor"><input className={inputClass} value={property.floor} onChange={(e) => updateField("floor", e.target.value)} /></Field>
            <Field label="Furnishing">
              <select className={inputClass} value={property.furnishing || ""} onChange={(e) => updateField("furnishing", e.target.value)}>
                <option value="">—</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </Field>
            <Field label="Bedrooms"><input type="number" className={inputClass} value={property.bedrooms ?? ""} onChange={(e) => updateField("bedrooms", e.target.value)} /></Field>
            <Field label="Bathrooms"><input type="number" className={inputClass} value={property.bathrooms ?? ""} onChange={(e) => updateField("bathrooms", e.target.value)} /></Field>
            <Field label="Kitchens"><input type="number" className={inputClass} value={property.kitchens ?? ""} onChange={(e) => updateField("kitchens", e.target.value)} /></Field>
            <Field label="Halls"><input type="number" className={inputClass} value={property.halls ?? ""} onChange={(e) => updateField("halls", e.target.value)} /></Field>
            <Field label="Balcony"><input type="number" className={inputClass} value={property.balcony ?? ""} onChange={(e) => updateField("balcony", e.target.value)} /></Field>
            <Field label="Parking space"><input className={inputClass} value={property.parkingSpace || ""} onChange={(e) => updateField("parkingSpace", e.target.value)} /></Field>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/landlord/landlord-dashboard")}
            className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <FiSave /> {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
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

export default EditProperty;
