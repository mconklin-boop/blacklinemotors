export function Field({
  label,
  name,
  type = "text",
  required = false,
  options,
  textarea = false
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: string[];
  textarea?: boolean;
}) {
  const base = "w-full rounded-md border border-white/15 bg-blackline-charcoal px-4 py-3 text-white outline-none focus:border-white";
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">
        {label}
        {required ? " *" : ""}
      </span>
      {options ? (
        <select name={name} required={required} className={base}>
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea name={name} required={required} rows={5} className={base} />
      ) : (
        <input name={name} type={type} required={required} className={base} />
      )}
    </label>
  );
}
