import Link from "next/link";
import { Card, Flash, Label, PortalFrame, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requestPasswordReset } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <PortalFrame title="Reset your password">
      <div className="mx-auto max-w-md space-y-4">
        <Flash params={params} />
        <Card>
          <form action={requestPasswordReset} className="space-y-4">
            <Label text="Email on your account">
              <input name="email" type="email" autoComplete="email" required className={inputClass} />
            </Label>
            <SubmitButton pendingText="Sending…" className="w-full">
              Email me a reset link
            </SubmitButton>
          </form>
          <Link href="/portal/login" className="mt-4 inline-block text-sm font-semibold underline">
            Back to sign in
          </Link>
        </Card>
      </div>
    </PortalFrame>
  );
}
