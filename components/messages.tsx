export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100" role="alert">
      {children}
    </p>
  );
}

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-100" role="status">
      {children}
    </p>
  );
}
