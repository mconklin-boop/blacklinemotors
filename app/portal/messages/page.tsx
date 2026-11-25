import { clsx } from "clsx";
import { CustomerShell } from "@/components/portal/CustomerShell";
import { Card, Flash, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requireCustomer } from "@/lib/portal/session";
import { loadMessages } from "@/lib/portal/data";
import { adminClient } from "@/lib/portal/supabase";
import { site } from "@/lib/site";
import { sendMessage } from "../actions";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { customer } = await requireCustomer();
  const messages = customer ? await loadMessages(customer.id) : [];

  if (customer && messages.some((m) => m.sender === "blackline" && !m.read_by_customer)) {
    await adminClient()
      .from("messages")
      .update({ read_by_customer: true })
      .eq("customer_id", customer.id)
      .eq("sender", "blackline");
  }

  return (
    <CustomerShell customer={customer} title="Messages">
      <Flash params={params} />
      <Card>
        <div className="max-h-[480px] space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-gray-600">
              Questions about your account, a payment date, or your vehicle? Send us a message and
              we&apos;ll reply here. For anything urgent, call or text {site.phoneDisplay}.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "max-w-[85%] rounded-md px-4 py-3 text-sm",
                m.sender === "customer"
                  ? "ml-auto bg-blackline-black text-white"
                  : "bg-gray-100 text-blackline-black",
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <span className="mt-1 block text-xs opacity-60">
                {m.sender === "customer" ? "You" : "Blackline Motors"} ·{" "}
                {new Date(m.created_at).toLocaleString("en-US", {
                  timeZone: "America/Denver",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
        {customer && (
          <form action={sendMessage} className="mt-5 space-y-3 border-t border-gray-200 pt-5">
            <textarea name="body" rows={4} required maxLength={4000} className={inputClass} placeholder="Type your message" />
            <SubmitButton pendingText="Sending…">Send message</SubmitButton>
          </form>
        )}
      </Card>
    </CustomerShell>
  );
}
