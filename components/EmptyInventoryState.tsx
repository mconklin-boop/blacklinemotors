export function EmptyInventoryState() {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-8 text-center">
      <h2 className="text-xl font-black uppercase text-white">No vehicles match these filters.</h2>
      <p className="mt-2 text-blackline-silver">Adjust the filters or request a specific vehicle.</p>
    </div>
  );
}
