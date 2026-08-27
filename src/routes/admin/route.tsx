import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminLoading } from "@/components/hera/AdminShell";
import { ensureAdminRoute } from "@/lib/supabase/admin-server";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const path = location.pathname.replace(/\/$/, "");
    if (path === "/admin/login") return;
    return ensureAdminRoute();
  },
  pendingComponent: () => <AdminLoading message="Carregando sessão..." />,
  component: () => <Outlet />,
});
