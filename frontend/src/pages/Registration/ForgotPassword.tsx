import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Axios } from '@/services/AxiosInstance';
import { API_ENDPOINTS } from '@/services/Endpoints';

const ForgotPassword = () => {
  const [ isLoading, setIsLoading ] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      const res = await Axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD , { email });
      toast.success(res.data.message);
    }
    catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-[#1E293B] text-white py-2 rounded hover:bg-[#1e293bf8] cursor-pointer"
        >
          {isLoading ? 'Sending' : 'Send Reset Link'}
          
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
