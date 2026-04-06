import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const isSecureContext = window.location.protocol === "https:";

interface VerifyOtpFormData {
  email: string;
  otp: string;
}

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const { setUser, user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<VerifyOtpFormData>({
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
  });

  useEffect(() => {
    if (user) {
      navigate(user.currentRole === "admin" ? "/admin/dashboard" : "/");
    }
  }, [user, navigate]);

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const payload = {
        email: data.email,
        otp: data.otp.replace(/\s/g, ""),
      };

      if (payload.otp.length !== 6) {
        setError("otp", {
          type: "manual",
          message: "OTP must be 6 digits",
        });
        return;
      }

      const response = await Axios.post(API_ENDPOINTS.AUTH.OTP, payload);
      const { message, token, user: userData } = response.data;

      if (!userData?.id) {
        throw new Error("Invalid verification response from server");
      }

      const cookieOptions = {
        secure: isSecureContext,
        sameSite: "Lax" as const,
      };
      Cookies.set("authToken", token, cookieOptions);
      Cookies.set("userId", userData.id, cookieOptions);

      setUser(
        {
          id: userData.id,
          fullname: userData.fullname,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          profileImage: userData.profileImage,
          roles: userData.roles,
          currentRole: userData.currentRole,
        },
        false
      );

      toast.success(message || "Account verified successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Verification failed. Please try again.";
        
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-6">Verify Your Account</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-md"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`w-full p-2 border rounded-md ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email", { required: "Email is required" })}
            readOnly
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <label className="text-sm font-medium mb-1">Enter OTP</label>
          <Controller
            control={control}
            name="otp"
            rules={{
              required: "OTP is required",
              validate: (value) =>
                value.length === 6 || "OTP must be 6 digits",
            }}
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                {...field}
                onChange={(value) => field.onChange(value.replace(/\s/g, ""))}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.otp && (
            <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-md bg-[#38B593] text-white hover:bg-[#2e9a7d] transition-colors ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
