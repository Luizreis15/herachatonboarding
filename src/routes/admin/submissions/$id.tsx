import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AdminLoading, AdminShell } from "@/components/hera/AdminShell";
import { ReviewSummary } from "@/components/hera/ReviewSummary";
import { Field, HeraButton, HeraCard, StatusPill } from "@/components/hera/ui";
import { formatSubmissionCopy, statusLabel } from "@/lib/hera/format";
import type { SubmissionStatus } from "@/lib/hera/types";
import { getAdminSubmission, updateAdminSubmissionStatus } from "@/lib/supabase/admin-server";

export const Route = createFileRoute("/admin/submissions/$id")({
  loader: async ({ params }) => {
    try {
      return await getAdminSubmission({ data: { id: params.id } });
    } catch {
      return {
        ok: false as const,
        reason: "error" as const,
        message: "Não foi possível carregar a submissão.",
      };
    }
  },
  pendingComponent: () => <AdminLoading message="Carregando submissão..." />,
  component: AdminSubmissionDetailPage,
});

const statusOptions: SubmissionStatus[] = ["pendente", "revisado", "criado"];

function AdminSubmissionDetailPage() {
  const result = Route.useLoaderData();
  const [status, setStatus] = useState<SubmissionStatus | undefined>(
    result.ok ? result.submission.status : undefined,
  );
  const [saving, setSaving] = useState(false);

  if (!result.ok) {
    return (
      <AdminShell title="Submissão">
        <HeraCard className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            {result.reason === "not_found"
              ? "Submissão não encontrada."
              : "Não foi possível carregar a submissão."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
          <Link
            to="/admin/submissions"
            className="mt-6 inline-flex text-sm font-medium text-primary hover:text-primary-hover"
          >
            Voltar à lista
          </Link>
        </HeraCard>
      </AdminShell>
    );
  }

  const submission = result.submission;
  const currentStatus = status ?? submission.status;

  async function copyData() {
    try {
      await navigator.clipboard.writeText(
        formatSubmissionCopy({ ...submission, status: currentStatus }),
      );
      toast.success("Dados copiados");
    } catch {
      toast.error("Não foi possível copiar os dados");
    }
  }

  async function onStatusChange(next: SubmissionStatus) {
    if (saving || next === currentStatus) return;
    setSaving(true);
    const previous = currentStatus;
    setStatus(next);
    try {
      const updated = await updateAdminSubmissionStatus({
        data: { id: submission.id, status: next },
      });
      if (!updated.ok) {
        setStatus(previous);
        toast.error(updated.message);
        return;
      }
      setStatus(updated.status);
      toast.success(`Status alterado para ${statusLabel[updated.status]}`);
    } catch {
      setStatus(previous);
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title={submission.company} subtitle={`Responsável: ${submission.responsible}`}>
      <div className="mx-auto max-w-3xl">
        <HeraCard className="mb-6 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={currentStatus} />
                <span className="text-sm text-muted-foreground">{submission.date}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Responsável: {submission.responsible}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
              <Field label="Alterar status" className="sm:w-44">
                <select
                  value={currentStatus}
                  disabled={saving}
                  onChange={(event) => void onStatusChange(event.target.value as SubmissionStatus)}
                  className="h-12 w-full rounded-[10px] border border-border bg-card px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {statusLabel[option]}
                    </option>
                  ))}
                </select>
              </Field>
              <HeraButton
                variant="secondary"
                onClick={() => void copyData()}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4" />
                Copiar dados
              </HeraButton>
            </div>
          </div>
        </HeraCard>

        <ReviewSummary data={submission.data} />
      </div>
    </AdminShell>
  );
}
