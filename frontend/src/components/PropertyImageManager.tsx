import { useRef, useState } from "react";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiRefreshCw, FiX } from "react-icons/fi";

interface Props {
  propertyId: string;
  images: string[];
  onChange: (images: string[]) => void;
  readOnly?: boolean;
}

const PropertyImageManager = ({ propertyId, images, onChange, readOnly = false }: Props) => {
  const [busy, setBusy] = useState<"add" | "replace" | "delete" | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("images", f));

    try {
      setBusy("add");
      const res = await Axios.post(API_ENDPOINTS.PROPERTY.ADD_IMAGES(propertyId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.imgUrls);
      toast.success(`Added ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add images");
    } finally {
      setBusy(null);
      if (addInputRef.current) addInputRef.current.value = "";
    }
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;
    const formData = new FormData();
    formData.append("images", file);
    formData.append("imageIndex", String(replaceIndex));

    try {
      setBusy("replace");
      const res = await Axios.put(API_ENDPOINTS.PROPERTY.REPLACE_IMAGE(propertyId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.imgUrls);
      toast.success("Image replaced");
    } catch (err) {
      console.error(err);
      toast.error("Failed to replace image");
    } finally {
      setBusy(null);
      setReplaceIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDelete = async (index: number) => {
    if (images.length <= 5) {
      toast.error("At least 5 images required. Add more before deleting.");
      return;
    }
    if (!confirm("Delete this image?")) return;
    try {
      setBusy("delete");
      const res = await Axios.delete(API_ENDPOINTS.PROPERTY.DELETE_IMAGE(propertyId, index));
      onChange(res.data.imgUrls);
      toast.success("Image deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    } finally {
      setBusy(null);
    }
  };

  const triggerReplace = (index: number) => {
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Property images
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {images.length} / minimum 5 required. Click any image to preview, hover for actions.
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            disabled={busy === "add"}
            className="btn-primary !py-2 !px-4 disabled:opacity-60">
            <FiPlus />
            {busy === "add" ? "Uploading..." : "Add images"}
          </button>
        )}
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAdd}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplace}
      />

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center text-slate-500">
          No images yet. Click "Add images" to upload.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img
                src={url}
                alt={`Property ${index + 1}`}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => setPreviewIndex(index)}
              />
              {!readOnly && (
                <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-slate-900/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => triggerReplace(index)}
                    disabled={busy === "replace"}
                    className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-800 hover:bg-white">
                    <FiRefreshCw size={11} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    disabled={busy === "delete" || images.length <= 5}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiTrash2 size={11} /> Delete
                  </button>
                </div>
              )}
              <span className="absolute top-2 left-2 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {previewIndex !== null && images[previewIndex] && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/85 backdrop-blur p-4" onClick={() => setPreviewIndex(null)}>
          <button onClick={() => setPreviewIndex(null)} className="absolute top-6 right-6 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-900">
            <FiX size={20} />
          </button>
          <img
            src={images[previewIndex]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default PropertyImageManager;
