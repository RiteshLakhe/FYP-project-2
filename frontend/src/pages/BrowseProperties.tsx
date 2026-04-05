import PropertyCard from "@/components/PropertyCard";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import Searchbar from "@/components/Searchbar";

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
  category: string;
  propertyType: string;
}

const CATEGORIES = ["Appartment", "Room", "Commercial Space"];
const TYPE = ["Residential", "Commercial"];

const BUDGET_RANGES = [
  { label: "All Range", min: 0, max: Infinity },
  { label: "Less than 10 Thousand", min: 0, max: 10000 },
  { label: "10 Thousand-50 Thousand", min: 20000, max: 50000 },
  { label: "50 Thousand-1 Lakh", min: 50000, max: 100000 },
  { label: "1 Lakh-5 Lakhs", min: 100000, max: Infinity },
];

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const BrowseProperties = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    [number, number]
  >([0, Infinity]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    string | null
  >(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useQuery();
  const searchTerm = query.get("search")?.toLowerCase();

  const fetchProperties = async () => {
    try {
      const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL);
      setProperties(response.data.properties);
    } catch (error) {
      console.error("Failed to fetch property:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const categoryFromURL = searchParams.get("category");
    setSelectedCategory(categoryFromURL);
  }, [searchParams]);

  useEffect(() => {
    let filtered = properties;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange;
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.price);
        return price >= min && price <= max;
      });
    }

    if (selectedPropertyType) {
      filtered = filtered.filter(
        (p) => p.propertyType === selectedPropertyType
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredProperties(filtered);
  }, [
    selectedCategory,
    properties,
    selectedPriceRange,
    selectedPropertyType,
    searchTerm,
  ]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };

  const handleTypeChange = (propertyType: string) => {
    setSelectedPropertyType(propertyType);
    setSearchParams({ propertyType });
  };

  const handlePriceFilter = (min: number, max: number) => {
    setSelectedPriceRange([min, max]);
  };

  return (
    <div className="px-4 xl:px-20 py-4 md:py-10">
      {showSidebar && (
        <div className="fixed inset-0 flex z-50">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setShowSidebar(false)}></div>

          <div className="relative bg-white w-3/4 max-w-xs p-5 z-50 h-full overflow-y-auto transition-transform transform translate-x-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowSidebar(false)}>✕</button>
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="text-lg font-normal mb-2">
                  Filter by Property Type
                </h2>
                <div className="space-y-2">
                  {TYPE.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleTypeChange(type);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded border ${
                        selectedPropertyType === type
                          ? "bg-[#1e293b] text-white"
                          : "bg-white text-gray-800 hover:bg-gray-100"
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-normal mb-2">Filter by Category</h2>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        handleCategoryChange(cat);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded border ${
                        selectedCategory === cat
                          ? "bg-[#1e293b] text-white"
                          : "bg-white text-gray-800 hover:bg-gray-100"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-normal mb-2">Budget Range</h2>
                <div className="space-y-2">
                  {BUDGET_RANGES.map((range) => (
                    <label
                      key={range.label}
                      className="block w-full px-2 py-2 cursor-pointer">
                      <input
                        type="radio"
                        name="budget-mobile"
                        checked={
                          selectedPriceRange[0] === range.min &&
                          selectedPriceRange[1] === range.max
                        }
                        className="mr-2"
                        onChange={() => {
                          handlePriceFilter(range.min, range.max);
                        }}
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>
              <a
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedPropertyType(null);
                  setSearchParams({});
                }}
                className="w-full text-sm block text-left xl:text-right  cursor-pointer text-gray-600 hover:underline">
                Clear Category Filter
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 xl:gap-15">
        <div className="space-y-10 col-span-3 lg:col-span-1 lg:space-y-6 items-start">
          <div className="flex  justify-between items-center w-full">
            <h1 className="text-2xl font-bold mb-0 lg:mb-6">
              Browse Properties
            </h1>
            <button
              className="block lg:hidden "
              onClick={() => setShowSidebar(true)}>
              <FaFilter />
            </button>
          </div>
          <div className="hidden lg:block ">
            <div>
              <h2 className="text-lg font-normal mb-2">
                Filter by Property Type
              </h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {TYPE.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`block w-full text-left px-4 py-2 rounded border mb-2 ${
                      selectedPropertyType === type
                        ? "bg-[#1e293b] text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}>
                    {type}
                  </button>
                ))}
              </div>

              <a
                onClick={() => {
                  setSelectedPropertyType(null);
                  setSearchParams({});
                }}
                className="w-full text-sm block text-left xl:text-right  cursor-pointer text-gray-600 hover:underline">
                Clear Property Type Filter
              </a>
            </div>
            <div>
              <h2 className="text-lg font-normal mb-2">Filter by Category</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`block w-full text-left px-4 py-2 rounded border mb-2 ${
                      selectedCategory === cat
                        ? "bg-[#1e293b] text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}>
                    <div className="">{cat}</div>
                  </button>
                ))}
              </div>

              <a
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchParams({});
                }}
                className="w-full text-sm block text-left xl:text-right  cursor-pointer text-gray-600 hover:underline">
                Clear Category Filter
              </a>
            </div>

            <div>
              <h2 className="text-lg font-normal mb-2">Budget Range</h2>
              <div className="space-y-2">
                {BUDGET_RANGES.map((range) => (
                  <label
                    key={range.label}
                    className={`block w-full px-2 py-2 cursor-pointer ${
                      selectedPriceRange[0] === range.min &&
                      selectedPriceRange[1] === range.max
                    }`}>
                    <input
                      type="radio"
                      name="budget"
                      checked={
                        selectedPriceRange[0] === range.min &&
                        selectedPriceRange[1] === range.max
                      }
                      className="mr-2"
                      onChange={() => handlePriceFilter(range.min, range.max)}
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-10">
          <Searchbar />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))
            ) : (
              <p className="col-span-full text-center">No properties found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseProperties;
