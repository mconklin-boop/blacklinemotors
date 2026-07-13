"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">Keyword Search</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/15 bg-blackline-charcoal px-4 py-3 text-white outline-none focus:border-white"
        placeholder="Search make, model, category, location"
      />
    </label>
  );
}
