// ResetPassword.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await Axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token!), {
        password,
      });
      toast.success(res.data.message);
      navigate("/registration/signin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Link expired or invalid");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-[10px] text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
         <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className="w-full p-2 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        /> 
        <button
            type="button"
            className="absolute right-2 top-[10px] text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#1E293B] text-white py-2 rounded hover:bg-[#1e293bf3]">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
