import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => (
  <button
    className={clsx(
      variant === "primary" ? "btn-primary" : "btn-secondary",
      props.disabled && "cursor-not-allowed opacity-70",
      className
    )}
    {...props}
  />
);
