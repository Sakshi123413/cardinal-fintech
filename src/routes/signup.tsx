import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/common/FormModal";
import { useAuth } from "@/context/auth";
import { apiError } from "@/services/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
  groupId: z.coerce.number().int().positive("Group ID is required"),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const { signup, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "", groupId: 1 },
  });

  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/dashboard" });
  }, [ready, isAuthenticated, navigate]);

  const onSubmit = async (data: FormVals) => {
    setLoading(true);
    try {
      await signup({ name: data.name, email: data.email, password: data.password, groupId: data.groupId });
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(apiError(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary">
            <Landmark className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Nova Bank</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Join the platform trusted by modern finance teams.
          </h2>
          <p className="mt-4 text-sidebar-foreground/70">
            Spin up wallets, manage permissions, and ship faster.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} Nova Bank</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">It only takes a minute.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full name" error={errors.name?.message}>
              <Input placeholder="Jane Smith" {...register("name")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@company.com" {...register("email")} />
            </Field>
            <Field label="Group ID" error={errors.groupId?.message}>
              <Input type="number" min={1} {...register("groupId")} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm password" error={errors.confirm?.message}>
              <Input type={showPwd ? "text" : "password"} placeholder="••••••••" {...register("confirm")} />
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
