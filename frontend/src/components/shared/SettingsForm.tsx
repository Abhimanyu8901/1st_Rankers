import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { AuthUser, Course, Role } from "../../types";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";

interface SettingsFormState {
  name: string;
  email: string;
  password: string;
  teacherFatherName: string;
  qualification: string;
  contactNumber: string;
  fatherName: string;
  motherName: string;
  dob: string;
  address: string;
  studentContactNumber: string;
  gender: string;
  courseId: string;
}

const buildInitialState = (user: AuthUser | null): SettingsFormState => ({
  name: user?.name || "",
  email: user?.email || "",
  password: "",
  teacherFatherName: String((user?.profile as any)?.fatherName || ""),
  qualification: String((user?.profile as any)?.qualification || ""),
  contactNumber: String((user?.profile as any)?.contactNumber || ""),
  fatherName: String((user?.profile as any)?.fatherName || ""),
  motherName: String((user?.profile as any)?.motherName || ""),
  dob: String((user?.profile as any)?.dob || ""),
  address: String((user?.profile as any)?.address || ""),
  studentContactNumber: String((user?.profile as any)?.contactNumber || ""),
  gender: String((user?.profile as any)?.gender || ""),
  courseId: String((user?.profile as any)?.courseId || "")
});

export const SettingsForm = ({ role }: { role: Role }) => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<SettingsFormState>(buildInitialState(user));
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildInitialState(user));
  }, [user]);

  useEffect(() => {
    if (role === "student") {
      api.get<Course[]>("/auth/courses").then(({ data }) => setCourses(data)).catch(() => setCourses([]));
    }
  }, [role]);

  const submit = async () => {
    try {
      setError("");
      setMessage("");
      const payload: Record<string, unknown> = {
        name: form.name
      };

      if (role === "admin") {
        payload.email = form.email;
      }

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (role === "teacher") {
        payload.teacherFatherName = form.teacherFatherName;
        payload.qualification = form.qualification;
        payload.contactNumber = form.contactNumber;
      }

      if (role === "student") {
        payload.fatherName = form.fatherName;
        payload.motherName = form.motherName;
        payload.dob = form.dob;
        payload.address = form.address;
        payload.studentContactNumber = form.studentContactNumber;
        payload.gender = form.gender;
        payload.courseId = form.courseId ? Number(form.courseId) : null;
      }

      const { data } = await api.put<AuthUser>("/auth/profile", payload);
      updateUser(data);
      setForm((current) => ({ ...current, password: "" }));
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update profile");
    }
  };

  return (
    <Card title="Settings" subtitle="Update your profile details and account information">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {role === "admin" ? (
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
            Profile picture can be changed from the avatar section in the top header.
          </div>
        )}
        <Input label="New password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {role === "admin" ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
            Profile picture can be changed from the avatar section in the top header.
          </div>
        ) : null}
        {role === "teacher" ? (
          <>
            <Input label="Father name" value={form.teacherFatherName} onChange={(e) => setForm({ ...form, teacherFatherName: e.target.value })} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            <Input label="Contact number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </>
        ) : null}
        {role === "student" ? (
          <>
            <Input label="Father name" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
            <Input label="Mother name" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
            <Input label="Date of birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input label="Contact number" value={form.studentContactNumber} onChange={(e) => setForm({ ...form, studentContactNumber: e.target.value })} />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Gender</span>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </>
        ) : null}
      </div>
      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
      <div className="mt-4">
        <Button onClick={submit}>Save settings</Button>
      </div>
    </Card>
  );
};
