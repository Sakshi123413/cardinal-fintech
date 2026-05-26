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

export const Route = createFileRoute("/_authenticated/account-types")({ component: AccountTypesPage });

interface AccountType { id: number; typeName: string }

const schema = z.object({
  typeName: z.string().trim().min(2).max(60),
});
type FormVals = z.infer<typeof schema>;

function AccountTypesPage() {
  const { data, isLoading } = useList<AccountType>("account-types", "/account-types");
  const { create, remove } = useCrudMutations("account-types", "/account-types");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<AccountType | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { typeName: "" },
  });

  return (
    <>
      <DataTable<AccountType>
        title="Account Types"
        description="Classify wallets (savings, investment, business, etc.)."
        data={data}
        loading={isLoading}
        searchKeys={["typeName"]}
        onCreate={() => { form.reset({ typeName: "" }); setModalOpen(true); }}
        createLabel="Add type"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "typeName", header: "Type name", render: (r) => <span className="font-medium capitalize">{r.typeName}</span> },
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add account type"
        onSubmit={form.handleSubmit(async (vals) => {
          try { await create.mutateAsync(vals); setModalOpen(false); } catch { /* toast */ }
        })}
        submitting={create.isPending}
      >
        <Field label="Type name" error={form.formState.errors.typeName?.message}>
          <Input placeholder="investment" {...form.register("typeName")} />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete account type?"
        description={deleting ? `${deleting.typeName} will be removed.` : undefined}
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
