import Link from "next/link";
import { CustomerShell } from "@/components/portal/CustomerShell";
import { Card, Flash, Label, Notice, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requireCustomer } from "@/lib/portal/session";
import { site } from "@/lib/site";
import { updateProfile } from "../actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { customer } = await requireCustomer();

  return (
    <CustomerShell customer={customer} title="Profile">
      <Flash params={params} />
      {!customer ? (
        <Notice tone="warning">Your account isn&apos;t set up yet. Call {site.phoneDisplay}.</Notice>
      ) : (
        <>
          <Card title="Contact info">
            <p className="mb-4 text-sm text-gray-600">
              Keep your phone and address current so we can always reach you. Saving changes here
              notifies us.
            </p>
            <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
              <Label text="Name">
                <input defaultValue={customer.full_name} disabled className={`${inputClass} bg-gray-100`} />
              </Label>
              <Label text="Email" hint="To change your sign-in email, message us.">
                <input defaultValue={customer.email} disabled className={`${inputClass} bg-gray-100`} />
              </Label>
              <Label text="Phone">
                <input name="phone" type="tel" defaultValue={customer.phone ?? ""} required className={inputClass} />
              </Label>
              <span className="hidden sm:block" />
              <Label text="Street address">
                <input name="address_line1" defaultValue={customer.address_line1 ?? ""} required className={inputClass} />
              </Label>
              <Label text="Apt / unit">
                <input name="address_line2" defaultValue={customer.address_line2 ?? ""} className={inputClass} />
              </Label>
              <Label text="City">
                <input name="city" defaultValue={customer.city ?? ""} required className={inputClass} />
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Label text="State">
                  <input name="state" maxLength={2} defaultValue={customer.state ?? "CO"} required className={inputClass} />
                </Label>
                <Label text="ZIP">
                  <input name="zip" inputMode="numeric" defaultValue={customer.zip ?? ""} required className={inputClass} />
                </Label>
              </div>
              <div className="sm:col-span-2">
                <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
              </div>
            </form>
          </Card>
          <Card title="Password">
            <p className="text-sm text-gray-600">
              To change your password, sign out and use{" "}
              <Link href="/portal/forgot-password" className="font-semibold underline">
                Forgot password
              </Link>
              . We&apos;ll email you a link to set a new one.
            </p>
          </Card>
        </>
      )}
    </CustomerShell>
  );
}
