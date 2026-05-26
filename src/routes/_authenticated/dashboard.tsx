import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users as UsersIcon, Wallet, ShieldCheck, Coins,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { api } from "@/services/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function useCount(path: string) {
  return useQuery({
    queryKey: ["count", path],
    queryFn: async () => {
      try {
        const { data } = await api.get(path);
        return Array.isArray(data) ? data.length : data?.length ?? 0;
      } catch { return 0; }
    },
  });
}

function StatCard({
  label, value, icon: Icon, delta, positive,
}: { label: string; value: string | number; icon: any; delta?: string; positive?: boolean }) {
  return (
    <Card className="border shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            {delta && (
              <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {delta}
              </p>
            )}
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const users = useCount("/users");
  const accounts = useCount("/accounts");
  const groups = useCount("/groups");
  const currencies = useCount("/currencies");

  const stats = [
    { label: "Total Users", value: users.data ?? "—", icon: UsersIcon, delta: "+12.4%", positive: true },
    { label: "Active Accounts", value: accounts.data ?? "—", icon: Wallet, delta: "+5.8%", positive: true },
    { label: "Groups", value: groups.data ?? "—", icon: ShieldCheck, delta: "0%", positive: true },
    { label: "Currencies", value: currencies.data ?? "—", icon: Coins, delta: "+2", positive: true },
  ];

  const activities = [
    { who: "Jane Smith", what: "created a new account", when: "2 minutes ago" },
    { who: "Admin", what: "updated group MANAGER permissions", when: "1 hour ago" },
    { who: "John Doe", what: "added currency JPY", when: "3 hours ago" },
    { who: "System", what: "synced exchange rates", when: "Today, 09:14" },
    { who: "Sara Lee", what: "deleted user with id 42", when: "Yesterday" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Here's a snapshot of your wallet operations today."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Latest events across the platform</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <ul className="mt-5 divide-y">
              {activities.map((a, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {a.who.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Quick tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">•</span> Use Groups to bundle permissions and assign them in bulk.</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Account Types let you classify wallets (savings, investment, etc.).</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Add new currencies to support multi-region payouts.</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Audit user activity from the dashboard regularly.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
