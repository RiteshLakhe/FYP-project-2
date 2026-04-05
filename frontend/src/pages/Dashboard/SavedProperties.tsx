import PropertyCard from "@/components/PropertyCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface Property {
  _id: string;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  dimension: string;
  price: string;
  imgUrls?: string[];
  forSale?: boolean;
}

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  
  const handleUnsaveLocal = (propertyId: string) => {
    setSavedProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  useEffect(() => {
    const fetchSavedProperties = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        console.error("User not logged in.");
        return;
      }

      try {
        const res = await Axios.get(API_ENDPOINTS.USER.GET_SAVED_PROPERTY, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedProperties(res.data.properties);
      } catch (error) {
        console.error("Failed to fetch saved properties", error);
      }
    };

    fetchSavedProperties();
  }, []);

  return (
    <div className="flex items-center justify-center w-full px-4">
      <div className="flex flex-col items-center w-full max-w-5xl py-20 space-y-10">
        <div className="w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Saved properties</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-3xl font-black w-full text-gray-800">
          Saved Properties
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {savedProperties.length === 0 ? (
            <p className="text-gray-500">No saved properties yet.</p>
          ) : (
            savedProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                initiallySaved
                onUnsave={handleUnsaveLocal}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedProperties;
