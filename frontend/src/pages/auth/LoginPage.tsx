import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { useAuth } from "../../hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      const response = await login(values);
      navigate(`/${response.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to login");
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <p className="mt-2 text-sm text-slate-500">Access your role-specific coaching workspace.</p>
      </div>
      <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
      <Input label="Password" type="password" error={errors.password?.message} {...register("password", { required: "Password is required" })} />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-brand-600">
          Forgot password?
        </Link>
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Login"}
      </Button>
      <p className="text-xs text-slate-500">Default admin can be seeded with `admin@coachpro.com / Admin@123`.</p>
    </form>
  );
};
