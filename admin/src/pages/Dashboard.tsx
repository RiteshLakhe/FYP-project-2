import { useEffect, useState } from "react";
import { Axios } from "../services/AxiosInstance";
import { API_ENDPOINTS } from "../services/Endpoints";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsersAndProperties = async () => {
      try {
        const [usersRes, propertiesRes] = await Promise.all([
          Axios.get(API_ENDPOINTS.USER.GET_ALL_USERS),
          Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL),
        ]);

        const allUsers = usersRes.data.users || [];
        const allProperties = propertiesRes.data.properties || [];

        const landlordsOnly = allUsers.filter((user: any) =>
          Array.isArray(user.roles)
            ? user.roles.includes("landlord")
            : user.roles === "landlord"
        );

        // Attach property count to each landlord
        const landlordsWithCounts = landlordsOnly.map((landlord: any) => {
          const count = allProperties.filter(
            (property: any) => property.userId === landlord._id
          ).length;
          return { ...landlord, propertyCount: count };
        });

        setLandlords(landlordsWithCounts);
        setProperties(allProperties);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndProperties();
  }, []);


  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-10 w-full">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <section className="mb-10 w-full">
        <h3 className="text-xl font-semibold mb-3">Landlords</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. of Properties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landlords.slice(0, 5).map((user: any, index: number) => {
              const userProperties = properties.filter(
                (p) => p.userId === user._id
              );
              return (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/landlord/${user._id}`}
                      className="text-blue-600 underline">
                      {user.fullname}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{userProperties.length}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="text-right mt-2">
          <Link
            to="/admin/allLandlords"
            className="text-sm text-blue-600 hover:underline">
            See all landlords →
          </Link>
        </div>
      </section>

      {/* PROPERTIES SECTION */}
      <section>
        <h3 className="text-xl font-semibold mb-3">All Properties</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.slice(0, 5).map((property: any, index: number) => {
              const owner = landlords.find((l) => l._id === property.userId);
              return (
                <TableRow key={property._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/property/${property._id}`}
                      className="text-blue-600 underline">
                      {property.title}
                    </Link>
                  </TableCell>
                  <TableCell>{property.category}</TableCell>
                  <TableCell>{property.area}</TableCell>
                  <TableCell>{owner ? owner.fullname : "Unknown"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="text-right mt-2">
          <Link
            to="/admin/allProperties"
            className="text-sm text-blue-600 hover:underline">
            See all properties →
          </Link>
        </div>
      </section>
    </div>
  );
};
