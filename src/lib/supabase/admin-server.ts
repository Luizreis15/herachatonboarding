import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  fetchAdminProfile,
  fetchInviteList,
  fetchSubmissionDetail,
  fetchSubmissionList,
  persistSubmissionStatus,
  createOnboardingInvite,
  type AdminProfile,
} from "./admin";
import type { Database } from "./database";

const submissionStatusSchema = z.enum(["pendente", "revisado", "criado"]);
const idSchema = z.string().min(1);
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function mapLoginError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "Email ou senha inválidos.";
  if (value.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (value.includes("too many requests")) return "Muitas tentativas. Aguarde um momento.";
  return "Não foi possível entrar. Tente novamente.";
}

export type AdminSession =
  { status: "anonymous" } | { status: "forbidden" } | { status: "ok"; admin: AdminProfile };

async function resolveAdminSession(): Promise<{
  supabase: SupabaseClient<Database>;
  session: AdminSession;
}> {
  const { getSupabaseServer: createClient } = await import("./server");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, session: { status: "anonymous" } };
  }

  const admin = await fetchAdminProfile(supabase, user.id);
  if (!admin) {
    await supabase.auth.signOut();
    return { supabase, session: { status: "forbidden" } };
  }

  return { supabase, session: { status: "ok", admin } };
}

export const fetchAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { session } = await resolveAdminSession();
  return session;
});

export const signOutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { getSupabaseServer } = await import("./server");
  const supabase = getSupabaseServer();
  await supabase.auth.signOut();
  return { ok: true as const };
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const { getSupabaseServer } = await import("./server");
    const supabase = getSupabaseServer();
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email: data.email.toLowerCase(),
      password: data.password,
    });

    if (error || !auth.user) {
      return {
        status: "error" as const,
        message: mapLoginError(error?.message ?? ""),
      };
    }

    const admin = await fetchAdminProfile(supabase, auth.user.id);
    if (!admin) {
      await supabase.auth.signOut();
      return { status: "forbidden" as const };
    }

    return { status: "ok" as const };
  });

export async function ensureAdminRoute() {
  const session = await fetchAdminSession();
  if (session.status === "anonymous") {
    throw redirect({ to: "/admin/login" });
  }
  if (session.status === "forbidden") {
    throw redirect({ to: "/admin/login", search: { error: "denied" } });
  }
  return session;
}

export const listAdminSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase, session } = await resolveAdminSession();
  if (session.status !== "ok") {
    return {
      ok: false as const,
      message:
        session.status === "forbidden"
          ? "Você não tem permissão para acessar o painel."
          : "Faça login para acessar o painel.",
    };
  }
  return fetchSubmissionList(supabase);
});

export const getAdminSubmission = createServerFn({ method: "GET" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }) => {
    if (!z.string().uuid().safeParse(data.id).success) {
      return {
        ok: false as const,
        reason: "not_found" as const,
        message: "Submissão não encontrada.",
      };
    }
    const { supabase, session } = await resolveAdminSession();
    if (session.status !== "ok") {
      return {
        ok: false as const,
        reason: "error" as const,
        message:
          session.status === "forbidden"
            ? "Você não tem permissão para acessar o painel."
            : "Faça login para acessar o painel.",
      };
    }
    return fetchSubmissionDetail(supabase, data.id);
  });

export const updateAdminSubmissionStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), status: submissionStatusSchema }))
  .handler(async ({ data }) => {
    const { supabase, session } = await resolveAdminSession();
    if (session.status !== "ok") {
      return { ok: false as const, message: "Faça login para atualizar o status." };
    }
    return persistSubmissionStatus(supabase, data.id, data.status);
  });

export const listAdminInvites = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase, session } = await resolveAdminSession();
  if (session.status !== "ok") {
    return {
      ok: false as const,
      message:
        session.status === "forbidden"
          ? "Você não tem permissão para acessar o painel."
          : "Faça login para acessar o painel.",
    };
  }
  return fetchInviteList(supabase);
});

export const createAdminInvite = createServerFn({ method: "POST" })
  .validator(
    z.object({
      empresaNome: z.string().trim().min(1),
      clienteNome: z.string().trim(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase, session } = await resolveAdminSession();
    if (session.status !== "ok") {
      return { ok: false as const, message: "Faça login para gerar o link." };
    }
    return createOnboardingInvite(supabase, data);
  });
