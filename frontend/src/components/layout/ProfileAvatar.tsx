import { Camera } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { AuthResponse } from "../../types";

export const ProfileAvatar = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!user) {
    return null;
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const { data } = await api.post<AuthResponse["user"]>("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      updateUser(data);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const src = user.profilePicture
    ? `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:5000"}${user.profilePicture}`
    : "";

  return (
    <label
      className="group relative block cursor-pointer"
      title={uploading ? "Uploading..." : "Change profile photo"}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-200 shadow-sm transition-transform group-hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800">
        {src ? (
          <img src={src} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md dark:border-slate-900 dark:bg-brand-600">
        <Camera size={14} />
      </div>
      {uploading ? (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-slate-500">
          Uploading...
        </div>
      ) : null}
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </label>
  );
};
