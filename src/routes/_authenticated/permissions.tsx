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

export const Route = createFileRoute("/_authenticated/permissions")({ component: PermissionsPage });

interface Permission { id: number; name: string }

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(60).regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, underscore"),
});
type FormVals = z.infer<typeof schema>;

function PermissionsPage() {
  const { data, isLoading } = useList<Permission>("permissions", "/permissions");
  const { create, remove } = useCrudMutations("permissions", "/permissions");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Permission | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const openCreate = () => {
    form.reset({ name: "" });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (vals) => {
    try {
      await create.mutateAsync(vals);
      setModalOpen(false);
    } catch { /* toast */ }
  });

  return (
    <>
      <DataTable<Permission>
        title="Permissions"
        description="Atomic capabilities that can be grouped into roles."
        data={data}
        loading={isLoading}
        searchKeys={["name"]}
        onCreate={openCreate}
        createLabel="Add permission"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "name", header: "Permission", render: (r) => (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {r.name}
            </span>
          )},
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add permission"
        onSubmit={onSubmit}
        submitting={create.isPending}
      >
        <Field label="Permission name" error={form.formState.errors.name?.message}>
          <Input placeholder="EXPORT" {...form.register("name")} className="uppercase" />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete permission?"
        description={deleting ? `Permission ${deleting.name} will be removed from all groups.` : undefined}
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
