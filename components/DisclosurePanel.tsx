export function DisclosurePanel({ title = "Vehicle Disclosure", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="border-l-4 border-blackline-steel bg-white/[0.04] p-5">
      <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-white">{title}</h2>
      <div className="text-sm leading-6 text-blackline-silver">{children}</div>
    </aside>
  );
}
