import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { FaBath, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { IoBed } from "react-icons/io5";
import { TbToolsKitchen2 } from "react-icons/tb";
import { FaLocationDot, FaHouseChimney, FaCouch, FaStar } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";
import { MdBalcony } from "react-icons/md";
import Searchbar from "@/components/Searchbar";
import PropertyCard from "@/components/PropertyCard";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface User {
  id?: string;
  _id: string;
  fullname: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface PropertyLocation {
  latitude: number;
  longitude: number;
  mapLabel: string;
  googleMapsUrl: string;
}

interface PropertyReview {
  _id: string;
  userId?: User;
  fullname: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface VisitSchedule {
  _id: string;
  visitorId?: User;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  scheduledFor: string;
  note: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  responseMinutes?: number | null;
  createdAt: string;
}

interface PriceHistoryEntry {
  price: number;
  changedAt: string;
  reason: string;
}

interface TrustScore {
  score: number;
  label: "Low" | "Moderate" | "High" | "Excellent";
  breakdown: {
    verifiedIdentity: number;
    positiveReviews: number;
    responseTime: number;
    listingAccuracy: number;
    complaintHistory: number;
  };
  responseRate: number;
  averageRating: number;
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
  userId?: string | User;
  location?: PropertyLocation;
  reviews: PropertyReview[];
  visitSchedules: VisitSchedule[];
  priceHistory: PriceHistoryEntry[];
  trustScore: TrustScore;
  createdAt: string;
}

interface EnquiryForm {
  fullname: string;
  email: string;
  phone: string;
  message: string;
}

interface ReviewForm {
  rating: number;
  comment: string;
}

interface VisitForm {
  scheduledFor: string;
  visitorPhone: string;
  note: string;
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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [mapMode, setMapMode] = useState<"map" | "satellite" | "nearby">("map");
  const [formData, setFormData] = useState<EnquiryForm>({
    fullname: "",
    email: "",
    phone: "",
    message: "",
  });
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: "",
  });
  const [visitForm, setVisitForm] = useState<VisitForm>({
    scheduledFor: "",
    visitorPhone: "",
    note: "",
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
      setVisitForm((prev) => ({
        ...prev,
        visitorPhone: prev.visitorPhone || String(user.phoneNumber || ""),
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

        const owner =
          propertyData.userId && typeof propertyData.userId === "object"
            ? propertyData.userId
            : null;

        if (owner) {
          setOwnerName(owner.fullname || "Unknown");
          setOwnerNumber(owner.phoneNumber || "Unknown");
          setOwnerEmail(owner.email || "Unknown");
          setOwnerPrrofileImg(owner.profileImage || "");
        }

        timer = setTimeout(() => {
          setLoading(false);
        }, 1000);
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

  const isLandlordOwner =
    !!user &&
    !!property.userId &&
    typeof property.userId === "object" &&
    (user.id || user._id) === property.userId._id;

  const priceTrendData = (property.priceHistory || []).map((entry, index) => ({
    index: index + 1,
    price: entry.price,
    date: new Date(entry.changedAt).toLocaleDateString(),
    reason: entry.reason,
  }));

  const mapSrc =
    property.location
      ? mapMode === "satellite"
        ? `https://www.google.com/maps?q=${property.location.latitude},${property.location.longitude}&t=k&z=15&output=embed`
        : mapMode === "nearby"
        ? `https://www.google.com/maps?q=restaurants%20near%20${property.location.latitude},${property.location.longitude}&z=15&output=embed`
        : `https://www.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`
      : "";

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to leave a review.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const response = await Axios.post(API_ENDPOINTS.PROPERTY.ADD_REVIEW(property._id), reviewForm);
      setProperty((prev) =>
        prev
          ? {
              ...prev,
              reviews: response.data.reviews,
              trustScore: response.data.trustScore,
            }
          : prev
      );
      setReviewForm({ rating: 5, comment: "" });
      toast.success(response.data.message || "Review saved");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to book a visit.");
      return;
    }

    try {
      setIsSchedulingVisit(true);
      const response = await Axios.post(
        API_ENDPOINTS.PROPERTY.SCHEDULE_VISIT(property._id),
        visitForm
      );
      setProperty((prev) =>
        prev
          ? {
              ...prev,
              visitSchedules: response.data.visitSchedules,
              trustScore: response.data.trustScore,
            }
          : prev
      );
      setVisitForm((prev) => ({ ...prev, scheduledFor: "", note: "" }));
      toast.success(response.data.message || "Visit scheduled");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule visit");
    } finally {
      setIsSchedulingVisit(false);
    }
  };

  const handleVisitStatusUpdate = async (
    visitId: string,
    status: "Approved" | "Rejected" | "Completed"
  ) => {
    try {
      const response = await Axios.patch(
        API_ENDPOINTS.PROPERTY.UPDATE_VISIT_STATUS(property._id, visitId),
        { status }
      );
      setProperty((prev) =>
        prev
          ? {
              ...prev,
              visitSchedules: response.data.visitSchedules,
              trustScore: response.data.trustScore,
            }
          : prev
      );
      toast.success(response.data.message || "Visit updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update visit");
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
                    <span>{property.location?.mapLabel || property.address}</span>
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

              {property.location ? (
                <div className="bg-white border rounded-sm overflow-hidden">
                  <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <div className="border-r border-gray-200 p-4 space-y-4 bg-[#f8fafc]">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Zillow-style map panel
                        </p>
                        <h1 className="text-xl font-semibold mt-2">Explore the area</h1>
                        <p className="text-sm text-gray-600 mt-1">
                          Switch views and inspect the property location, satellite imagery, and nearby conveniences.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "map", label: "Map" },
                          { key: "satellite", label: "Satellite" },
                          { key: "nearby", label: "Nearby" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setMapMode(item.key as "map" | "satellite" | "nearby")}
                            className={`rounded-sm border px-3 py-2 text-sm cursor-pointer ${
                              mapMode === item.key
                                ? "bg-[#1E293B] text-white border-[#1E293B]"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-sm bg-white border border-gray-200 p-4 space-y-2">
                        <p className="font-medium">{property.location.mapLabel}</p>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="text-xs text-gray-500">
                          {property.location.latitude.toFixed(4)}, {property.location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <a
                        href={property.location.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm text-[#1A623A] hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                    <div className="relative">
                      <iframe
                        title="Property Location Map"
                        src={mapSrc}
                        className="w-full h-[28rem] border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div className="absolute left-4 top-4 bg-white/95 backdrop-blur rounded-sm shadow-md px-4 py-3 max-w-xs border border-gray-200">
                        <p className="text-sm font-semibold">{property.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{property.location.mapLabel}</p>
                        <p className="text-sm text-[#205D3B] font-semibold mt-2">NRS. {property.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

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
                  <p>Map Label:</p>
                  <p>{property.location?.mapLabel || "Not added"}</p>
                  <p>Total Area: </p>
                  <p>{property.totalArea} sqft</p>
                  <p>Dimension: </p>
                  <p>{property.dimension} sqft</p>
                  <p>FLoor: </p>
                  <p>{property.floor}</p>
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

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-sm p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">Rental Trust Score</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Designed to reduce fake listings, hidden costs, and unsafe landlord concerns.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#205D3B]">
                        {property.trustScore?.score ?? 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {property.trustScore?.label || "Low"} confidence
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Verified identity</span><span>+{property.trustScore?.breakdown?.verifiedIdentity ?? 0}</span></div>
                    <div className="flex justify-between"><span>Past tenant reviews</span><span>+{property.trustScore?.breakdown?.positiveReviews ?? 0}</span></div>
                    <div className="flex justify-between"><span>Response time</span><span>+{property.trustScore?.breakdown?.responseTime ?? 0}</span></div>
                    <div className="flex justify-between"><span>Listing accuracy</span><span>+{property.trustScore?.breakdown?.listingAccuracy ?? 0}</span></div>
                    <div className="flex justify-between"><span>Complaint history</span><span>+{property.trustScore?.breakdown?.complaintHistory ?? 0}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-sm bg-[#f8fafc] border p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Avg rating</p>
                      <p className="text-xl font-semibold mt-1">{property.trustScore?.averageRating || 0}/5</p>
                    </div>
                    <div className="rounded-sm bg-[#f8fafc] border p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Response rate</p>
                      <p className="text-xl font-semibold mt-1">{property.trustScore?.responseRate || 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-sm p-5 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Rental History & Price Trends</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Helps renters judge whether the current rent looks stable or aggressively increased.
                    </p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceTrendData}>
                        <XAxis dataKey="date" hide />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`NRS. ${value}`, "Price"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line type="monotone" dataKey="price" stroke="#1E293B" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-sm">
                    {(property.priceHistory || []).slice().reverse().map((entry, index) => (
                      <div key={`${entry.changedAt}-${index}`} className="flex items-center justify-between rounded-sm border px-3 py-2">
                        <div>
                          <p className="font-medium">NRS. {entry.price}</p>
                          <p className="text-gray-500">{entry.reason}</p>
                        </div>
                        <p className="text-gray-500">
                          {new Date(entry.changedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-sm p-5 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Tenant Reviews</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Verified renters can leave feedback that directly improves or reduces trust.
                    </p>
                  </div>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                        }
                        className="w-full border p-3 rounded-sm mt-1"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} Stars
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                        }
                        className="w-full border p-3 rounded-sm mt-1 h-28 resize-none"
                        placeholder="Share your experience with the property and landlord"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-3 bg-[#1E293B] text-white rounded-sm"
                    >
                      {isSubmittingReview ? "Saving..." : "Submit Review"}
                    </button>
                  </form>
                </div>

                <div className="bg-white border rounded-sm p-5 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">What renters are saying</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Positive reviews add points; complaints and bad experiences reduce confidence.
                    </p>
                  </div>
                  <div className="space-y-3 max-h-[25rem] overflow-y-auto pr-1">
                    {(property.reviews || []).length ? (
                      property.reviews
                        .slice()
                        .reverse()
                        .map((review) => (
                          <div key={review._id} className="rounded-sm border p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium">{review.fullname}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-amber-500">
                                <FaStar />
                                <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-3">{review.comment}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No reviews yet for this property.</p>
                    )}
                  </div>
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

                <hr className=" border-dashed" />

                <div className="space-y-5 px-6 py-10">
                  <h1 className="text-xl">Visit Scheduling System</h1>
                  <p className="text-sm text-gray-600">
                    Book a viewing slot and the landlord can approve, reject, or mark it completed.
                  </p>
                  {!isLandlordOwner ? (
                    <form onSubmit={handleVisitSubmit} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-base text-gray-600">Preferred date & time</label>
                        <input
                          type="datetime-local"
                          value={visitForm.scheduledFor}
                          onChange={(e) =>
                            setVisitForm((prev) => ({ ...prev, scheduledFor: e.target.value }))
                          }
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-base text-gray-600">Phone Number</label>
                        <input
                          type="tel"
                          value={visitForm.visitorPhone}
                          onChange={(e) =>
                            setVisitForm((prev) => ({ ...prev, visitorPhone: e.target.value }))
                          }
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-base text-gray-600">Note</label>
                        <textarea
                          value={visitForm.note}
                          onChange={(e) =>
                            setVisitForm((prev) => ({ ...prev, note: e.target.value }))
                          }
                          className="w-full border p-2 h-28 resize-none"
                          placeholder="Share any preferred timing or questions"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSchedulingVisit}
                        className="w-full py-3 bg-[#1E293B] text-white hover:bg-[#0f172a] transition-colors"
                      >
                        {isSchedulingVisit ? "Booking..." : "Book Visit"}
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-600">
                      As the landlord, you can manage incoming visit requests below.
                    </p>
                  )}

                  <div className="space-y-3">
                    {(property.visitSchedules || []).length ? (
                      property.visitSchedules
                        .slice()
                        .reverse()
                        .map((visit) => (
                          <div key={visit._id} className="border rounded-sm p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{visit.visitorName}</p>
                                <p className="text-sm text-gray-600">{visit.visitorEmail}</p>
                                <p className="text-sm text-gray-600">{visit.visitorPhone}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">
                                {visit.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(visit.scheduledFor).toLocaleString()}
                            </p>
                            {visit.note ? (
                              <p className="text-sm text-gray-600">{visit.note}</p>
                            ) : null}
                            {isLandlordOwner ? (
                              <div className="flex flex-wrap gap-2">
                                {(["Approved", "Rejected", "Completed"] as const).map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleVisitStatusUpdate(visit._id, status)}
                                    className="px-3 py-2 text-sm border rounded-sm hover:bg-gray-50"
                                  >
                                    Mark {status}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No visit requests yet.</p>
                    )}
                  </div>
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
