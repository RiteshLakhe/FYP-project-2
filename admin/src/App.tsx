import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AllLandlords } from "./pages/AllLandlords";
import { AllProperties } from "./pages/AllProperties";

function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="allLandlords" element={<AllLandlords />} />
          <Route path="allProperties" element={<AllProperties />} />
        </Routes>
      </main>
    </SidebarProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
