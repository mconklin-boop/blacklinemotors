export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      {children}
    </p>
  );
}

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800"
      role="status"
    >
      {children}
    </p>
  );
}
