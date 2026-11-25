"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { finishPasswordSetup } from "../actions";

type Tokens = { access_token: string; refresh_token: string };

export function SetPasswordForm() {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (hash.get("error")) {
      setLinkError(
        hash.get("error_code") === "otp_expired"
          ? "This link has expired. Request a new one below."
          : "This link isn't valid anymore. Request a new one below.",
      );
    } else if (access_token && refresh_token) {
      setTokens({ access_token, refresh_token });
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setLinkError("Open this page from the link in your invite or reset email.");
    }
    setReady(true);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !tokens) return setError("The portal isn't set up yet. Please call us.");
    setBusy(true);
    const { error: sessionError } = await supabase.auth.setSession(tokens);
    if (sessionError) {
      setBusy(false);
      return setLinkError("This link has expired. Request a new one below.");
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      return setError(updateError.message || "We couldn't save that password. Try a different one.");
    }
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const result = session
      ? await finishPasswordSetup(session.access_token, session.refresh_token)
      : { ok: false, admin: false };
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = result.ok
      ? result.admin
        ? "/portal/admin"
        : "/portal"
      : "/portal/login?ok=" + encodeURIComponent("Password saved. Sign in with your new password.");
  }

  if (!ready) return <p className="text-sm text-gray-600">Checking your link…</p>;

  if (linkError) {
    return (
      <div className="space-y-3 text-sm">
        <p className="rounded-md border border-blackline-red bg-red-50 px-4 py-3 text-red-800">
          {linkError}
        </p>
        <Link href="/portal/forgot-password" className="font-semibold underline">
          Send me a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">New password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blackline-red"
        />
        <span className="mt-1 block text-xs text-gray-500">At least 10 characters.</span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Confirm password</span>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blackline-red"
        />
      </label>
      {error && <p className="text-sm font-semibold text-blackline-red">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blackline-red px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
