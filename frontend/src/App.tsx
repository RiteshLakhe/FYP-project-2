import { BrowserRouter, Route, Routes } from "react-router";
import Signup from "./pages/Registration/Signup";
import Signin from "./pages/Registration/Signin";
import Home from "./pages/Home";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import PostProperty from "./pages/PostProperty";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import VerifyOtp from "./pages/Registration/VerifyOtp";
import Footer from "./components/Footer";
import BrowseProperties from "./pages/BrowseProperties";
import ContactUs from "./pages/ContactUs";
import LandlordDashboard from "./pages/Landlord/LandlordDashboard";
import TenantDashboard from "./pages/Dashboard/TenantDashboard";
import PropertyDetails from "./pages/PropetyDetails";
import EditProperty from "./pages/Landlord/EditProperty";
import AddPropertyForm from "./pages/Landlord/AddPropertyForm";
import PersonalInfo from "./pages/Dashboard/PersonalInfo";
import LoginAndSecurity from "./pages/Dashboard/LoginAndSecurity";
import SavedProperties from "./pages/Dashboard/SavedProperties";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/Registration/ForgotPassword";
import ResetPassword from "./pages/Registration/ResetPassword";
import TermsAndConditions from "./pages/TermsAndCondition";

function App() {
  return (
    <div>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="*"
              element={
                <main>
                  <Navbar />
                  <div className="w-full flex items-center justify-center grow">
                    <div className="w-full grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/postProperty" element={<PostProperty />} />
                        <Route path="/browse-properties" element={<BrowseProperties />} />
                        <Route path="/contact-us" element={<ContactUs />} />
                        <Route path="/property/:id" element={<PropertyDetails />} />  
                        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />  
                        
                        <Route path="/dashboard" element={<TenantDashboard />} />  
                        <Route path="/dashboard/personal-info" element={<PersonalInfo />} />  
                        <Route path="/dashboard/login-and-security" element={<LoginAndSecurity />} />  
                        <Route path="/dashboard/saved-properties" element={<SavedProperties />} />  
                        <Route path="/addPropertyForm" element={<AddPropertyForm />} />  

                        <Route path="/landlord/landlord-dashboard" element={<LandlordDashboard />} />
                        <Route path="/landlord/addPropertyForm" element={<AddPropertyForm/>} />
                        <Route path="/landlord/editPropertyForm/:id" element={<EditProperty />} />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                  <Footer />
                </main>
              }
            />

            <Route path="/registration">
              <Route path="signup" element={<Signup />} />
              <Route path="signin" element={<Signin />} />
              <Route path="otp-verification" element={<VerifyOtp/>} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;