import { useEffect, useState } from "react";
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
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Axios } from "@/services/AxiosInstance";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

interface User {
  _id: string;
  fullname: string;
  profileImage: string;
  phoneNumber: number;
  email: string;
}

const PersonalInfo = () => {
  const { setUser: setContextUser, user: currentUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [editField, setEditField] = useState<keyof User | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);


  const userId = Cookies.get("userId") || "";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await Axios.get(API_ENDPOINTS.USER.GET_USER_BY_ID(userId));
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  const handleImageUpload = async (file: File) => {
    if (!user) return;
  
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
  
      await Axios.put(
        API_ENDPOINTS.USER.UPDATE_USER(user._id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setContextUser(
        {
          id: user._id,
          fullname: user.fullname,
          phoneNumber: user.phoneNumber,
          email: user.email,
          profileImage: previewUrl || user.profileImage,
          roles: currentUser?.roles || ["tenant"],
          currentRole: currentUser?.currentRole || "tenant",
        },
        true
      );
  
      toast.success("Profile Picture Updated!", {
        position: "top-right",
        autoClose: 1000,
        onClose: () => window.location.reload(),
      });
    } catch (error) {
      console.error("Failed to upload image", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsUploading(false);
    }
  };
  
  

  const handleSave = async () => {
    if (user && editField) {
      try {
        const updatedField = {
          [editField]:
            editField === "phoneNumber" ? Number(tempValue) : tempValue,
        };
  
        await Axios.put(
          API_ENDPOINTS.USER.UPDATE_USER(user._id),
          updatedField
        );

        setContextUser(
          {
            id: user._id,
            fullname: editField === "fullname" ? tempValue : user.fullname,
            phoneNumber:
              editField === "phoneNumber" ? Number(tempValue) : user.phoneNumber,
            email: editField === "email" ? tempValue : user.email,
            profileImage: user.profileImage,
            roles: currentUser?.roles || ["tenant"],
            currentRole: currentUser?.currentRole || "tenant",
          },
          true
        );
  
        setEditField(null);
  
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 1000,
          onClose: () => window.location.reload(), 
        });
      } catch (err) {
        console.error("Update failed:", err);
        toast.error("Failed to update profile");
      }
    }
  };
  

  const fields = [
    { label: "Full name", value: user?.fullname, key: "fullname" },
    { label: "Email address", value: user?.email, key: "email" },
    { label: "Phone number", value: user?.phoneNumber, key: "phoneNumber" },
  ];

  return (
    <div className="flex items-center justify-center w-full px-4">
      <div className="flex flex-col items-center w-full max-w-5xl py-20 space-y-10">
        <div className="w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Personal info</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-3xl font-black w-full text-gray-800">Personal info</h1>

        <div className="flex flex-col lg:flex-row items-start w-full gap-30">
          <div className="flex-1 space-y-6 w-full">
            {fields.map(({ label, value, key }) => (
              <Dialog
                key={key}
                open={editField === key}
                onOpenChange={(open) => {
                  if (!open) setEditField(null);
                }}
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{value || "Not provided"}</p>
                  </div>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-blue-600"
                      onClick={() => {
                        setEditField(key as keyof User);
                        setTempValue(String(value || ""));
                      }}
                    >
                      {value ? "Edit" : "Add"}
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent>
                  <DialogTitle>Update {label}</DialogTitle>
                  <DialogDescription>
                    <Input
                      type={key === "phoneNumber" ? "tel" : "text"}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                    />
                  </DialogDescription>
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditField(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-5">
            <img
              src={user?.profileImage || "/default-avatar.png"}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border"
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#1E293B] text-white py-2 px-6">Edit Profile Image</Button>
              </DialogTrigger>
              <DialogContent className="w-80 flex flex-col items-center gap-4">
                <DialogTitle className="mb-4">Edit Profile Image</DialogTitle>
                <DialogDescription className="relative group w-40 h-40">
                  <img
                    src={previewUrl || user?.profileImage || "/default-avatar.png"}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full border"
                  />
                  <span className="absolute inset-0 bg-black bg-opacity-80 rounded-full opacity-0 group-hover:opacity-70 flex items-center justify-center transition-opacity">
                    <label className="text-white cursor-pointer">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </span>
                </DialogDescription>
                <Button
                  onClick={() => {
                    if (selectedFile) {
                      handleImageUpload(selectedFile);
                    }
                  }}
                >
                  {isUploading ? "Uploading..." : "Save"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
