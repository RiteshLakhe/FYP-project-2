"use client";

import { useEffect, useState } from "react";
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
} from "recharts";
import { useUser } from "@/context/UserContext";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router";
import PropertyStatusDropdown from "@/components/PropertyStatusDropdown";

interface Property {
  _id: string;
  title: string;
  category: "Room" | "Appartment" | "Commercial Space";
  price: number;
  status: "Active" | "Inactive" | "Pending" | "Rented";
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        const res = await Axios.get(
          API_ENDPOINTS.PROPERTY.GET_BY_OWNER(user.id)
        );
        setProperties(res.data.properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setError("Failed to load your listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const countByCategory = (category: Property["category"]) =>
    properties.filter((p) => p.category === category).length;

  const chartData = ["Room", "Appartment", "Commercial Space"].map((cat) => {
    const total = properties
      .filter((p) => p.category === cat)
      .reduce((sum, p) => sum + p.price, 0);
    return {
      category: cat,
      totalRent: total,
    };
  });

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
    <div className="px-4 md:px-10 xl:px-40 2xl:px-80 py-16 grow space-y-8">
      <h1 className="text-3xl font-medium">
        Welcome back, {user?.fullname?.split(" ")[0] || "Landlord"}!
      </h1>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              title="Total Rooms Listed"
              value={countByCategory("Room")}
            />
            <InfoCard
              title="Total Apartments Listed"
              value={countByCategory("Appartment")}
            />
            <InfoCard
              title="Total Commercial Spaces Listed"
              value={countByCategory("Commercial Space")}
            />
          </div>

          {/* Bar Chart */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Total Rent by Property Category
            </h2>
            <Card>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="category" />
                    <YAxis
                      domain={[0, maxRent * 1.2]}
                      tickFormatter={(val) => `Rs. ${val}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `Rs. ${value}`,
                        "Total Rent",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalRent"
                      name="Total Rent"
                      fill="#4f46e5"
                      radius={[6, 6, 0, 0]}
                      label={{
                        position: "top",
                        formatter: (v: number) => `Rs. ${v}`,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Listings Table */}
          <div className="space-y-2">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-2">My Listings</h2>
              <button
                className="hidden sm:flex items-center px-4 md:px-6 py-2 md:py-2 rounded-sm gap-2 cursor-pointer bg-[#1E293B] text-white"
                onClick={() => navigate("/landlord/addPropertyForm")}>
                <FiPlusCircle />
                <span className="text-sm md:text-base">Post your property</span>
              </button>
            </div>

            <Card>
              <CardContent className="p-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property._id} className="cursor-pointer">
                        <TableCell>{property.title}</TableCell>
                        <TableCell>
                          <TableCell>
                            <PropertyStatusDropdown
                              propertyId={property._id}
                              currentStatus={property.status}
                              onStatusUpdate={(newStatus) => {
                                setProperties((prev) =>
                                  prev.map((p) =>
                                    p._id === property._id
                                      ? { ...p, status: newStatus as Property["status"] }
                                      : p
                                  )
                                );
                              }}
                            />
                          </TableCell>
                        </TableCell>
                        <TableCell>{property.category}</TableCell>
                        <TableCell>Rs. {property.price}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewProperty(property._id)}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editProperty(property._id)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(property._id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  function viewProperty(id: string) {
    window.location.href = `/landlord/property/${id}`;
  }

  function editProperty(id: string) {
    window.location.href = `/landlord/editPropertyForm/${id}`;
  }
}

const InfoCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-muted-foreground">{title}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </CardContent>
  </Card>
);
