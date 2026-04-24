import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import RegistrationBG from "../../assets/RegistrationBG.jpg";
import Logo from "../../assets/RentEase.svg";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff } from "lucide-react";

interface SignupFormData {
  fullname: string;
  phoneNumber: string;
  profileImage: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const Signup = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<SignupFormData>();

  const passwordValue = watch("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string;
  }>({ score: 0, feedback: "" });

  useEffect(() => {
    if (passwordValue) {
      const result = zxcvbn(passwordValue);
      setPasswordStrength({
        score: result.score,
        feedback:
          result.score < 2 ? "Weak" : result.score === 2 ? "Medium" : "Strong",
      });
    } else {
      setPasswordStrength({ score: 0, feedback: "" });
    }
  }, [passwordValue]);


  useEffect(() => {
    return () => reset();
  }, [reset]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await Axios.post(API_ENDPOINTS.AUTH.REGISTER, {
        fullname: data.fullname,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
        profileImage: data.profileImage,
      });

      const { message } = response.data;

      toast.success(message || "Registration successful! Verify your OTP.", {
        position: "top-right",
        autoClose: 3000,
      });

      navigate(
        `/registration/otp-verification?email=${encodeURIComponent(
          data.email
        )}&mode=signup`
      );
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data.message || "Registration failed. Please try again.",
        { position: "top-right" }
      );
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) || "Please enter a valid email address";
  };

  const validatePasswordMatch = (value: string) => {
    return value === watch("password") || "Passwords do not match";
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg space-y-8">
          <div className="w-40 cursor-pointer" onClick={() => navigate("/")}>
            <img src={Logo} alt="RentEase Logo" className="w-full" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                Get Started Now!
              </h1>
              <p className="text-gray-600">
                Create your account to access all features
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-6 w-full">
                <div className="w-1/2">
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    className={`w-full p-2 border rounded-md ${
                      errors.fullname ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    {...register("fullname", {
                      required: "Full name is required",
                      minLength: {
                        value: 3,
                        message: "Full name must be at least 3 characters",
                      },
                    })}
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullname.message}
                    </p>
                  )}
                </div>

                <div className="w-1/2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your phone number"
                    {...register("phoneNumber", {
                      required: "Phone Number is required",
                      maxLength: {
                        value: 10,
                        message: "Phone number must be in 10 numbers",
                      },
                    })}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1">
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium">
                  Password
                </label>
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
                  className="absolute right-2 top-[38px] text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                {passwordValue && passwordValue.length < 6 && (
                  <p className="text-red-500 text-xs mt-1">
                    Password must be at least 6 characters
                  </p>
                )}

                {passwordValue && passwordValue.length >= 6 && (
                  <div className="mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        passwordStrength.score === 0
                          ? "bg-gray-300"
                          : passwordStrength.score === 1
                          ? "bg-red-500"
                          : passwordStrength.score === 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Strength: {passwordStrength.feedback}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full p-2 border rounded-md ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: validatePasswordMatch,
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-[38px] text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    className="h-4 w-4 text-[#38B593] focus:ring-[#38B593] border-gray-300 rounded"
                    {...register("acceptTerms", {
                      required: "You must accept the terms and policy",
                    })}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="font-medium">
                    I accept the{" "}
                    <a
                      href="/terms-and-conditions"
                      className="text-[#38B593] hover:underline">
                      Terms & Conditions
                    </a>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.acceptTerms.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md bg-[#38B593] text-white hover:bg-[#2e9a7d] transition-colors ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}>
                {isSubmitting ? "Registering..." : "Sign Up"}
              </button>
            </form>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <a
                href="/registration/signin"
                className="text-[#38B593] hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 h-64 md:h-auto">
        <img
          src={RegistrationBG}
          alt="Background"
          className="w-full h-full object-cover md:rounded-tl-4xl md:rounded-bl-4xl"
        />
      </div>
    </div>
  );
};

export default Signup;
