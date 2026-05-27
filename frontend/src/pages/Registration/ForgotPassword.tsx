import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { AxiosError } from "axios";
import { MailCheck } from "lucide-react";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [devResetLink, setDevResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDevResetLink("");

    try {
      const res = await Axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.trim(),
      });
      setDevResetLink(res.data.devResetLink || "");
      toast.success(res.data.message || "Password reset link sent.");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#38B593]/10 text-[#1A623A]">
            <MailCheck size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Reset password</h2>
            <p className="text-sm text-gray-500">
              We will send a secure reset link to your email.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-md border p-3 outline-none focus:border-[#38B593] focus:ring-2 focus:ring-[#38B593]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[#1E293B] py-3 font-medium text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {devResetLink ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Email is not configured. Use this development reset link:
            <a className="mt-2 block break-all font-medium underline" href={devResetLink}>
              {devResetLink}
            </a>
          </div>
        ) : null}

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

export default ForgotPassword;
