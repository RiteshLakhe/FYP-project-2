import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { FaBath, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { IoBed } from "react-icons/io5";
import { TbToolsKitchen2 } from "react-icons/tb";
import { FaLocationDot, FaHouseChimney, FaCouch } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";
import { MdBalcony } from "react-icons/md";
import Searchbar from "@/components/Searchbar";
import PropertyCard from "@/components/PropertyCard";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

interface User {
  _id: string;
  fullname: string;
  email: string;
}

interface Property {
  _id: string;
  title: string;
  address: string;
  category: string;
  propertyType: string;
  city: string;
  municipality: string;
  wardNo: string;
  totalArea: string;
  floor: string;
  roadType: string;
  propertyFace: string;
  dimension: string;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  furnishing: string;
  balcony: string;
  attachedBathroom: string;
  halls: number;
  powerBackup: string;
  liftAccess: string;
  pantryAread: string;
  parkingSpace: string;
  price: string;
  imgUrls?: string[];
  forSale?: boolean;
  description?: string;
  userId?: string;
  createdAt: string;
}

interface EnquiryForm {
  fullname: string;
  email: string;
  phone: string;
  message: string;
}

const PropertyDetails = () => {
  const [user, setUser] = useState<User | null>(null);
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [ownerNumber, setOwnerNumber] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [ownerProfileImg, setOwnerPrrofileImg] = useState<string | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<EnquiryForm>({
    fullname: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const verifySavedStatus = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) return;

        const res = await Axios.get(API_ENDPOINTS.USER.GET_SAVED_PROPERTY, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const isSaved = res.data.properties.some(
          (p: Property) => p._id === property?._id
        );
        setSaved(isSaved);
      } catch (error) {
        console.error("Failed to verify saved status", error);
      }
    };

    if (property) verifySavedStatus();
  }, [property]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = Cookies.get("authToken");

    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      if (saved) {
        await Axios.delete(API_ENDPOINTS.USER.UNSAVE_PROPERTY(property!._id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(false);
      } else {
        await Axios.post(
          API_ENDPOINTS.USER.SAVE_PROPERTY,
          { propertyId: property!._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("authToken");
      const userId = Cookies.get("userId") || "";

      try {
        const response = await Axios.get(
          API_ENDPOINTS.USER.GET_USER_BY_ID(userId || ""),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullname: user.fullname,
        email: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchPropertyAndOwner = async () => {
      try {
        const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_BY_ID(id!));
        const propertyData = response.data.property;
        setProperty(propertyData);

        if (propertyData.userId) {
          const userResponse = await Axios.get(
            API_ENDPOINTS.USER.GET_USER_BY_ID(propertyData.userId)
          );
          setOwnerName(userResponse.data.user?.fullname || "Unknown");
          setOwnerNumber(userResponse.data.user?.phoneNumber || "Unknown");
          setOwnerEmail(userResponse.data.user?.email || "Unknown");
          setOwnerPrrofileImg(userResponse.data.user?.profileImage);

          timer = setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to fetch property or owner:", error);
        setLoading(false);
      }
    };

    fetchPropertyAndOwner();

    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL, {
          params: {
            category: property?.category,
          },
        });

        const filtered = response.data.properties.filter(
          (p: Property) => p._id !== id
        );
        setSimilarProperties(filtered.slice(0, 4));
      } catch (error) {
        console.log(error);
      }
    };

    if (property) fetchSimilarProperties();
  }, [property, id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="text-xl font-medium">Loading...</span>
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property)
    return <div className="text-center p-8">Property not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("authToken");

    if (!ownerEmail) {
      toast.error("Owner information not available");
      return;
    }

    try {
      await Axios.post(
        API_ENDPOINTS.USER.SEND_ENQUIRY,
        {
          ...formData,
          ownerEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Enquiry sent successfully!");
      setIsSending(true);
      setFormData({ fullname: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Failed to send enquiry:", error);
      toast.error("Please Login First");
    }
  };

  return (
    <div className="mx-auto p-4 md:p-8">
      <div className="max-w-[80rem] mx-auto space-y-10">
        <Searchbar />

        <div className="flex flex-col gap-8">
          <div className="grid md:grid-cols-2 gap-2 h-auto md:h-[32rem]">
            <img
              src={property.imgUrls?.[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className=" hidden md:grid grid-cols-2 gap-2 ">
              {property.imgUrls?.slice(1).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${property.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          </div>
          <div className="grid grid-rows-2 lg:grid-rows-none lg:grid-cols-5 items-start gap-0 lg:gap-10">
            <div className="space-y-6 grid col-span-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">{property.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaLocationDot />
                    <span>{property.address}</span>
                  </div>
                  <p className=" font-semibold ">
                    <span className="text-lg text-[#205D3B]">
                      Total Price:{" "}
                    </span>
                    <span className="text-base">NRS. {property.price}</span>
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 cursor-pointer">
                  {saved ? (
                    <FaBookmark className="text-lg text-yellow-300" />
                  ) : (
                    <FaRegBookmark className="text-lg" />
                  )}
                  <span className="text-sm">{saved ? "Saved" : "Save"}</span>
                </button>
              </div>

              <hr />

              <div className="flex flex-wrap gap-8 max-w-full text-sm text-gray-600">
                <p className="flex items-center gap-3">
                  <FaHouseChimney className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-base">{property.propertyType}</p>
                    <span>Type</span>
                  </div>
                </p>
                <p className="flex items-center gap-3">
                  <FaCouch className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-lg">{property.halls}</p>
                    <span>halls</span>
                  </div>
                </p>
                <p className="flex items-center gap-3">
                  <IoBed className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-lg">{property.bedrooms}</p>
                    {property.bedrooms === 1 ? (
                      <span>Bedroom</span>
                    ) : (
                      <span>Bedrooms</span>
                    )}
                  </div>
                </p>
                <p className="flex items-center gap-3">
                  <FaBath className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-lg">{property.bathrooms}</p>
                    {property.bathrooms === 1 ? (
                      <span>Bathroom</span>
                    ) : (
                      <span>Bathrooms</span>
                    )}
                  </div>
                </p>
                <p className="flex items-center gap-3">
                  <TbToolsKitchen2 className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-lg">{property.kitchens}</p>
                    {property.kitchens === 1 ? (
                      <span>Kitchen</span>
                    ) : (
                      <span>Kitchens</span>
                    )}
                  </div>
                </p>

                <p className="flex items-center gap-3">
                  <MdBalcony className="w-6 h-6" />
                  <div className="flex flex-col">
                    <p className="text-lg">{property.balcony}</p>
                    <span>Balcony</span>
                  </div>
                </p>
              </div>

              <hr />

              <div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-medium">About this place</h2>
                  <p className="text-gray-600">
                    {property.description || "No description available"}
                  </p>
                </div>
              </div>

              <div className="bg-white border rounded-sm">
                <div className="p-4 border border-white border-b-gray-200 w-full">
                  <h1 className="text-lg font-medium">Overview</h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 w-full px-4 py-6 gap-5 capitalize ">
                  <p>Property Type:</p>
                  <p>{property.propertyType}</p>
                  <p>Property Face: </p>
                  <p>{property.propertyFace}</p>
                  <p>Property Category:</p>
                  <p>{property.category}</p>
                  <p>Road Type: </p>
                  <p>{property.roadType}</p>
                  <p>Furnishing: </p>
                  <p>{property.furnishing}</p>
                  <p>City: </p>
                  <p>{property.city}</p>
                  <p>Municipality: </p>
                  <p>{property.municipality}</p>
                  <p>Ward No.: </p>
                  <p>{property.wardNo}</p>
                  <p>Total Area: </p>
                  <p>{property.totalArea} sqft</p>
                  <p>Dimension: </p>
                  <p>{property.dimension} sqft</p>
                  <p>FLoor: </p>
                  <p>{property.floor}</p>
                  <p>Attached Bathroom: </p>
                  <p>{property.attachedBathroom}</p>
                  <p>Attached Bathroom: </p>
                  <p>{property.attachedBathroom}</p>
                  <p>Date Posted: </p>
                  <p>
                    {new Date(property.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid col-span-3 lg:col-span-2">
              <div className="w-full bg-white rounded-sm drop-shadow-sm h-auto space-y-0">
                <div className="flex gap-4 h-auto px-6 py-8">
                  <img
                    src={ownerProfileImg || ""}
                    alt="Owner Profile"
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="h-20 flex flex-col justify-between">
                    <h1 className="text-lg">{ownerName}</h1>
                    <p className="flex items-center gap-2">
                      <FaPhoneAlt />{" "}
                      <span className="text-gray-600 text-sm">
                        +977 {ownerNumber}
                      </span>{" "}
                    </p>
                    <p className="flex items-center gap-2">
                      <IoMdMail />{" "}
                      <span className="text-gray-600 text-sm">
                        {ownerEmail}
                      </span>
                    </p>
                  </div>
                </div>

                <hr className=" border-dashed" />

                <div className="space-y-5 px-6 py-10">
                  <h1 className="text-xl">Contact for Enquiry</h1>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="fullname"
                        className="text-base text-gray-600">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        id="fullname"
                        value={formData.fullname}
                        className="w-full border p-2"
                        readOnly
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-base text-gray-600">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        className="w-full border p-2"
                        readOnly
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="phone"
                        className="text-base text-gray-600">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full border p-2"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="message"
                        className="text-base text-gray-600">
                        Message
                      </label>
                      <textarea
                        name="message"
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full border p-2 h-44 resize-none"
                        placeholder="Enter your message"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1E293B] text-white hover:bg-[#0f172a] transition-colors"
                      disabled={isSending}>
                      {isSending ? "Sending...." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full space-y-6 mt-10">
            <h1 className="text-2xl font-medium">Similar Properties</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
