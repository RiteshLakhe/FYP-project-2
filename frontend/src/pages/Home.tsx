import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import Searchbar from "../components/Searchbar";
import House1BG from "../assets/chandan-chaurasia-wmx6RqemfqQ-unsplash.jpg";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Link } from "react-router";
import { IoIosArrowForward } from "react-icons/io";

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
}

const PROPERTY_CATEGORIES = [
  {
    key: "Appartment",
    title: "Latest Apartment for Rent",
    href: "/browse-properties?category=Appartment",
  },
  { key: "Room", 
    title: "Latest Room for Rent", 
    href: "/browse-properties?category=Room" 
  },
  {
    key: "Commercial Space",
    title: "Latest Commercial Space for Rent",
    href: "/browse-properties?category=Commercial Space",
  },
];

const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL);
      setProperties(response.data.properties);
    } catch (error) {
      console.error("Failed to fetch property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="page-reveal space-y-20">
      <div className="relative w-full grow section-reveal">
        <div className="w-full h-[300px] md:h-[400px] z-10 relative">
          <img
            src={House1BG}
            alt="bg-1"
            className="image-zoom w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 h-full justify-center ml-4 md:ml-20 flex flex-col w-[90%] md:w-[600px] z-10">
            <p className="section-reveal stagger-1 text-2xl md:text-4xl font-black leading-15 w-5/6">
              Searching for a place to live? Find it in RentEase
            </p>
            <p className="section-reveal stagger-2 mt-3 text-gray-500">
              Discover a wide range of properties for sale or rent in your
              desired location, filter by price, and more to find your dream
              property.
            </p>
          </div>
        </div>

        <div className="section-reveal stagger-3 flex justify-center px-2 md:px-4 -mt-10 md:-mt-8 z-20 relative grow">
          <Searchbar />
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-20 px-4 md:px-10 xl:px-20 grow">
        {PROPERTY_CATEGORIES.map((category) => {
          const filteredProperties = properties.filter(
            (property) => property.category === category.key
          );

          return (
            <div key={category.key} className="section-reveal w-full space-y-10">
              <h1 className="text-2xl text-center">{category.title}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {properties.length === 0 ? (
                  isLoading ? (
                  <p className="col-span-full text-center">
                    Loading properties...
                  </p>
                  ) : (
                  <p className="col-span-full text-center">
                    No properties found yet.
                  </p>
                  )
                ) : filteredProperties.length === 0 ? (
                  <p className="col-span-full text-center">
                    No properties found in this category.
                  </p>
                ) : (
                  filteredProperties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))
                )}
              </div>

              <div className="flex items-center gap-3 justify-center">
                <Link
                  to={category.href}
                  className="font-normal hover:underline">
                  {category.href.includes("Appartment") &&
                    "See all latest Apartments"}
                  {category.href.includes("Room") && "See all latest Rooms"}
                  {category.href.includes("Commercial") &&
                    "See all latest Commercial Spaces"}
                </Link>
                <IoIosArrowForward />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
