import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuUpload } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

export type PropertyFormData = {
  title: string;
  description: string;
  category: "Room" | "Appartment" | "Commercial Space";
  propertyType: "Residential" | "Commercial";
  address: string;
  city: string;
  municipality: string;
  wardNo: string;
  mapLabel: string;
  latitude: number;
  longitude: number;
  totalArea: number;
  floor: string;
  dimension: number;
  roadType: "Gravelled" | "Paved" | "Alley";
  propertyFace:
    | "East"
    | "West"
    | "North"
    | "South"
    | "South-East"
    | "South-West"
    | "North-East"
    | "North-West";
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  halls: number;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  balcony: number;
  attachedBathroom: number;
  suitable: string;
  floorLoad: number;
  powerBackup: "Yes" | "No";
  liftAccess: "Yes" | "No";
  pantryArea: "Yes" | "No";
  parkingSpace: string;
  price: number;
  priceInWords: string;
  negotiable: "Yes" | "No";
};

const AddPropertyForm= () => {
  const { setUser } = useUser();
  const [images, setImages] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const category = watch("category");
  const isNegotiable = watch("negotiable");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const mapLabel = watch("mapLabel");

  const onSubmit = async (data: PropertyFormData) => {
    const formData = new FormData();
    const userId = Cookies.get("userId");
    const token = Cookies.get("authToken");
    console.log("Retrieved authToken:", userId);
    if (!token || !userId) {
      alert("You are not logged in. Please log in and try again.");
      return;
    }

    formData.append("userId", userId!);

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    images.forEach((file) => {
      formData.append("images", file);
    });

    if (images.length < 5) {
      alert("Please upload at least 5 images.");
      return;
    }

    try {
      setUploading(true);
      const response = await Axios.post(
        API_ENDPOINTS.PROPERTY.ADD(userId!),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { user: updatedUser } = response.data;

      if (updatedUser) {
        setUser(updatedUser);
      }

      console.log("Property created:", response.data);
      reset();
      navigate("/landlord/landlord-dashboard");
    } catch (error) {
      console.error("Failed to create property:", error);
      const serverMessage =
        (error as any)?.response?.data?.message || "Failed to create property";
      toast.error(serverMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + images.length > 10) return;
    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-auto w-full py-0 lg:py-10 px-0 lg:px-20 2xl:px-80">
      <div className="bg-white h-full rounded-none lg:rounded-4xl px-4 md:px-8 py-20 space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-medium">List Your Property</h1>
          <p className="text-[#6A6A6A]">
            Fill up the form below to add your property at RentEase
          </p>
        </div>

        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-12">
          <div className="space-y-6">
            <h3 className="text-xl">Basic Details</h3>
            <div className="space-y-4">
              <div className="flex flex-col ">
                <label htmlFor="title"> Property Title</label>
                <input
                  type="text"
                  placeholder="Give your property a title"
                  className="border w-3/4 p-3 rounded-xs text-gray-700 border-gray-300"
                  {...register("title", { required: true })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="desc">Description</label>
                <textarea
                  rows={10}
                  placeholder="Enter a some description about the property property...."
                  className="border p-3 w-full rounded-xs text-gray-700 border-gray-300 resize-none"
                  {...register("description", { required: true })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 md:gap-y-0 gap-x-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="">Category</label>
                  <select
                    className="border p-3 rounded-xs text-gray-700 border-gray-300"
                    {...register("category", { required: true })}>
                    <option value="Room">Room</option>
                    <option value="Appartment">Appartment</option>
                    <option value="Commercial Space">Commercial Space</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="">Type</label>
                  <select
                    className="border p-3 rounded-xs text-gray-700 border-gray-300"
                    {...register("propertyType", { required: true })}>
                    <option value="Residential">Residental</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.propertyType.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl">Address Details</h3>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="Enter address"
                  {...register("address", { required: true })}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="Enter city"
                  {...register("city", { required: true })}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="municipality">Municipality</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="Enter municipality"
                  {...register("municipality", { required: true })}
                />
                {errors.municipality && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.municipality.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="wardNo">Ward No.</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="Enter Ward No."
                  {...register("wardNo", { required: true })}
                />
                {errors.wardNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.wardNo.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="mapLabel">Map Label</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="e.g. Jawalakhel, Lalitpur"
                  {...register("mapLabel", { required: "Map label is required" })}
                />
                {errors.mapLabel && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.mapLabel.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="e.g. 27.7172"
                  {...register("latitude", {
                    required: "Latitude is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.latitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.latitude.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border p-3 rounded-xs text-gray-700 border-gray-300"
                  placeholder="e.g. 85.3240"
                  {...register("longitude", {
                    required: "Longitude is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.longitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.longitude.message}
                  </p>
                )}
              </div>
            </div>
            {latitude && longitude ? (
              <div className="border rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-700">
                  Map preview for {mapLabel || "selected location"}
                </div>
                <iframe
                  title="Property Location Preview"
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  className="w-full h-72 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl">Property Area & Road</h3>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="area">Total Area</label>
                <input
                  type="text"
                  placeholder="in Sq.Feet"
                  className="w-full border p-3 rounded-xs text-gray-700  border-gray-300"
                  {...register("totalArea", { required: true })}
                />
                {errors.totalArea && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.totalArea.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="area">Floor</label>
                <input
                  type="text"
                  placeholder="Eg: First floor, Second Floor, ....."
                  className="w-full border p-3 rounded-xs text-gray-700  border-gray-300"
                  {...register("floor", { required: true, })}
                />
                {errors.floor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.floor.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="area">Dimension</label>
                <input
                  type="number"
                  placeholder="Enter total area in sq.ft"
                  className="w-full border p-3 rounded-xs text-gray-700  border-gray-300"
                  {...register("dimension", { required: true, min: { value: 1, message: "Dimension must be positive" } })}
                  
                />
                {errors.dimension && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dimension.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="area">Road type</label>
                <select
                  id="road"
                  className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                  {...register("roadType", { required: true })}>
                  <option value="Gravelled">Gravelled</option>
                  <option value="Paved">Paved</option>
                  <option value="Alley">Alley</option>
                </select>
                {errors.roadType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roadType.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="area">Property face</label>
                <select
                  id="face"
                  className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                  {...register("propertyFace", { required: true })}>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                </select>
                {errors.propertyFace && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.propertyFace.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl">Additional Details</h3>

            {["Room", "Appartment"].includes(category) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 2"
                    {...register("bedrooms", {
                      min: { value: 1, message: "Dimension must be positive" }
                    })}
                  />
                  {errors.bedrooms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bedrooms.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 1"
                    {...register("bathrooms", {
                      min: { value: 1, message: "NUmber must be positive" }
                    })}
                  />
                  {errors.bathrooms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bathrooms.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Kitchens</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 1"
                    {...register("kitchens", {
                      min: { value: 1, message: "Number must be positive" }
                    })}
                  />
                  {errors.kitchens && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.kitchens.message}
                    </p>
                  )}
                </div>

                <div>
                  <label>Halls</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 1"
                    {...register("halls", {
                      min: { value: 1, message: "Dimension must be positive" }
                    })}
                  />
                  {errors.halls && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.halls.message}
                    </p>
                  )}
                </div>

                <div>
                  <label>Furnishing</label>
                  <select
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    {...register("furnishing")}>
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                  {errors.furnishing && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.furnishing.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Balcony</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 1"
                    {...register("balcony", {
                      min: { value: 1, message: "Dimension must be positive" }
                    })}
                  />
                  {errors.balcony && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.balcony.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Attached Bathroom</label>
                  <select
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    {...register("attachedBathroom")}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {errors.attachedBathroom && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.attachedBathroom.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {category === "Commercial Space" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Suitable For</label>
                  <input
                    type="text"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. Office, Shop"
                    {...register("suitable")}
                  />
                  {errors.suitable && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.suitable.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Floor Load Capacity (tons)</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 2"
                    {...register("floorLoad", {
                      min: { value: 1, message: "Dimension must be positive" }
                    })}
                  />
                  {errors.floorLoad && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.floorLoad.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Power Backup</label>
                  <select
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    {...register("powerBackup")}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.powerBackup && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.powerBackup.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Lift Access</label>
                  <select
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    {...register("liftAccess")}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.liftAccess && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.liftAccess.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Pantry Area</label>
                  <select
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    {...register("pantryArea")}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.pantryArea && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.pantryArea.message}
                    </p>
                  )}
                </div>
                <div>
                  <label>Parking Spaces</label>
                  <input
                    type="number"
                    className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-300 outline-none"
                    placeholder="e.g. 5"
                    {...register("parkingSpace", {
                      min: { value: 1, message: "Dimension must be positive" }
                    })}
                  />
                  {errors.parkingSpace && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.parkingSpace.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl">Add Photos</h3>
            </div>

            <div className="space-y-10">
              <input
                type="file"
                id="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="border hidden"
              />
              <label
                htmlFor="file"
                className="bg-[#F2F4F7] outline-dashed space-y-4 w-full h-52 flex flex-col items-center justify-center">
                <LuUpload className="w-12 h-12" />
                <p className="text-md">Click to upload</p>
                <p className="text-[#6A6A6A] font-normal text-sm">
                  Add atleast 5 photos of the property
                </p>
              </label>

              <div className="grid grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`preview-${index}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity">
                      <RxCross2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                    {...register("price", { required: true })}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col"> 
                <label htmlFor="priceInWords">Price in Words</label>
                <input
                  type="text"
                  placeholder="Eg: Twenty thousand five hundred"
                  className="w-full border p-3 rounded-xs text-gray-700 cursor-pointer border-gray-30"
                  {...register("priceInWords", { required: true })}
                />
                {errors.priceInWords && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.priceInWords.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="">Negotiable</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setValue("negotiable", "Yes")}
                    className={`border py-3 px-6 rounded-xs text-gray-700 cursor-pointer  ${
                      isNegotiable === "Yes"
                        ? "border-gray-600 bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:border-gray-600 "
                    }`}>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("negotiable", "No")}
                    className={`border py-3 px-6 rounded-xs text-gray-700 cursor-pointer  ${
                      isNegotiable === "No"
                        ? "border-gray-600 bg-gray-100 text-gray-700"
                        : "text-gray-700 hover:border-gray-600 "
                    }`}>
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-10 border bg-[#1E293B] text-white rounded-xs cursor-pointer"
            disabled={uploading}>
            {uploading ? "Uploading..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyForm;
