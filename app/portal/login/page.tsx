import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Flash, Label, Notice, PortalFrame, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { isAdminEmail, portalEnabled } from "@/lib/portal/config";
import { getUser } from "@/lib/portal/session";
import { site } from "@/lib/site";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getUser();
  if (user) redirect(isAdminEmail(user.email) ? "/portal/admin" : "/portal");

  return (
    <PortalFrame title="Sign in to your account">
      <div className="mx-auto max-w-md space-y-4">
        <Flash params={params} />
        {!portalEnabled() && (
          <Notice tone="warning">
            The customer portal is being set up. Call or text {site.phoneDisplay} for account
            questions.
          </Notice>
        )}
        <Card>
          <form action={signIn} className="space-y-4">
            <Label text="Email">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </Label>
            <Label text="Password">
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </Label>
            <SubmitButton pendingText="Signing in…" className="w-full">
              Sign in
            </SubmitButton>
          </form>
          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
            <Link href="/portal/forgot-password" className="font-semibold underline">
              Forgot password?
            </Link>
            <a href={`mailto:${site.accountsEmail}`} className="text-gray-600 underline">
              Need help? {site.accountsEmail}
            </a>
          </div>
        </Card>
        <p className="text-sm text-gray-600">
          Portal accounts are for current Blackline Motors rent-to-own customers. We send you an
          invite email when your agreement is signed. Not a customer yet?{" "}
          <Link href="/rent-to-own#prequal" className="font-semibold underline">
            Get pre-qualified
          </Link>
          .
        </p>
      </div>
    </PortalFrame>
  );
}
