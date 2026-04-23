import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";
import { useAuth } from "../../hooks/useAuth";
import { Course, Role } from "../../types";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: Role;
  specialization?: string;
  teacherFatherName?: string;
  qualification?: string;
  contactNumber?: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  address?: string;
  studentContactNumber?: string;
  gender?: "male" | "female" | "other";
  courseId?: string;
}

const requiredLabel = (label: string) => (
  <>
    {label} <span className="text-rose-500">*</span>
  </>
);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: signUp } = useAuth();
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    defaultValues: { role: "student" },
    shouldUnregister: true
  });
  const role = watch("role");

  useEffect(() => {
    setCoursesLoading(true);
    api
      .get<Course[]>("/auth/courses")
      .then(({ data }) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      const response = await signUp({
        ...values,
        courseId: values.courseId ? Number(values.courseId) : undefined
      });
      navigate(`/${response.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to register");
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="mt-2 text-sm text-slate-500">Register as teacher or student.</p>
      </div>
      <Input label={requiredLabel("Full name")} error={errors.name?.message} {...register("name", { required: "Name is required" })} />
      <Input label={requiredLabel("Email")} type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
      <Input label={requiredLabel("Password")} type="password" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{requiredLabel("Role")}</span>
        <select className="input" {...register("role")}>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </label>
      {role === "teacher" ? (
        <>
          <Input
            label={requiredLabel("Father name")}
            {...register("teacherFatherName", { required: "Father name is required" })}
            error={errors.teacherFatherName?.message}
          />
          <Input
            label={requiredLabel("Qualification")}
            {...register("qualification", { required: "Qualification is required" })}
            error={errors.qualification?.message}
          />
          <Input
            label={requiredLabel("Contact number")}
            {...register("contactNumber", { required: "Contact number is required" })}
            error={errors.contactNumber?.message}
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{requiredLabel("Course enrolled")}</span>
            <select
              className="input"
              {...register("courseId", { required: "Course selection is required" })}
            >
              <option value="">
                {coursesLoading ? "Loading courses..." : "Select course"}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.courseId?.message ? <span className="text-sm text-rose-500">{errors.courseId.message}</span> : null}
          </label>
        </>
      ) : null}
      {role === "student" ? (
        <>
          <Input
            label={requiredLabel("Father name")}
            {...register("fatherName", { required: "Father name is required" })}
            error={errors.fatherName?.message}
          />
          <Input
            label={requiredLabel("Mother name")}
            {...register("motherName", { required: "Mother name is required" })}
            error={errors.motherName?.message}
          />
          <Input
            label={requiredLabel("Date of birth")}
            type="date"
            {...register("dob", { required: "Date of birth is required" })}
            error={errors.dob?.message}
          />
          <Input
            label={requiredLabel("Address")}
            {...register("address", { required: "Address is required" })}
            error={errors.address?.message}
          />
          <Input
            label={requiredLabel("Contact number")}
            {...register("studentContactNumber", { required: "Contact number is required" })}
            error={errors.studentContactNumber?.message}
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{requiredLabel("Gender")}</span>
            <select
              className="input"
              {...register("gender", { required: "Gender is required" })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender?.message ? <span className="text-sm text-rose-500">{errors.gender.message}</span> : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{requiredLabel("Course enrolled")}</span>
            <select
              className="input"
              {...register("courseId", { required: "Course selection is required" })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.courseId?.message ? <span className="text-sm text-rose-500">{errors.courseId.message}</span> : null}
          </label>
        </>
      ) : null}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
};
