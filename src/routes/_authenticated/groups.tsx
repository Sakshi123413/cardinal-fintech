import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/common/DataTable";
import { FormModal, Field } from "@/components/common/FormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RowActions } from "@/components/common/RowActions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useList, useCrudMutations } from "@/hooks/useCrud";

export const Route = createFileRoute("/_authenticated/groups")({ component: GroupsPage });

interface Permission { id: number; name: string }
interface Group {
  id: number;
  name: string;
  permissions?: Permission[];
  permissionIds?: number[];
}

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(60),
  permissionIds: z.array(z.number()).default([]),
});
type FormVals = z.infer<typeof schema>;

function GroupsPage() {
  const { data, isLoading } = useList<Group>("groups", "/groups");
  const { data: perms } = useList<Permission>("permissions", "/permissions");
  const { create, update, remove } = useCrudMutations("groups", "/groups");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", permissionIds: [] },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", permissionIds: [] });
    setModalOpen(true);
  };

  const openEdit = (g: Group) => {
    setEditing(g);
    const ids = g.permissionIds ?? g.permissions?.map((p) => p.id) ?? [];
    form.reset({ name: g.name, permissionIds: ids });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (vals) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload: vals });
      else await create.mutateAsync(vals);
      setModalOpen(false);
    } catch { /* toast */ }
  });

  return (
    <>
      <DataTable<Group>
        title="Groups"
        description="Bundle permissions into roles and assign them to users."
        data={data}
        loading={isLoading}
        searchKeys={["name"]}
        onCreate={openCreate}
        createLabel="Add group"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "name", header: "Name", render: (r) => <span className="font-semibold uppercase tracking-wide">{r.name}</span> },
          { key: "permissions", header: "Permissions", render: (r) => (
            <div className="flex flex-wrap gap-1.5">
              {(r.permissions ?? []).length === 0 ? (
                <span className="text-xs text-muted-foreground">No permissions</span>
              ) : (
                r.permissions!.map((p) => (
                  <span key={p.id} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {p.name}
                  </span>
                ))
              )}
            </div>
          )},
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit group" : "Add group"}
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
      >
        <Field label="Group name" error={form.formState.errors.name?.message}>
          <Input placeholder="MANAGER" {...form.register("name")} />
        </Field>
        <Field label="Permissions">
          <Controller
            control={form.control}
            name="permissionIds"
            render={({ field }) => (
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                {(perms ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions available.</p>
                ) : (
                  perms!.map((p) => {
                    const checked = field.value?.includes(p.id);
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/60">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const set = new Set(field.value ?? []);
                            if (v) set.add(p.id); else set.delete(p.id);
                            field.onChange(Array.from(set));
                          }}
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete group?"
        description={deleting ? `Group ${deleting.name} will be permanently deleted.` : undefined}
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
