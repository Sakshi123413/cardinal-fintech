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

export const Route = createFileRoute("/_authenticated/users")({ component: UsersPage });

interface User {
  id: number;
  name: string;
  email: string;
  groupName?: string;
  groupId?: number;
}

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters").optional().or(z.literal("")),
  groupId: z.coerce.number().int().positive("Group ID required"),
});
type FormVals = z.infer<typeof schema>;

function UsersPage() {
  const { data, isLoading } = useList<User>("users", "/users");
  const { create, update, remove } = useCrudMutations("users", "/users");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", groupId: 1 },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", email: "", password: "", groupId: 1 });
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    form.reset({ name: u.name, email: u.email, password: "", groupId: u.groupId ?? 1 });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (vals) => {
    const payload: any = { name: vals.name, email: vals.email, groupId: vals.groupId };
    if (vals.password) payload.password = vals.password;
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else await create.mutateAsync({ ...payload, password: vals.password || "changeme123" });
      setModalOpen(false);
    } catch { /* toast handled */ }
  });

  return (
    <>
      <DataTable<User>
        title="Users"
        description="Manage platform users and their group assignments."
        data={data}
        loading={isLoading}
        searchKeys={["name", "email", "groupName"]}
        onCreate={openCreate}
        createLabel="Add user"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "ID", className: "w-16 text-muted-foreground" },
          { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
          { key: "groupName", header: "Group", render: (r) => (
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {r.groupName ?? `Group #${r.groupId ?? "—"}`}
            </span>
          )},
          { key: "actions", header: "", className: "text-right", render: (r) => (
            <RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleting(r)} />
          )},
        ]}
      />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit user" : "Add user"}
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
      >
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="Jane Smith" />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} placeholder="jane@example.com" />
        </Field>
        <Field label={editing ? "Password (leave blank to keep)" : "Password"} error={form.formState.errors.password?.message}>
          <Input type="password" {...form.register("password")} placeholder="••••••••" />
        </Field>
        <Field label="Group ID" error={form.formState.errors.groupId?.message}>
          <Input type="number" min={1} {...form.register("groupId")} />
        </Field>
      </FormModal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete user?"
        description={deleting ? `This will permanently delete ${deleting.name}.` : undefined}
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
