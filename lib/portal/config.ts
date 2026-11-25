// Portal settings read from environment variables.
// The portal stays switched off (shows a "coming soon" note) until the
// Supabase variables are set in Vercel.

export const portalConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminEmails: (process.env.PORTAL_ADMIN_EMAILS ?? "mike@blacklinemotorsco.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  bucket: "portal",
};

export function portalEnabled() {
  return Boolean(
    portalConfig.supabaseUrl && portalConfig.supabaseAnonKey && portalConfig.serviceRoleKey,
  );
}

export function stripeEnabled() {
  return Boolean(portalConfig.stripeSecretKey && portalConfig.stripeWebhookSecret);
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && portalConfig.adminEmails.includes(email.toLowerCase()));
}

export const ACCESS_COOKIE = "bl_portal_at";
export const REFRESH_COOKIE = "bl_portal_rt";
