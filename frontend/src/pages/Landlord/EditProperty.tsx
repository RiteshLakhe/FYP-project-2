import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { PropertyFormData } from "./AddPropertyForm";

const EditProperty = () => {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>();
  const [uploading, setUploading] = useState(false);
  


  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await Axios.get(
          API_ENDPOINTS.PROPERTY.GET_BY_ID(propertyId!)
        );
        const propertyData = response.data.property;
        
        // Set existing images
        setExistingImages(propertyData.imgUrls);
        
        // Transform data for form (convert string enums to correct case if needed)
        const formData = {
          ...propertyData,
          attachedBathroom: propertyData.attachedBathroom?.toLowerCase(),
        };
        
        reset(formData);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        alert("Failed to load property data");
        navigate("/landlord/dashboard");
      }
    };

    fetchProperty();
  }, [propertyId, reset, navigate]);

  const onSubmit = async (data: PropertyFormData) => {
    const token = Cookies.get("authToken");
    const userId = Cookies.get("userId");
    
    if (!token || !userId) {
      alert("You are not logged in. Please log in and try again.");
      return;
    }

    try {
      setUploading(true);
      const response = await Axios.put(
        API_ENDPOINTS.PROPERTY.UPDATE(propertyId!),
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Property updated:", response.data);
      navigate("/landlord/dashboard");
    } catch (error) {
      console.error("Failed to update property:", error);
      alert("Failed to update property");
    } finally {
      setUploading(false);
    }
  };

  // Reuse the same form structure as AddPropertyForm with modifications
  return (
    <div className="h-auto w-full py-0 lg:py-10 px-0 lg:px-20 2xl:px-80">
      <div className="bg-white h-full rounded-none lg:rounded-4xl px-4 md:px-8 py-20 space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-medium">Edit Property</h1>
          <p className="text-[#6A6A6A]">
            Update your property details below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-12">
          {/* Reuse all form sections from AddPropertyForm */}
          {/* Basic Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl">Basic Details</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="title">Property Title</label>
                <input
                  type="text"
                  placeholder="Give your property a title"
                  className="border w-3/4 p-3 rounded-xs text-gray-700 border-gray-300"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
              
              {/* Continue reusing all other form fields from AddPropertyForm */}
              {/* ... */}

              {/* Example of a select field */}
              <div className="flex flex-col space-y-2">
                <label>Category</label>
                <select
                  className="border p-3 rounded-xs text-gray-700 border-gray-300"
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="Room">Room</option>
                  <option value="Appartment">Apartment</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>

              {/* Other form sections... */}
            </div>
          </div>

          {/* Image display section (read-only) */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl">Current Photos</h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {existingImages.map((imgUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imgUrl}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <h3 className="text-xl">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="">
                <label htmlFor="priceInNum">Price</label>
                <div className="w-full flex items-center gap-0 border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 ">
                  <span className="w-14">Rs.</span>
                  <input
                    type="number"
                    className="outline-none w-full"
                    {...register("price", { required: "Price is required" })}
                  />
                </div>
              </div>
              {/* Other pricing fields... */}
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-10 border bg-[#1E293B] text-white rounded-xs cursor-pointer"
            disabled={uploading}
          >
            {uploading ? "Updating..." : "Update Property"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;