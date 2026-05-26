import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/common/DataTable";
import { FormModal, Field } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RowActions } from "@/components/common/RowActions";
import { Input } from "@/components/ui/input";
import { useList, useCrudMutations } from "@/hooks/useCrud";

export const Route = createFileRoute("/_authenticated/accounts")({ component: AccountsPage });

interface Account {
  id: number;
  userId: number;
  accountTypeId: number;
  currencyId: number;
  balance: number;
  accountTypeName?: string;
  currencyCode?: string;
}

const schema = z.object({
  userId: z.coerce.number().int().positive(),
  accountTypeId: z.coerce.number().int().positive(),
  currencyId: z.coerce.number().int().positive(),
  balance: z.coerce.number().min(0, "Balance must be positive"),
});
type FormVals = z.infer<typeof schema>;

function AccountsPage() {
  const { data, isLoading } = useList<Account>("accounts", "/accounts");
  const { create, update, remove } = useCrudMutations("accounts", "/accounts");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { userId: 1, accountTypeId: 1, currencyId: 1, balance: 0 },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ userId: 1, accountTypeId: 1, currencyId: 1, balance: 0 });
    setModalOpen(true);
  };

  const openEdit = (a: Account) => {
    setEditing(a);
    form.reset({ userId: a.userId, accountTypeId: a.accountTypeId, currencyId: a.currencyId, balance: a.balance });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (vals) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload: vals });
      else await create.mutateAsync(vals);
      setModalOpen(false);
    } catch { /* toast */ }
  });

  const fmt = (n: number, code?: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: code || "USD" }).format(n);

  return (
    <>
      <DataTable<Account>
        title="Accounts"
        description="All wallets and their current balances."
        data={data}
        loading={isLoading}
        searchKeys={["id", "userId", "accountTypeName", "currencyCode"]}
        onCreate={openCreate}
        createLabel="Add account"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "userId", header: "User ID", render: (r) => <span className="font-medium">#{r.userId}</span> },
          { key: "accountTypeName", header: "Type", render: (r) => (
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium capitalize text-accent-foreground">
              {r.accountTypeName ?? `Type #${r.accountTypeId}`}
            </span>
          )},
          { key: "currencyCode", header: "Currency", render: (r) => r.currencyCode ?? `#${r.currencyId}` },
          { key: "balance", header: "Balance", render: (r) => (
            <span className="font-semibold tabular-nums">{fmt(Number(r.balance ?? 0), r.currencyCode)}</span>
          )},
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit account" : "Add account"}
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
      >
        <Field label="User ID" error={form.formState.errors.userId?.message}>
          <Input type="number" min={1} {...form.register("userId")} />
        </Field>
        <Field label="Account Type ID" error={form.formState.errors.accountTypeId?.message}>
          <Input type="number" min={1} {...form.register("accountTypeId")} />
        </Field>
        <Field label="Currency ID" error={form.formState.errors.currencyId?.message}>
          <Input type="number" min={1} {...form.register("currencyId")} />
        </Field>
        <Field label="Balance" error={form.formState.errors.balance?.message}>
          <Input type="number" step="0.01" min={0} {...form.register("balance")} />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete account?"
        description={deleting ? `Account #${deleting.id} will be permanently deleted.` : undefined}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}
