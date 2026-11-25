"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const customerLinks = [
  ["Overview", "/portal"],
  ["Payments", "/portal/payments"],
  ["Documents", "/portal/documents"],
  ["Insurance", "/portal/insurance"],
  ["Messages", "/portal/messages"],
  ["Profile", "/portal/profile"],
];

export function PortalNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portal"
      className="flex gap-1 overflow-x-auto border-b border-gray-300 text-sm font-bold"
    >
      {customerLinks.map(([label, href]) => {
        const active = href === "/portal" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "whitespace-nowrap border-b-2 px-3 py-2.5",
              active
                ? "border-blackline-red text-blackline-black"
                : "border-transparent text-gray-500 hover:text-blackline-black",
            )}
          >
            {label}
            {label === "Messages" && unread > 0 && (
              <span className="ml-1.5 rounded-full bg-blackline-red px-1.5 text-xs text-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
