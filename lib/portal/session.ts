import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  isAdminEmail,
  portalEnabled,
} from "./config";
import { adminClient } from "./supabase";
import type { Customer } from "./types";

const secure = process.env.NODE_ENV === "production";

export async function setSessionCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, expiresIn),
  });
  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

// Returns the signed-in user, checked against Supabase on every request.
// Token refresh happens in middleware.ts before the page runs.
export async function getUser(): Promise<User | null> {
  if (!portalEnabled()) return null;
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/portal/login");
  if (!isAdminEmail(user.email)) redirect("/portal");
  return user;
}

export async function requireCustomer(): Promise<{ user: User; customer: Customer | null }> {
  const user = await getUser();
  if (!user) redirect("/portal/login");
  if (isAdminEmail(user.email)) redirect("/portal/admin");
  const { data } = await adminClient()
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return { user, customer: (data as Customer | null) ?? null };
}
