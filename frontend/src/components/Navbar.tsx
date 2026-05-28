import { useNavigate } from "react-router-dom";
import RentEaseLogo from "../assets/RentEase.svg";
import { FiPlusCircle, FiLogOut, FiHome, FiBookmark } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
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
import { resolveAvatar } from "@/lib/avatar";

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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLandlordRoute = location.pathname.startsWith("/landlord");

  const userId = Cookies.get("userId") || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || user?.currentRole === "admin") {
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
  }, [userId, user?.currentRole]);

  const handleLogout = async () => {
    try {
      await clearUser();
      navigate("/");
      window.location.reload();
      toast.success("Logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed!");
    }
  };

  const handlePostPropertyRoute = () => {
    if (user) navigate("/postProperty");
    else {
      navigate("/registration/signin");
      toast.error("Please login first", { autoClose: 3000 });
    }
  };

  const hasBothRoles =
    user?.roles?.includes("tenant") && user?.roles?.includes("landlord");

  const handleSwitchRole = async () => {
    if (!user) { toast.error("Please log in first."); return; }
    const nextRole = user.currentRole === "tenant" ? "landlord" : "tenant";
    try {
      await switchRole(nextRole);
      navigate(nextRole === "tenant" ? "/" : "/landlord/landlord-dashboard");
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to switch role. ${error instanceof Error ? error.message : ""}`);
    }
  };

  const handleProfile = () => {
    navigate("/dashboard");
    setIsOpen(false);
  };

  return (
    <header
      className={`chrome-reveal sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm"
          : "bg-white border-b border-transparent"
      }`}>
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 flex h-16 md:h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-12">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate(isLandlordRoute ? "/landlord/landlord-dashboard" : "/")}>
            <img src={RentEaseLogo} alt="RentEase" className="h-8 md:h-10" />
          </div>

          {!isLandlordRoute && (
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <li
                      key={index}
                      onClick={() => navigate(link.path)}
                      className={`interactive-underline cursor-pointer text-sm font-semibold transition-colors ${
                        isActive ? "text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
                      }`}>
                      {link.text}
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {hasBothRoles ? (
            <button onClick={handleSwitchRole} className="btn-secondary">
              <HiOutlineSwitchHorizontal />
              <span>
                Switch to {user?.currentRole === "tenant" ? "Landlord" : "Tenant"}
              </span>
            </button>
          ) : (
            !isLandlordRoute && (
              <button onClick={handlePostPropertyRoute} className="btn-primary">
                <FiPlusCircle />
                <span>Post Property</span>
              </button>
            )
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 hover:border-neutral-900 hover:shadow-sm cursor-pointer">
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-cyan-400/0 hover:ring-cyan-400/60 transition">
                    <img
                      src={resolveAvatar(
                        userData?.fullname || user?.fullname,
                        userData?.profileImage || user?.profileImage
                      )}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {(userData?.fullname || user?.fullname || "").split(" ")[0]}
                  </span>
                  <IoIosArrowDown className="text-neutral-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px] p-2 rounded-2xl border-neutral-200 shadow-xl">
                <DropdownMenuLabel className="space-y-2 rounded-xl bg-neutral-900 text-white p-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/30 blur-2xl" />
                  <p className="text-sm font-bold text-white relative">
                    Hi, {userData?.fullname || user?.fullname}
                  </p>
                  <p className="text-xs text-neutral-400 relative">
                    {user?.currentRole === "admin"
                      ? "Keep the platform humming."
                      : user?.currentRole === "landlord"
                      ? "Your listings are ready when you are."
                      : "Welcome back to your rental hunt."}
                  </p>
                  <span className="inline-flex rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-900 relative">
                    {user?.currentRole}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile} className="gap-2 cursor-pointer">
                  <FiHome /> Dashboard
                </DropdownMenuItem>
                {user.currentRole !== "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/personal-info")} className="gap-2 cursor-pointer">
                    <CgProfile /> Personal info
                  </DropdownMenuItem>
                )}
                {user.currentRole === "tenant" && (
                  <DropdownMenuItem onClick={() => navigate("/dashboard/saved-properties")} className="gap-2 cursor-pointer">
                    <FiBookmark /> Saved homes
                  </DropdownMenuItem>
                )}
                {user.roles?.includes("landlord") && (
                  <DropdownMenuItem onClick={() => navigate("/landlord/landlord-dashboard")} className="gap-2 cursor-pointer">
                    <FiPlusCircle /> My listings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-600 focus:text-red-700">
                  <FiLogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={() => navigate("/registration/signin")} className="btn-secondary">
              Login / Sign up
            </button>
          )}
        </div>

        <button
          className="lg:hidden grid place-items-center rounded-lg border border-neutral-200 h-10 w-10 text-neutral-700"
          onClick={() => setIsOpen(true)}>
          <RxHamburgerMenu className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-screen w-[300px] bg-white shadow-2xl p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <img src={RentEaseLogo} alt="RentEase" className="h-8" />
              <button onClick={() => setIsOpen(false)}>
                <RxCross2 className="h-6 w-6" />
              </button>
            </div>

            {user && (
              <div
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3 cursor-pointer hover:border-neutral-900"
                onClick={handleProfile}>
                <img
                  src={resolveAvatar(
                    userData?.fullname || user?.fullname,
                    userData?.profileImage || user?.profileImage
                  )}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-400"
                />
                <div>
                  <p className="font-semibold text-sm">{userData?.fullname || user?.fullname}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user.currentRole}</p>
                </div>
              </div>
            )}

            <nav>
              <ul className="space-y-1">
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <li
                      key={index}
                      onClick={() => { navigate(link.path); setIsOpen(false); }}
                      className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold ${
                        isActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                      }`}>
                      {link.text}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-2 pt-4 border-t border-neutral-200">
              {hasBothRoles ? (
                <button onClick={handleSwitchRole} className="btn-secondary w-full">
                  Switch to {user?.currentRole === "tenant" ? "Landlord" : "Tenant"}
                </button>
              ) : (
                !isLandlordRoute && (
                  <button onClick={handlePostPropertyRoute} className="btn-primary w-full">
                    <FiPlusCircle /> Post Property
                  </button>
                )
              )}

              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="btn-danger w-full justify-center">
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { navigate("/registration/signin"); setIsOpen(false); }}
                  className="btn-secondary w-full">
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
