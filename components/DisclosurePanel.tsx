export function DisclosurePanel({
  title = "Vehicle Disclosure",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="border-l-4 border-blackline-steel bg-gray-100 p-5">
      <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-blackline-black">
        {title}
      </h2>
      <div className="text-sm leading-6 text-gray-600">{children}</div>
    </aside>
  );
}
