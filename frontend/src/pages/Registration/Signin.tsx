import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import RegistrationBG from "../../assets/RegistrationBG.jpg";
import Logo from "../../assets/RentEase.svg";
import { useUser } from "@/context/UserContext";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";

const isSecureContext = window.location.protocol === "https:";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Signin = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  useEffect(() => {
    if (user) {
      if (user.currentRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await Axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      const { success, user, token, requiresTwoStepVerification } = response.data;

      if (requiresTwoStepVerification) {
        toast.success("Verification code sent to your email.", {
          position: "top-right",
          autoClose: 2000,
        });

        navigate(
          `/registration/otp-verification?email=${encodeURIComponent(
            data.email
          )}&mode=login&rememberMe=${data.rememberMe ? "true" : "false"}`
        );
        return;
      }

      if (success && user && token) {
        const {
          id,
          fullname,
          phoneNumber,
          email,
          roles,
          profileImage,
          currentRole,
        } = user;

        const cookieOptions = {
          expires: data.rememberMe ? 7 : undefined,
          secure: isSecureContext,
          sameSite: "Lax" as const,
        };
        Cookies.set("authToken", token, cookieOptions);
        Cookies.set("userId", id, cookieOptions);

        setUser(
          {
            id,
            fullname,
            phoneNumber,
            email,
            profileImage,
            roles,
            currentRole,
          },
          data.rememberMe
        );

        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          if (currentRole === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 3000);
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data.message || "Login failed. Please try again.",
        { position: "top-right" }
      );
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) || "Please enter a valid email address";
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="md:w-1/2 h-64 md:h-auto hidden lg:block">
        <img
          src={RegistrationBG}
          alt="Background"
          className="w-full h-full object-cover md:rounded-tr-4xl md:rounded-br-4xl"
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="w-40 cursor-pointer" onClick={() => navigate("/")}>
            <img src={Logo} alt="RentEase Logo" className="w-full" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full p-2 border rounded-md ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    validate: validateEmail,
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <a
                    href="/registration/forgot-password"
                    className="text-xs text-[#38B593] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full p-2 border rounded-md pr-10 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-[36px] text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-[#38B593] focus:ring-[#38B593] border-gray-300 rounded"
                  {...register("rememberMe")}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md bg-[#38B593] text-white hover:bg-[#2e9a7d] transition-colors ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <a href="/registration/signup" className="text-[#38B593] hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
