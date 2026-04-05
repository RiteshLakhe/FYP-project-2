import { FaBath, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoBed } from "react-icons/io5";
import { RxRulerSquare } from "react-icons/rx";
import PropertyDummyImage from "../assets/property-dummy-image.jpeg";
import { useState, useEffect } from "react";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";

interface Property {
  _id: string;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  dimension: string;
  price: string;
  imgUrls?: string[];
  updatedAt?: string;
  status?: string;
}

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

  useEffect(() => {
    setSaved(initiallySaved);
  }, [initiallySaved]);

  useEffect(() => {
    const verifySavedStatus = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) return;

        const res = await Axios.get(API_ENDPOINTS.USER.GET_SAVED_PROPERTY, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const isSaved = res.data.properties.some(
          (p: Property) => p._id === property._id
        );
        setSaved(isSaved);
      } catch (error) {
        console.error("Failed to verify saved status", error);
      }
    };

    verifySavedStatus();
  }, [property._id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = Cookies.get("authToken");

    if (!token) {
      console.error("No token found. User might not be logged in.");
      return;
    }

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

  return (
    <div
      onClick={() => (window.location.href = `/property/${property._id}`)}
      className="block group cursor-pointer">
      <div className="w-full shadow-md rounded-md overflow-hidden bg-white">
        <div className="relative">
          <div className="absolute w-full p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              {property.status && (
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                    property.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : property.status === "Inactive"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {property.status}
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              className="p-2 rounded-full bg-white shadow cursor-pointer">
              {saved ? (
                <FaBookmark className="text-yellow-300" />
              ) : (
                <FaRegBookmark />
              )}
            </button>
          </div>
          <img
            src={property.imgUrls?.[0] || PropertyDummyImage}
            alt={property.title}
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4 space-y-2">
          <h1 className="text-sm sm:text-base md:text-lg font-semibold truncate group-hover:underline">
            {property.title}
          </h1>
          <p className="text-[#838383] flex items-center gap-1 text-sm truncate">
            <FaLocationDot />
            <span>{property.address}</span>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#838383]">
            <p className="flex items-center gap-1">
              <IoBed /> <span>{property.bedrooms} beds</span>
            </p>
            <p className="flex items-center gap-1">
              <FaBath /> <span>{property.bathrooms} bathrooms</span>
            </p>
            <p className="flex items-center gap-1">
              <RxRulerSquare /> <span>{property.dimension}sqft</span>
            </p>
          </div>
          <p className="text-[#205D3B] font-bold text-lg">
            <span className="text-black text-xl">NRS.</span> {property.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
