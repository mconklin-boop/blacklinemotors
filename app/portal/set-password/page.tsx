import { Card, PortalFrame } from "@/components/portal/ui";
import { SetPasswordForm } from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <PortalFrame title="Create your password">
      <div className="mx-auto max-w-md">
        <Card>
          <SetPasswordForm />
        </Card>
      </div>
    </PortalFrame>
  );
}
