"use client";

import type { ReactNode } from "react";

export function FilterControls({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-blackline-black">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-3 text-blackline-black outline-none focus:border-blackline-red"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
