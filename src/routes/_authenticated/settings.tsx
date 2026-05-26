import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/common/FormModal";
import { useAuth } from "@/context/auth";
import { API_BASE_URL } from "@/services/api";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile and platform preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-base font-semibold">Profile</h3>
            <Field label="Name"><Input defaultValue={user?.name ?? ""} /></Field>
            <Field label="Email"><Input defaultValue={user?.email ?? ""} type="email" /></Field>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card className="border shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-base font-semibold">API</h3>
            <Field label="Base URL"><Input readOnly value={API_BASE_URL} /></Field>
            <p className="text-xs text-muted-foreground">
              Configure via <code className="rounded bg-muted px-1 py-0.5">VITE_API_BASE_URL</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
