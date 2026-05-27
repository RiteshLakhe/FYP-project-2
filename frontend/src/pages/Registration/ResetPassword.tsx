import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AxiosError } from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset link is missing a token.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await Axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token), {
        password,
      });
      toast.success(res.data.message || "Password updated.");
      navigate("/registration/signin");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Link expired or invalid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#38B593]/10 text-[#1A623A]">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Choose a new password</h2>
            <p className="text-sm text-gray-500">
              Use something memorable, but not obvious.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className="w-full rounded-md border p-3 pr-10 outline-none focus:border-[#38B593] focus:ring-2 focus:ring-[#38B593]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="w-full rounded-md border p-3 pr-10 outline-none focus:border-[#38B593] focus:ring-2 focus:ring-[#38B593]/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#1E293B] py-3 font-medium text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link
          to="/registration/signin"
          className="mt-5 block text-center text-sm text-[#38B593] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
