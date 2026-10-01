export function formatCurrency(value?: number) {
  if (typeof value !== "number") return "Request Pricing";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatMiles(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} mi`;
}

