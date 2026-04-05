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

export const AllLandlords = () => {
  const [landlords, setLandlords] = useState([]);
  const [properties, setProperties] = useState<{ userId: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await Axios.get(API_ENDPOINTS.USER.GET_ALL_USERS);
      const propertiesRes = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL);

      const allUsers = usersRes.data.users;
      const allProperties = propertiesRes.data.properties;

      const landlordsOnly = allUsers.filter((user: any) =>
        Array.isArray(user.roles)
          ? user.roles.includes("landlord")
          : user.roles === "landlord"
      );

      setLandlords(landlordsOnly);
      setProperties(allProperties);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Landlords</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>No. of Properties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {landlords.map((user: any, index: number) => {
            const count = properties.filter((p) => p.userId === user._id).length;
            return (
              <TableRow key={user._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.fullname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
