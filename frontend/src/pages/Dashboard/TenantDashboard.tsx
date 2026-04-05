import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { ShieldHalf, IdCard } from "lucide-react";
import { Bookmark } from "lucide-react";
import { Link } from "react-router";


interface User {
  _id: string;
  profileImage: string;
  fullname: string;
  phoneNumber: number;
  email: string;
  isVerified: boolean;
  savedProperties: Array<{
    _id: string;
    title: string;
    price: string;
    imgUrls?: string[];
  }>;
}

export default function TenantDashboard() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center justify-center w-5xl py-20">
        <div className="bg-white flex flex-col items-center justify-center py-6 px-16 shadow-[0px_6px_16px_rgba(0,0,0,0.1)] rounded-3xl gap-3 mb-20">
          <img src={user?.profileImage} alt="profile" className="w-28 h-28 rounded-full object-cover" />
          <div className="text-center space-y-5">
            <div className="space-y-2">
              <p className="text-2xl font-bold">{user?.fullname}</p>
              <p className="text-sm font-bold text-gray-500">{user?.email}</p>
            </div>

            {user?.isVerified === true ? (
              <div>
                <p className="text-xs text-gray-400">
                  Your aaccount is verified
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400">
                  You account is not verified <a href="">Get verified</a>
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="w-full" />

        <div className="w-full mt-10 space-y-6">
          <h1 className="text-3xl font-medium">Account</h1>
          <div className="grid grid-cols-3 gap-4 w-full">
            <Link to="/dashboard/personal-info" className="w-full p-4 rounded-xl shadow-[0px_6px_16px_rgba(0,0,0,0.1)] bg-white space-y-5 cursor-pointer">
              <IdCard className="w-8 h-8" />
              <div className="space-y-1">
                <p className="text-lg">Personal info</p>
                <span className="text-sm text-gray-500">
                  Provide pesonal details and how we can reach you
                </span>
              </div>
            </Link>
            <Link to={"/dashboard/login-and-security"} className="w-full p-4 rounded-xl shadow-[0px_6px_16px_rgba(0,0,0,0.1)] bg-white space-y-5 cursor-pointer">
              <ShieldHalf className="w-8 h-8" />
              <div className="space-y-1">
                <p className="text-lg">Login & security</p>
                <span className="text-sm text-gray-500">
                  Update you password and secure your account
                </span>
              </div>
            </Link>
            <Link to="/dashboard/saved-properties" className="w-full p-4 rounded-xl shadow-[0px_6px_16px_rgba(0,0,0,0.1)] bg-white space-y-5 cursor-pointer">
              <Bookmark className="w-8 h-8" />
              <div className="space-y-1">
                <p className="text-lg">Saved properties</p>
                <span className="text-sm text-gray-500">
                  Your saved properties
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
