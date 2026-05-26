import { Menu, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/60 lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <button
        className="relative hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:flex"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
      </button>

      <div className="flex items-center gap-3 rounded-full border bg-background py-1.5 pl-1.5 pr-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-tight">{user?.name ?? "User"}</p>
          <p className="text-xs leading-tight text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
