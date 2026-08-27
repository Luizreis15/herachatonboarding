import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingData, Submission, SubmissionStatus } from "@/lib/hera/types";
import type {
  Database,
  SetorRow,
  SubmissionRecordStatus,
  SubmissionRow,
  UsuarioRow,
} from "./database";

const SUBMISSION_STATUSES: SubmissionStatus[] = ["pendente", "revisado", "criado"];

export type AdminProfile = {
  user_id: string;
  nome: string | null;
  role: Database["public"]["Tables"]["admin_users"]["Row"]["role"];
  active: boolean;
  is_owner: boolean;
  email: string;
};

export type AdminSubmissionListItem = {
  id: string;
  company: string;
  responsible: string;
  date: string;
  status: SubmissionStatus;
};

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return SUBMISSION_STATUSES.includes(value as SubmissionStatus);
}

export function parseSubmissionStatus(value: string): SubmissionStatus | null {
  return isSubmissionStatus(value) ? value : null;
}

export function formatSubmissionDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function toOnboardingData(
  row: SubmissionRow,
  setores: SetorRow[],
  usuarios: UsuarioRow[],
): OnboardingData {
  return {
    company: {
      name: row.empresa_nome,
      cnpj: row.empresa_cnpj,
      whatsapp: row.empresa_whatsapp,
      cep: row.empresa_cep ?? "",
      street: row.empresa_rua ?? "",
      number: row.empresa_numero ?? "",
      complement: row.empresa_complemento ?? "",
      district: row.empresa_bairro ?? "",
      city: row.empresa_cidade ?? "",
      state: row.empresa_estado ?? "",
    },
    admin: {
      name: row.admin_nome,
      email: row.admin_email,
    },
    sectors: setores.map((setor) => ({ id: setor.id, name: setor.nome })),
    members: usuarios.map((usuario) => ({
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      sectorId: usuario.setor_id,
    })),
  };
}

export function toSubmission(
  row: SubmissionRow,
  setores: SetorRow[] = [],
  usuarios: UsuarioRow[] = [],
): Submission {
  return {
    id: row.id,
    company: row.empresa_nome,
    responsible: row.admin_nome,
    date: formatSubmissionDate(row.created_at),
    status: row.status,
    data: toOnboardingData(row, setores, usuarios),
  };
}

export function toListItem(
  row: Pick<SubmissionRow, "id" | "empresa_nome" | "admin_nome" | "status" | "created_at">,
): AdminSubmissionListItem {
  return {
    id: row.id,
    company: row.empresa_nome,
    responsible: row.admin_nome,
    date: formatSubmissionDate(row.created_at),
    status: row.status,
  };
}

export async function fetchAdminProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<AdminProfile | null> {
  const { data, error } = await client
    .from("admin_users")
    .select("user_id, nome, role, active, is_owner, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  if (!data.active) return null;
  return data;
}

export async function fetchSubmissionList(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("submissions")
    .select("id, empresa_nome, admin_nome, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, message: "Não foi possível carregar as submissões." };

  return {
    ok: true as const,
    submissions: (data ?? []).map((row) => toListItem(row)),
  };
}

export async function fetchSubmissionDetail(client: SupabaseClient<Database>, id: string) {
  const [
    { data: submission, error: submissionError },
    { data: setores, error: setoresError },
    { data: usuarios, error: usuariosError },
  ] = await Promise.all([
    client.from("submissions").select("*").eq("id", id).maybeSingle(),
    client
      .from("setores")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: true }),
    client
      .from("usuarios")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (submissionError || setoresError || usuariosError) {
    return {
      ok: false as const,
      reason: "error" as const,
      message: "Não foi possível carregar a submissão.",
    };
  }

  if (!submission) {
    return {
      ok: false as const,
      reason: "not_found" as const,
      message: "Submissão não encontrada.",
    };
  }

  return {
    ok: true as const,
    submission: toSubmission(submission, setores ?? [], usuarios ?? []),
  };
}

export async function persistSubmissionStatus(
  client: SupabaseClient<Database>,
  id: string,
  status: SubmissionRecordStatus,
) {
  const parsed = parseSubmissionStatus(status);
  if (!parsed) {
    return { ok: false as const, message: "Status inválido." };
  }

  const { data, error } = await client
    .from("submissions")
    .update({ status: parsed })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, message: "Não foi possível atualizar o status." };
  }

  return { ok: true as const, status: data.status };
}

export type AdminInviteListItem = {
  id: string;
  token: string;
  company: string;
  responsible: string;
  date: string;
  status: "ativo" | "utilizado" | "expirado" | "revogado";
};

function inviteStatus(status: string, expiresAt: string | null): AdminInviteListItem["status"] {
  if (status === "utilizado" || status === "expirado" || status === "revogado") return status;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return "expirado";
  return "ativo";
}

export async function fetchInviteList(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("onboarding_links")
    .select("id, token, cliente_nome, empresa_nome, status, expires_at, created_at")
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, message: "Não foi possível carregar os convites." };

  return {
    ok: true as const,
    invites: (data ?? []).map((row) => ({
      id: row.id,
      token: row.token,
      company: row.empresa_nome?.trim() || "Sem empresa",
      responsible: row.cliente_nome?.trim() || "—",
      date: formatSubmissionDate(row.created_at),
      status: inviteStatus(row.status, row.expires_at),
    })),
  };
}

export async function createOnboardingInvite(
  client: SupabaseClient<Database>,
  input: { empresaNome: string; clienteNome: string },
) {
  const empresaNome = input.empresaNome.trim();
  const clienteNome = input.clienteNome.trim();
  if (!empresaNome) {
    return { ok: false as const, message: "Informe o nome da empresa." };
  }

  const token = crypto.randomUUID().replaceAll("-", "");
  const { data, error } = await client
    .from("onboarding_links")
    .insert({
      token,
      empresa_nome: empresaNome,
      cliente_nome: clienteNome || null,
      status: "ativo",
    })
    .select("id, token, cliente_nome, empresa_nome, status, expires_at, created_at")
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, message: "Não foi possível gerar o link." };
  }

  return {
    ok: true as const,
    invite: {
      id: data.id,
      token: data.token,
      company: data.empresa_nome?.trim() || empresaNome,
      responsible: data.cliente_nome?.trim() || "—",
      date: formatSubmissionDate(data.created_at),
      status: inviteStatus(data.status, data.expires_at),
    } satisfies AdminInviteListItem,
  };
}
