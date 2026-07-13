"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ErrorMessage, SuccessMessage } from "@/components/messages";

export function ValidatedForm({
  action,
  children,
  submitLabel = "Submit"
}: {
  action: string;
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { message?: string };
    setStatus(response.ok ? "success" : "error");
    setMessage(data.message ?? "Something went wrong.");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-md border border-white/10 bg-blackline-graphite p-6">
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
      {status === "error" && <ErrorMessage>{message}</ErrorMessage>}
      {status === "success" && <SuccessMessage>{message}</SuccessMessage>}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : submitLabel}
      </Button>
    </form>
  );
}
