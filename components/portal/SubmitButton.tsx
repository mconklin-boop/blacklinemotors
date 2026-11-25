"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { clsx } from "clsx";

export function SubmitButton({
  children,
  pendingText = "Working…",
  variant = "primary",
  className,
  disabled = false,
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-blackline-red text-white hover:bg-red-700",
        variant === "secondary" &&
          "border border-gray-300 bg-white text-blackline-black hover:border-blackline-black",
        variant === "danger" && "border border-blackline-red bg-white text-blackline-red hover:bg-red-50",
        className,
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
