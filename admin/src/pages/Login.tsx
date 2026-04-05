import { useState } from "react";
import { Axios } from "../services/AxiosInstance";
import { API_ENDPOINTS } from "../services/Endpoints";
import { useNavigate } from "react-router-dom"; 
import Cookies from "js-cookie";

interface LoginFormData {
  email: string;
  password: string;
}

export const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); 

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
  
      const { success, user, token } = response.data;
  
      if (success && user.roles === "admin") {

        Cookies.set("token", token, { expires: 7 });
        Cookies.set("userId", user.id);
        
        navigate("/admin/dashboard");
      } else {
        alert("Access denied: Not an admin.");
      }
    } catch (error: any) {
      console.error(error);
      alert("Login failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="w-full flex items-center justify-center h-screen">
      <div className="py-10 px-14 rounded-2xl bg-[#F2F4F7] space-y-6">
        <h1 className="text-center text-gray-500 text-xl font-bold">
          Admin Login
        </h1>
        <form onSubmit={onSubmit} className="space-y-5 w-xs">
          <div className="grid grid-cols-3 items-center">
            <label htmlFor="email" className="text-gray-600">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="border border-gray-400 p-2 rounded-xs outline-none w-full col-span-2 text-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 items-center">
            <label htmlFor="password" className="text-gray-600">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="border border-gray-400 p-2 rounded-xs outline-none w-full col-span-2 text-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#9e9e9e] hover:bg-[#858585] cursor-pointer text-white p-2 rounded-xs"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
