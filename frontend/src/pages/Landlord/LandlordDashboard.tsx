"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useUser } from "@/context/UserContext";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { FiPlusCircle, FiTrendingUp, FiHome, FiBriefcase } from "react-icons/fi";
import { useNavigate } from "react-router";
import PropertyStatusDropdown from "@/components/PropertyStatusDropdown";
import type { PropertyStatus } from "@/lib/propertyStatus";

interface Property {
  _id: string;
  title: string;
  category: "Room" | "Appartment" | "Commercial Space";
  price: number;
  status: PropertyStatus;
  imgUrls?: string[];
  address?: string;
  tags?: string[];
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchProperties = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await Axios.get(API_ENDPOINTS.PROPERTY.GET_BY_OWNER(user.id));
      setProperties(res.data.properties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const countByCategory = (category: Property["category"]) =>
    properties.filter((p) => p.category === category).length;

  const activeListings = properties.filter(
    (p) => p.status === "For Rent" || p.status === "For Sale"
  ).length;
  const totalRevenue = properties.reduce((sum, p) => sum + p.price, 0);

  const chartData = ["Room", "Appartment", "Commercial Space"].map((cat) => ({
    category: cat === "Appartment" ? "Apartment" : cat,
    totalRent: properties
      .filter((p) => p.category === cat)
      .reduce((sum, p) => sum + p.price, 0),
  }));

  const maxRent = Math.max(...chartData.map((d) => d.totalRent), 0);

  const handleDelete = async (_id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await Axios.delete(API_ENDPOINTS.PROPERTY.DELETE(_id));
      setProperties((prev) => prev.filter((p) => p._id !== _id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="page-reveal mx-auto max-w-[1440px] px-4 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="eyebrow">Landlord Console</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-1">
            Welcome back, {user?.fullname?.split(" ")[0] || "Landlord"}!
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your listings, update statuses, and track demand.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/landlord/addPropertyForm")}>
          <FiPlusCircle /> Post a new property
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FiHome />}
              accent="bg-blue-50 text-blue-600"
              label="Total listings"
              value={properties.length}
            />
            <StatCard
              icon={<FiTrendingUp />}
              accent="bg-emerald-50 text-emerald-600"
              label="Active listings"
              value={activeListings}
            />
            <StatCard
              icon={<FiBriefcase />}
              accent="bg-amber-50 text-amber-600"
              label="Apartments"
              value={countByCategory("Appartment")}
            />
            <StatCard
              icon={<FiHome />}
              accent="bg-purple-50 text-purple-600"
              label="Total monthly value"
              value={`Rs. ${totalRevenue.toLocaleString("en-IN")}`}
            />
          </div>

          {/* Chart */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Rent value by property category
            </h2>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#475569" }} />
                    <YAxis
                      domain={[0, maxRent * 1.2]}
                      tickFormatter={(v) => `Rs. ${v / 1000}K`}
                      tick={{ fontSize: 12, fill: "#475569" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`Rs. ${value.toLocaleString("en-IN")}`, "Total"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalRent"
                      name="Total rent"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Listings table */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">My listings</h2>
            <Card className="rounded-2xl border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold uppercase text-[11px] tracking-wider text-slate-500">Property</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-wider text-slate-500">Status</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-wider text-slate-500">Category</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-wider text-slate-500">Price</TableHead>
                      <TableHead className="text-right font-bold uppercase text-[11px] tracking-wider text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                          You haven't posted any properties yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((property) => (
                        <TableRow key={property._id} className="hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              {property.imgUrls?.[0] && (
                                <img
                                  src={property.imgUrls[0]}
                                  alt=""
                                  className="h-12 w-16 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="line-clamp-1">{property.title}</p>
                                {property.address && (
                                  <p className="text-xs font-normal text-slate-500 line-clamp-1">{property.address}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <PropertyStatusDropdown
                              propertyId={property._id}
                              currentStatus={property.status}
                              onStatusUpdate={(newStatus) => {
                                setProperties((prev) =>
                                  prev.map((p) =>
                                    p._id === property._id
                                      ? { ...p, status: newStatus as PropertyStatus }
                                      : p
                                  )
                                );
                                fetchProperties();
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">{property.category}</TableCell>
                          <TableCell className="font-semibold text-slate-900">Rs. {property.price.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => (window.location.href = `/property/${property._id}`)}>
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => (window.location.href = `/landlord/editPropertyForm/${property._id}`)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(property._id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

const StatCard = ({
  icon,
  accent,
  label,
  value,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: string | number;
}) => (
  <Card className="rounded-2xl border-slate-200">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${accent} text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </CardContent>
  </Card>
);
