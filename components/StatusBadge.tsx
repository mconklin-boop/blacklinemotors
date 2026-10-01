import { clsx } from "clsx";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit rounded-sm border px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        status === "Available" &&
          "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
        status === "Coming Soon" &&
          "border-sky-400/50 bg-sky-400/10 text-sky-200",
        status === "Pending" &&
          "border-amber-400/50 bg-amber-400/10 text-amber-200",
        !["Available", "Coming Soon", "Pending"].includes(status) &&
          "border-blackline-steel bg-white/5 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}
