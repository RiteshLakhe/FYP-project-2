import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { useState } from "react";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

const ContactUs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    message: "",
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)

    try {
      await Axios.post(API_ENDPOINTS.USER.SEND_MAIL, formData);
      toast.success("Message sent successfull!", {
        autoClose: 1000
      })
      setFormData({fullname: "", email: "", phone: "", message: ""})
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10 mt-10 py-10 px-4 md:px-32">
      <div className="text-center space-y-10">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-sm text-gray-600">
            Fill up the form below with your message and send for any inquiries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
          <input
            type="text"
            name="fullname"
            placeholder="Name"
            value={formData.fullname}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <textarea
            placeholder="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md h-28"></textarea>
          <button type="submit" className={`w-full bg-[#1E293B] text-white px-4 py-3 rounded-md hover:bg-[#1e293be8] cursor-pointer transition duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            {isLoading ? "SENDING...." : "SEND"}
          </button>
        </form> 

        <div className="flex justify-center gap-10 text-sm text-[#1E293B]">
          <div className="flex items-center gap-2">
            <FaPhone /> 03 5432 1234
          </div>
          <div className="flex items-center gap-2">
            <FaEnvelope /> info@marcc.com.au
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
