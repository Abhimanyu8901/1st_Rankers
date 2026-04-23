import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../../api/client";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";

interface RequestOtpForm {
  email: string;
}

interface ResetPasswordForm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const requestForm = useForm<RequestOtpForm>();
  const resetForm = useForm<ResetPasswordForm>();

  const requestOtp = requestForm.handleSubmit(async (values) => {
    try {
      setError("");
      const { data } = await api.post<{ message: string }>("/auth/forgot-password", values);
      setEmail(values.email);
      setStatus(data.message);
      setStep("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to send OTP");
    }
  });

  const resetPassword = resetForm.handleSubmit(async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      const { data } = await api.post<{ message: string }>("/auth/reset-password", {
        email,
        otp: values.otp,
        newPassword: values.newPassword
      });
      setStatus(data.message);
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to reset password");
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Forgot password</h2>
        <p className="mt-2 text-sm text-slate-500">
          Receive an OTP by email and use it to set a new password.
        </p>
      </div>

      {step === "request" ? (
        <form className="space-y-4" onSubmit={requestOtp}>
          <Input
            label="Email"
            type="email"
            error={requestForm.formState.errors.email?.message}
            {...requestForm.register("email", { required: "Email is required" })}
          />
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
          <Button type="submit" disabled={requestForm.formState.isSubmitting} className="w-full">
            {requestForm.formState.isSubmitting ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={resetPassword}>
          <Input label="Email" value={email} readOnly />
          <Input
            label="OTP"
            error={resetForm.formState.errors.otp?.message}
            {...resetForm.register("otp", { required: "OTP is required" })}
          />
          <Input
            label="New password"
            type="password"
            error={resetForm.formState.errors.newPassword?.message}
            {...resetForm.register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "Minimum 6 characters" }
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register("confirmPassword", { required: "Please confirm the password" })}
          />
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
          <div className="flex gap-3">
            <Button type="submit" disabled={resetForm.formState.isSubmitting} className="flex-1">
              {resetForm.formState.isSubmitting ? "Updating..." : "Reset password"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setStep("request")}>
              Resend OTP
            </Button>
          </div>
        </form>
      )}

      <p className="text-sm text-slate-500">
        <Link to="/login" className="text-brand-600">
          Back to login
        </Link>
      </p>
    </div>
  );
};
