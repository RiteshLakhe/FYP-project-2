import { useNavigate } from "react-router-dom";
import RentEaseLogo from "../assets/RentEase.svg";
import { FiPlusCircle, FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { IoIosArrowDown } from "react-icons/io";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { navLinks } from "@/data/Navlinks";
import { useLocation } from "react-router-dom";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";

interface User {
  _id: string;
  fullname: string;
  profileImage: string;
}
const Navbar = () => {
  const navigate = useNavigate();
  const { user, clearUser, switchRole } = useUser();
  const [userData, setUserData] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isLandlordRoute = location.pathname.startsWith("/landlord");

  const userId = Cookies.get("userId") || "";

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setUserData(null);
        return;
      }

      try {
        const res = await Axios.get(API_ENDPOINTS.USER.GET_USER_BY_ID(userId));
        setUserData(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await clearUser();
      navigate("/");
      window.location.reload();
      toast.success("Logged out!!!", {
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed!", {
        autoClose: 3000,
      });
    }
  };

  const handlePostPropertyRoute = () => {
    if (user) {
      navigate("/postProperty");
    } else {
      navigate("/registration/signin");
      toast.error("Please login first", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const hasBothRoles =
    user?.roles?.includes("tenant") && user?.roles?.includes("landlord");

  const handleSwitchRole = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    const nextRole = user.currentRole === "tenant" ? "landlord" : "tenant";
    try {
      await switchRole(nextRole);

      navigate(nextRole === "tenant" ? "/" : "/landlord/landlord-dashboard");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        `Failed to switch role. ${error instanceof Error ? error.message : ""}`
      );
    }
  };

  const handleProfile = () => {
    navigate("/dashboard");
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white py-0 flex items-center justify-center border border-b-gray-200 sticky top-0 z-50">
      <div className="w-full px-3 xl:px-10 flex items-center justify-between">
        {!isLandlordRoute ? (
          <img
            src={RentEaseLogo}
            alt="RentEase Logo"
            className="w-28 md:w-40 cursor-pointer"
            onClick={() => navigate("/")}
          />
        ) : (
          <img
            src={RentEaseLogo}
            alt="RentEase Logo"
            className="w-28 md:w-40 cursor-pointer"
            onClick={() => navigate("/landlord/landlord-dashboard")}
          />
        )}

        <div className="hidden lg:flex items-center gap-14 ml-auto">
          {!isLandlordRoute && (
            <nav>
              <ul className="flex items-center gap-6 lg:gap-8">
                {navLinks.map((link, index) => {
                  const isActive = (path: string) => {
                    return location.pathname === path;
                  };
                  return (
                    <li
                      key={index}
                      className={`hover:text-[#1A623A] cursor-pointer transition-colors text-sm ${
                        isActive(link.path)
                          ? "text-[#1A623A] font-semibold"
                          : ""
                      }`}
                      onClick={() => navigate(link.path)}>
                      {link.text}
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {hasBothRoles ? (
              <button
                className="hidden sm:flex items-center px-4 md:px-6 py-2 md:py-2 rounded-sm gap-2 cursor-pointer bg-[#1E293B] text-white"
                onClick={handleSwitchRole}>
                <span className="text-sm md:text-base">
                  Switch to{" "}
                  {user?.currentRole === "tenant" ? "Landlord" : "Tenant"}
                </span>
              </button>
            ) : (
              !isLandlordRoute && (
                <button
                  className="hidden sm:flex items-center px-4 md:px-6 py-2 md:py-2 rounded-sm gap-2 cursor-pointer bg-[#1E293B] text-white"
                  onClick={handlePostPropertyRoute}>
                  <FiPlusCircle />
                  <span className="text-sm md:text-base">
                    Post your property
                  </span>
                </button>
              )
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center border rounded-sm gap-2 py-2 px-4 bg-white hover:bg-gray-50 cursor-pointer">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center cursor-pointer"
                      onClick={() => navigate("/dashboard/personal-info")}>
                      <img
                        src={userData?.profileImage || user?.profileImage}
                        alt="Profile Image"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <span className="font-normal text-sm">
                      {userData?.fullname || user?.fullname}
                    </span>
                    <IoIosArrowDown />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center">
                    <CgProfile /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center">
                    <FiLogOut /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate("/registration/signin")}
                className="bg-white hover:bg-gray-50 text-black px-10 py-2 border rounded-sm cursor-pointer text-sm md:text-base">
                Login/Sigup
              </button>
            )}
          </div>
        </div>
        <div className="block lg:hidden">
          <RxHamburgerMenu
            className="w-6 h-6"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 left-0 top-0 h-screen  bg-black opacity-20"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-0 right-0 px-6 grow-0 h-screen space-y-4 bg-white shadow-lg p-6 transition-transform transform translate-x-0">
            <div className="w-[200px] sm:w-[250px] space-y-6">
              <div
                className="w-full flex justify-end"
                onClick={() => setIsOpen(false)}>
                <RxCross2 className="w-6 h-6" />
              </div>

              {user ? (
                <div
                  className="flex items-center border rounded-sm gap-2 py-2 px-4 bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={handleProfile}>
                  <div className="w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer">
                    <img
                      src={userData?.profileImage || user?.profileImage}
                      alt="Profile Image"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  <span className="font-normal text-sm">
                    {userData?.fullname || user?.fullname}
                  </span>
                </div>
              ) : (
                <div></div>
              )}

              {user ? <hr /> : <div> </div>}

              <nav>
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link, index) => {
                    const isActive = (path: string) => {
                      return location.pathname === path;
                    };
                    return (
                      <li
                        key={index}
                        className={`hover:text-[#1A623A] cursor-pointer transition-colors text-sm ${
                          isActive(link.path)
                            ? "text-[#1A623A] font-semibold"
                            : ""
                        }`}
                        onClick={() => navigate(link.path)}>
                        {link.text}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6 flex flex-col gap-4">
                {hasBothRoles ? (
                  <button
                    className="block text-center px-4 md:px-6 py-3 rounded-sm gap-2 cursor-pointer bg-[#1E293B] text-white"
                    onClick={handleSwitchRole}>
                    <span className="text-sm md:text-base">
                      Switch to{" "}
                      {user?.currentRole === "tenant" ? "Landlord" : "Tenant"}
                    </span>
                  </button>
                ) : (
                  !isLandlordRoute && (
                    <button
                      className="flex items-center w-full justify-center px-4 md:px-6 py-3 rounded-sm gap-2 cursor-pointer bg-[#1E293B] text-white"
                      onClick={handlePostPropertyRoute}>
                      <FiPlusCircle />
                      <span className="text-sm md:text-base">
                        Post your property
                      </span>
                    </button>
                  )
                )}

                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-sm">
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/registration/signin");
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-white border text-black rounded-sm">
                    Login/Signup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
