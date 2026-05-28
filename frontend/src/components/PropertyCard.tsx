import { FaBath, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoBed } from "react-icons/io5";
import { RxRulerSquare } from "react-icons/rx";
import PropertyDummyImage from "../assets/property-dummy-image.jpeg";
import { useState, useEffect } from "react";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import StatusBadge from "@/components/StatusBadge";

interface Property {
  _id: string;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  dimension: string;
  price: string | number;
  imgUrls?: string[];
  updatedAt?: string;
  status?: string;
  tags?: string[];
}

const formatPrice = (price: string | number) => {
  const value = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(value)) return String(price);
  return value.toLocaleString("en-IN");
};

const PropertyCard = ({
  property,
  initiallySaved = false,
  onUnsave,
}: {
  property: Property;
  initiallySaved?: boolean;
  onUnsave?: (id: string) => void;
}) => {
  const [saved, setSaved] = useState(initiallySaved);
  const { user } = useUser();
  const canSaveProperties = user?.currentRole !== "admin";
  const status = property.status || "For Rent";

  useEffect(() => { setSaved(initiallySaved); }, [initiallySaved]);

  useEffect(() => {
    const verifySavedStatus = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token || !canSaveProperties) return;
        const res = await Axios.get(API_ENDPOINTS.USER.GET_SAVED_PROPERTY, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const isSaved = res.data.properties.some((p: Property) => p._id === property._id);
        setSaved(isSaved);
      } catch (error) {
        console.error("Failed to verify saved status", error);
      }
    };
    verifySavedStatus();
  }, [canSaveProperties, property._id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = Cookies.get("authToken");
    if (!token || !canSaveProperties) return;

    try {
      if (saved) {
        await Axios.delete(API_ENDPOINTS.USER.UNSAVE_PROPERTY(property._id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(false);
        onUnsave?.(property._id);
      } else {
        await Axios.post(
          API_ENDPOINTS.USER.SAVE_PROPERTY,
          { propertyId: property._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save/unsave property", error);
    }
  };

  const gallery = property.imgUrls?.slice(0, 5) || [];
  const coverImage = gallery[0] || PropertyDummyImage;
  const isInactive = status === "Sold" || status === "Off Market";

  return (
    <div
      onClick={() => (window.location.href = `/property/${property._id}`)}
      className="block group cursor-pointer">
      <article className="property-card flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={coverImage}
            alt={property.title}
            className={`image-zoom h-full w-full object-cover ${
              isInactive ? "opacity-70 grayscale-[30%]" : ""
            }`}
            loading="lazy"
          />

          {/* Dark gradient overlay for legibility */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-neutral-900/40 to-transparent pointer-events-none" />

          {/* Photo count chip */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 right-3 rounded-md bg-neutral-900/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur ring-1 ring-white/10">
              {gallery.length} photos
            </div>
          )}

          {/* Status + Save row */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            <StatusBadge status={status} />
            {canSaveProperties ? (
              <button
                onClick={handleSave}
                aria-label={saved ? "Unsave property" : "Save property"}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-700 shadow-lg ring-1 ring-neutral-900/5 hover:scale-110 hover:text-neutral-900 transition">
                {saved ? (
                  <FaBookmark className="text-cyan-500" />
                ) : (
                  <FaRegBookmark />
                )}
              </button>
            ) : null}
          </div>

          {isInactive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 ring-2 ring-cyan-400/30">
                {status === "Sold" ? "Sold" : "Off market"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">NRS</span>
            <p className="text-2xl font-black text-neutral-900 tracking-tight">
              {formatPrice(property.price)}
            </p>
          </div>

          <h3 className="text-base font-bold text-neutral-900 line-clamp-1 group-hover:text-cyan-700 transition">
            {property.title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500 truncate">
            <FaLocationDot className="shrink-0 text-neutral-400" />
            <span className="truncate">{property.address}</span>
          </p>

          {property.tags && property.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {property.tags.slice(0, 3).map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                  #{t}
                </span>
              ))}
              {property.tags.length > 3 && (
                <span className="text-[10px] text-neutral-400 font-semibold">+{property.tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center gap-5 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <IoBed className="text-neutral-400" />
              <span className="font-bold text-neutral-900">{property.bedrooms || 0}</span>
              <span className="text-xs text-neutral-500">bed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaBath className="text-neutral-400" />
              <span className="font-bold text-neutral-900">{property.bathrooms || 0}</span>
              <span className="text-xs text-neutral-500">bath</span>
            </span>
            <span className="flex items-center gap-1.5">
              <RxRulerSquare className="text-neutral-400" />
              <span className="font-bold text-neutral-900">{property.dimension || 0}</span>
              <span className="text-xs text-neutral-500">sqft</span>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PropertyCard;
