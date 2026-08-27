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

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
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
    <div className="flex h-full flex-col bg-linear-to-b from-[#3d2266] to-sidebar px-4 py-7">
      <div className="px-2">
        <HeraLogo invert subtitle="Painel interno" />
      </div>
      <nav className="mt-10 space-y-1">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-white/12 text-white"
                  : "text-white/65 hover:bg-white/8 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-50"
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
          <div className="absolute inset-0 bg-primary-deep/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="absolute top-5 left-[17rem] rounded-xl bg-card p-2 text-foreground shadow-card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="rounded-xl border border-border bg-card p-2 text-foreground"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-base font-bold text-foreground">{title}</h1>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
