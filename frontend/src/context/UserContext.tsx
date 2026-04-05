import { createContext, useContext, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";

interface User {
  id: string;
  fullname: string;
  phoneNumber: number;
  email: string;
  profileImage: string;
  roles: string[];
  currentRole: "tenant" | "landlord" | "admin";
}

interface UserContextType {
  user: User | null;
  setUser: (userData: User, rememberMe?: boolean) => void;
  clearUser: () => Promise<void>;
  switchRole: (role: "tenant" | "landlord") => Promise<User>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  clearUser: async () => {},
  switchRole: async () => {
    throw new Error("switchRole function is not implemented");
  },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);

      if (!parsedUser.currentRole && parsedUser.roles.includes("tenant")) {
        parsedUser.currentRole = "tenant";
      }
      return parsedUser;
    }
    return null;
  });

  const setUser = useCallback((userData: User, rememberMe = false) => {
    const defaultRole = userData.roles.includes("tenant")
      ? "tenant"
      : userData.roles[0];
    const updatedUser = {
      ...userData,
      currentRole: userData.currentRole || defaultRole,
    };

    const cookieOptions = {
      expires: rememberMe ? 7 : undefined,
      secure: true,
      sameSite: "Lax" as const,
    };

    Cookies.set("user", JSON.stringify(updatedUser), cookieOptions);
    Cookies.set("userId", updatedUser.id, cookieOptions);
    Cookies.set("currentRole", updatedUser.currentRole, cookieOptions);

    setUserState(updatedUser);
  }, []);

  const switchRole = useCallback(
    async (role: "tenant" | "landlord"): Promise<User> => {
      if (user && user.roles.includes(role)) {
        try {
          const res = await Axios.post(API_ENDPOINTS.USER.SWITCH_ROLE, {
            newRole: role,
          });
          const updatedUser: User = {
            ...user,
            currentRole: res.data.currentRole,
            roles: res.data.roles,
          };
          setUser(updatedUser);
          Cookies.set("currentRole", res.data.currentRole);
          return updatedUser;
        } catch (error) {
          throw new Error(`Failed to switch role. ${error}`);
        }
      } else {
        throw new Error("You don't have permission for this role.");
      }
    },
    [user, setUser]
  );

  const clearUser = useCallback(async () => {
    Cookies.remove("user");
    Cookies.remove("authToken");
    Cookies.remove("userId");
    Cookies.remove("currentRole");
    setUserState(null);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
