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

export const Route = createFileRoute("/_authenticated/currencies")({ component: CurrenciesPage });

interface Currency { id: number; currencyCode: string; currencyName: string }

const schema = z.object({
  currencyCode: z.string().trim().length(3, "3-letter ISO code").regex(/^[A-Z]+$/, "Uppercase letters only"),
  currencyName: z.string().trim().min(2).max(60),
});
type FormVals = z.infer<typeof schema>;

function CurrenciesPage() {
  const { data, isLoading } = useList<Currency>("currencies", "/currencies");
  const { create, remove } = useCrudMutations("currencies", "/currencies");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Currency | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { currencyCode: "", currencyName: "" },
  });

  return (
    <>
      <DataTable<Currency>
        title="Currencies"
        description="Supported currencies for accounts and transactions."
        data={data}
        loading={isLoading}
        searchKeys={["currencyCode", "currencyName"]}
        onCreate={() => { form.reset({ currencyCode: "", currencyName: "" }); setModalOpen(true); }}
        createLabel="Add currency"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "currencyCode", header: "Code", render: (r) => (
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
              {r.currencyCode}
            </span>
          )},
          { key: "currencyName", header: "Name", render: (r) => <span className="font-medium">{r.currencyName}</span> },
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add currency"
        onSubmit={form.handleSubmit(async (vals) => {
          try {
            await create.mutateAsync({ ...vals, currencyCode: vals.currencyCode.toUpperCase() });
            setModalOpen(false);
          } catch { /* toast */ }
        })}
        submitting={create.isPending}
      >
        <Field label="Currency code" error={form.formState.errors.currencyCode?.message}>
          <Input placeholder="JPY" maxLength={3} {...form.register("currencyCode")} className="uppercase" />
        </Field>
        <Field label="Currency name" error={form.formState.errors.currencyName?.message}>
          <Input placeholder="Japanese Yen" {...form.register("currencyName")} />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete currency?"
        description={deleting ? `${deleting.currencyCode} — ${deleting.currencyName} will be removed.` : undefined}
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
