"use client";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-blackline-black">
        Keyword Search
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-gray-200 bg-gray-100 px-4 py-3 text-blackline-black outline-none focus:border-blackline-red"
        placeholder="Search make, model, category, location"
      />
    </label>
  );
}
