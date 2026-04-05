import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Axios } from "@/services/AxiosInstance";

const LoginAndSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = Cookies.get("userId") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      await Axios.put(API_ENDPOINTS.USER.UPDATE_USER(userId), {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        onClose: () => {
          setIsDialogOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      });
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4 pb-14">
      <div className="flex flex-col items-center w-full max-w-5xl py-20 space-y-10">
        <div className="w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Login & security</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-3xl font-black w-full text-gray-800">Login & security</h1>

        <div className="w-full">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="flex justify-between items-center border-b pb-4 ">
              <div className="space-y-1">
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Change your account password</p>
              </div>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>Update</Button>
              </DialogTrigger>
            </div>

            <DialogContent>
              <DialogTitle>Update Password</DialogTitle>
              <DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default LoginAndSecurity;
