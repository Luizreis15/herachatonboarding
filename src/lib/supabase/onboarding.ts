import type { OnboardingData } from "@/lib/hera/types";
import { getSupabase } from "./client";
import type { Json, OnboardingLinkPublic, OnboardingLinkStatus } from "./database";

export type TokenValidationState =
  "loading" | "ativo" | "utilizado" | "expirado" | "revogado" | "inexistente" | "erro";

export type TokenValidation =
  | { state: "ativo"; invite: OnboardingLinkPublic }
  | { state: "utilizado" | "expirado" | "revogado" | "inexistente" | "erro" };

function toLinkStatus(value: string | null | undefined): OnboardingLinkStatus | null {
  if (value === "ativo" || value === "utilizado" || value === "expirado" || value === "revogado") {
    return value;
  }
  return null;
}

export async function validateOnboardingToken(token: string): Promise<TokenValidation> {
  try {
    const { data, error } = await getSupabase().rpc("get_onboarding_link_by_token", {
      _token: token,
    });

    if (error) return { state: "erro" };

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { state: "inexistente" };

    const status = toLinkStatus(row.status);
    if (!status) return { state: "inexistente" };
    if (status === "ativo") {
      return {
        state: "ativo",
        invite: {
          id: row.id,
          cliente_nome: row.cliente_nome,
          empresa_nome: row.empresa_nome,
          status,
          expires_at: row.expires_at,
        },
      };
    }
    return { state: status };
  } catch {
    return { state: "erro" };
  }
}

function toPayload(data: OnboardingData): Json {
  return {
    empresa: {
      nome: data.company.name,
      cnpj: data.company.cnpj,
      whatsapp: data.company.whatsapp,
      cep: data.company.cep,
      rua: data.company.street,
      numero: data.company.number,
      complemento: data.company.complement,
      bairro: data.company.district,
      cidade: data.company.city,
      estado: data.company.state,
    },
    administrador: {
      nome: data.admin.name,
      email: data.admin.email,
    },
    setores: data.sectors.map((sector) => ({
      client_id: sector.id,
      nome: sector.name,
    })),
    usuarios: data.members.map((member) => ({
      nome: member.name,
      email: member.email,
      setor_client_id: member.sectorId,
    })),
  };
}

function submitErrorMessage(raw: string) {
  const message = raw.toLowerCase();
  if (message.includes("invite_used")) return "Este convite já foi utilizado.";
  if (message.includes("invite_expired")) return "Este link expirou. Fale com a Digital Hera.";
  if (message.includes("invite_revoked") || message.includes("invalid_token")) {
    return "Link inválido ou indisponível.";
  }
  if (message.includes("invalid_payload")) {
    return "Não foi possível enviar o cadastro. Revise os dados e tente novamente.";
  }
  return "Não foi possível enviar o cadastro. Tente novamente.";
}

export async function submitOnboarding(token: string, data: OnboardingData) {
  try {
    const { error } = await getSupabase().rpc("submit_onboarding", {
      _token: token,
      _payload: toPayload(data),
    });
    if (error) return { ok: false as const, message: submitErrorMessage(error.message) };
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Não foi possível enviar o cadastro. Tente novamente." };
  }
}
