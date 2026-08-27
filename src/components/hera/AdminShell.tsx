import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Inbox, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { HeraLogo } from "./brand";
import { cn } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { signOutAdmin } from "@/lib/supabase/admin-server";

const nav = [
  { label: "Convites", to: "/admin", icon: LayoutDashboard },
  { label: "Submissões", to: "/admin/submissions", icon: Inbox },
] as const;

export function AdminLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function onLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await getSupabaseBrowser().auth.signOut();
      await signOutAdmin();
    } finally {
      await navigate({ to: "/admin/login" });
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar px-4 py-6">
      <div className="px-2">
        <HeraLogo invert subtitle="Painel interno" />
      </div>
      <nav className="mt-8 space-y-1">
        {nav.map((item, i) => {
          const active =
            i === 0
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname.startsWith("/admin/submissions");
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="absolute top-5 left-[17rem] rounded-lg bg-card p-2 text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-8">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-base font-semibold text-foreground sm:text-lg">{title}</h1>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
