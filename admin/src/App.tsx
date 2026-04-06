import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
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

function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7f4ea_0%,#dceee5_45%,#f6fbff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-slate-300/70 bg-white/70 px-4 py-1 text-sm font-medium tracking-wide text-slate-600">
              RentEase Admin Space
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight">
                A calm admin entry point for the RentEase project.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                This page is static on purpose. Use it as a clean home screen while
                your backend, frontend, and admin tools are running locally.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Open Admin Login
              </Link>
              <a
                href="http://localhost:5173"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
              >
                Open Frontend
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Local ports</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Frontend</p>
                  <p>`http://localhost:5173`</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Admin</p>
                  <p>`http://localhost:5174`</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">Backend API</p>
                  <p>`http://localhost:3000`</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
