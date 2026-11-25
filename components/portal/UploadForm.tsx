"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Uploads the chosen file straight to private storage with a one-time
// signed link, then submits the rest of the form to a server action.
export function UploadForm({
  getUploadUrl,
  onSubmit,
  fileLabel,
  accept = "image/*,application/pdf",
  submitLabel,
  children,
  extraUploadArg,
  fileOptional = false,
}: {
  getUploadUrl: (fileName: string, extra?: string) => Promise<{ path?: string; token?: string; error?: string }>;
  onSubmit: (formData: FormData) => Promise<void>;
  fileLabel: string;
  accept?: string;
  submitLabel: string;
  children?: ReactNode;
  extraUploadArg?: string;
  fileOptional?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const file = form.get("file");
    if (fileOptional && (!(file instanceof File) || file.size === 0)) {
      setBusy(true);
      form.delete("file");
      await onSubmit(form);
      setBusy(false);
      formEl.reset();
      return;
    }
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a file to upload.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That file is over 25 MB. Try a smaller photo or PDF.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Uploads aren't available yet.");
      return;
    }
    setBusy(true);
    const signed = await getUploadUrl(file.name, extraUploadArg);
    if (!signed.path || !signed.token) {
      setBusy(false);
      setError(signed.error ?? "Upload failed. Please try again.");
      return;
    }
    const { error: uploadError } = await supabase.storage
      .from("portal")
      .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || undefined });
    if (uploadError) {
      setBusy(false);
      setError("Upload failed. Please try again.");
      return;
    }
    form.delete("file");
    form.set("storage_path", signed.path);
    await onSubmit(form);
    setBusy(false);
    formEl.reset();
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      {children}
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">{fileLabel}</span>
        <input
          name="file"
          type="file"
          accept={accept}
          required={!fileOptional}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blackline-black file:px-4 file:py-2 file:font-bold file:text-white"
        />
      </label>
      {error && <p className="text-sm font-semibold text-blackline-red">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-blackline-red px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "Uploading…" : submitLabel}
      </button>
    </form>
  );
}
