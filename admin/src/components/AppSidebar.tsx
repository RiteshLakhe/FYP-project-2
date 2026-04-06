import { Calendar, ChevronUp, Home, Inbox, User2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Landlords",
    url: "/admin/allLandlords",
    icon: Inbox,
  },
  {
    title: "Properties",
    url: "/admin/allProperties",
    icon: Calendar,
  },
];

interface Admin {
  fullname: string;
  email: string;
}

export function AppSidebar() {

  const [adminData, setAdminData] = useState<Admin | null>()
  const navigate = useNavigate();
    
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await Axios.get(API_ENDPOINTS.ADMIN.GET_ADMIN);
        setAdminData(response.data.message);
      } catch (error) {
        console.error(error);
      }
    }

    fetchAdmin();
  }, [])

  const handleSignOut = async () => {
    Cookies.remove("userId");
    Cookies.remove("authToken");
    
    navigate("/");
  }

  return (
    <Sidebar>
        <SidebarHeader>
            <h1 className="pl-2 font-medium">RentEase</h1>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {adminData?.fullname}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="bg-[#e9e9e9] p-1">
                <DropdownMenuItem className="w-56 p-2 " onClick={handleSignOut}>
                  <span className="w-full">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
