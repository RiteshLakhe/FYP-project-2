import PropertyCard from "@/components/PropertyCard";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FaFilter, FaTimes } from "react-icons/fa";
import Searchbar from "@/components/Searchbar";
import { PROPERTY_STATUSES, statusClassName } from "@/lib/propertyStatus";

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
  status?: string;
  tags?: string[];
}

const CATEGORIES = ["Appartment", "Room", "Commercial Space"];
const TYPES = ["Residential", "Commercial"];

const BUDGET_RANGES = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under Rs. 10K", min: 0, max: 10000 },
  { label: "Rs. 10K – 50K", min: 10000, max: 50000 },
  { label: "Rs. 50K – 1 Lakh", min: 50000, max: 100000 },
  { label: "1 Lakh+", min: 100000, max: Infinity },
];

const useQuery = () => new URLSearchParams(useLocation().search);

const BrowseProperties = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, Infinity]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
    setSelectedCategory(searchParams.get("category"));
    setSelectedStatus(searchParams.get("status"));
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
      filtered = filtered.filter((p) => p.propertyType === selectedPropertyType);
    }
    if (selectedStatus) {
      filtered = filtered.filter((p) => (p.status || "For Rent") === selectedStatus);
    }
    if (selectedTags.length) {
      filtered = filtered.filter((p) =>
        selectedTags.every((t) => (p.tags || []).includes(t))
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(searchTerm));
    }

    setFilteredProperties(filtered);
  }, [selectedCategory, properties, selectedPriceRange, selectedPropertyType, selectedStatus, selectedTags, searchTerm]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    params.set("category", category);
    setSearchParams(params);
  };

  const handleTypeChange = (propertyType: string) => {
    setSelectedPropertyType(propertyType);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    setSearchParams(params);
  };

  const handlePriceFilter = (min: number, max: number) => {
    setSelectedPriceRange([min, max]);
  };

  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedPropertyType(null);
    setSelectedStatus(null);
    setSelectedTags([]);
    setSelectedPriceRange([0, Infinity]);
    setSearchParams({});
  };

  const activeFilters = [
    selectedCategory && { label: selectedCategory, clear: () => { setSelectedCategory(null); const p = new URLSearchParams(searchParams); p.delete("category"); setSearchParams(p); }},
    selectedPropertyType && { label: selectedPropertyType, clear: () => setSelectedPropertyType(null) },
    selectedStatus && { label: selectedStatus, clear: () => { setSelectedStatus(null); const p = new URLSearchParams(searchParams); p.delete("status"); setSearchParams(p); }},
    selectedPriceRange[0] !== 0 || selectedPriceRange[1] !== Infinity
      ? { label: BUDGET_RANGES.find(r => r.min === selectedPriceRange[0] && r.max === selectedPriceRange[1])?.label || "Budget", clear: () => setSelectedPriceRange([0, Infinity]) }
      : null,
    ...selectedTags.map((t) => ({ label: `#${t}`, clear: () => toggleTag(t) })),
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const allTags = Array.from(
    new Set(
      properties.flatMap((p) => p.tags || []).map((t) => t.toLowerCase())
    )
  ).sort();

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      {allTags.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-auto thin-scroll pr-1">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition ${
                    active
                      ? "bg-neutral-900 text-cyan-400 border-neutral-900"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
                  }`}>
                  # {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Status</h3>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_STATUSES.filter((s) => s !== "Off Market").map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`status-badge w-full justify-center cursor-pointer ${
                selectedStatus === status
                  ? statusClassName(status) + " ring-2 ring-offset-1 ring-blue-500"
                  : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Property Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition ${
                selectedPropertyType === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-500"
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium border transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-500"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Budget</h3>
        <div className="space-y-2">
          {BUDGET_RANGES.map((range) => (
            <label
              key={range.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                selectedPriceRange[0] === range.min && selectedPriceRange[1] === range.max
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
              <input
                type="radio"
                name="budget"
                checked={selectedPriceRange[0] === range.min && selectedPriceRange[1] === range.max}
                onChange={() => handlePriceFilter(range.min, range.max)}
                className="accent-blue-600"
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={clearAll}
        className="w-full btn-ghost justify-center border border-slate-200">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="page-reveal">
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-10">
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow">Browse listings</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-2">
                {selectedCategory ? `${selectedCategory}s for ${selectedStatus || "Rent"}` : "Find your next place"}
              </h1>
              <p className="text-slate-600 mt-1">
                {filteredProperties.length} {filteredProperties.length === 1 ? "listing" : "listings"} available
              </p>
            </div>
            <Searchbar />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto thin-scroll pr-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <FilterPanel />
            </div>
          </aside>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((f, i) => (
                  <span
                    key={i}
                    onClick={f.clear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100">
                    {f.label}
                    <FaTimes size={10} />
                  </span>
                ))}
              </div>
              <button
                className="lg:hidden btn-secondary !py-2 !px-3"
                onClick={() => setShowSidebar(true)}>
                <FaFilter />
                <span className="text-xs">Filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
                  <p className="text-slate-600 font-semibold">No properties match these filters</p>
                  <p className="text-slate-500 text-sm mt-1">Try clearing some filters or broadening your search.</p>
                  <button onClick={clearAll} className="btn-secondary mt-4 mx-auto">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowSidebar(false)} />
          <div className="absolute right-0 top-0 h-full w-[320px] max-w-[85%] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowSidebar(false)} className="text-slate-500">
                <FaTimes />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProperties;
