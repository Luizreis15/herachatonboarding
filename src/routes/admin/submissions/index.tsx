import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AdminLoading, AdminShell } from "@/components/hera/AdminShell";
import { HeraCard, StatusPill } from "@/components/hera/ui";
import { listAdminSubmissions } from "@/lib/supabase/admin-server";

export const Route = createFileRoute("/admin/submissions/")({
  loader: () => listAdminSubmissions(),
  pendingComponent: () => <AdminLoading message="Carregando submissões..." />,
  component: AdminSubmissionsPage,
});

function AdminSubmissionsPage() {
  const result = Route.useLoaderData();

  return (
    <AdminShell title="Submissões">
      {!result.ok ? (
        <HeraCard className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Não foi possível carregar as submissões.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
        </HeraCard>
      ) : result.submissions.length === 0 ? (
        <HeraCard className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Nenhuma submissão ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando o cliente enviar o cadastro pelo link, ele aparece aqui.
          </p>
        </HeraCard>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {result.submissions.length}{" "}
              {result.submissions.length === 1 ? "submissão" : "submissões"}
            </p>
          </div>

          <ul className="space-y-3">
            {result.submissions.map((submission) => (
              <li key={submission.id}>
                <Link
                  to="/admin/submissions/$id"
                  params={{ id: submission.id }}
                  className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <HeraCard className="px-5 py-4 transition-colors hover:border-primary/25 hover:bg-primary-wash/40 sm:px-6">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <p className="truncate text-[15px] font-semibold text-foreground">
                            {submission.company}
                          </p>
                          <StatusPill status={submission.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {submission.responsible}
                          <span className="mx-1.5 text-border">·</span>
                          {submission.date}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </HeraCard>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminShell>
  );
}
