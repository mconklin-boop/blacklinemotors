import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";

export const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-blackline-black outline-none focus:border-blackline-red";

export function PortalFrame({
  title,
  eyebrow = "Customer portal",
  nav,
  actions,
  children,
}: {
  title: string;
  eyebrow?: string;
  nav?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-h-[70vh] bg-[#f7f7f6] px-4 py-10 text-blackline-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-500">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          </div>
          {actions}
        </div>
        {nav}
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </section>
  );
}

export function Card({
  title,
  children,
  className,
  aside,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={clsx("rounded-md border border-gray-200 bg-white p-5 shadow-sm", className)}>
      {(title || aside) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "alert" | "good";
}) {
  return (
    <div
      className={clsx(
        "rounded-md border bg-white p-5",
        tone === "alert" && "border-blackline-red",
        tone === "good" && "border-green-600",
        tone === "default" && "border-gray-200",
      )}
    >
      <span className="block text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <span
        className={clsx(
          "mt-1 block text-2xl font-bold",
          tone === "alert" && "text-blackline-red",
          tone === "good" && "text-green-700",
        )}
      >
        {value}
      </span>
      {hint && <div className="mt-1 text-sm text-gray-600">{hint}</div>}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "rounded-md border px-4 py-3 text-sm",
        tone === "info" && "border-gray-300 bg-white text-gray-700",
        tone === "success" && "border-green-600 bg-green-50 text-green-800",
        tone === "error" && "border-blackline-red bg-red-50 text-red-800",
        tone === "warning" && "border-amber-500 bg-amber-50 text-amber-900",
      )}
    >
      {children}
    </div>
  );
}

export function Label({
  text,
  children,
  hint,
}: {
  text: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{text}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition",
        variant === "primary"
          ? "bg-blackline-red text-white hover:bg-red-700"
          : "border border-gray-300 bg-white text-blackline-black hover:border-blackline-black",
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "good" | "alert" | "warn";
}) {
  return (
    <span
      className={clsx(
        "inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        tone === "default" && "bg-gray-100 text-gray-700",
        tone === "good" && "bg-green-100 text-green-800",
        tone === "alert" && "bg-red-100 text-red-800",
        tone === "warn" && "bg-amber-100 text-amber-900",
      )}
    >
      {children}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
            {head.map((h) => (
              <th key={h} className="px-2 py-2 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Flash({ params }: { params: Record<string, string | string[] | undefined> }) {
  const ok = typeof params.ok === "string" ? params.ok : undefined;
  const err = typeof params.error === "string" ? params.error : undefined;
  if (!ok && !err) return null;
  return <Notice tone={err ? "error" : "success"}>{err ?? ok}</Notice>;
}
