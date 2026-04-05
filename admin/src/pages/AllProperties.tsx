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

export const AllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState<{ _id: string; fullname: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await Axios.get(API_ENDPOINTS.USER.GET_ALL_USERS);
      const propertiesRes = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL);

      setUsers(usersRes.data.users);
      setProperties(propertiesRes.data.properties);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Properties</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.No.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((p: any, index: number) => {
            const owner = users.find((u) => u._id === p.userId);
            return (
              <TableRow key={p._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.area}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{owner?.fullname || "Unknown"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
