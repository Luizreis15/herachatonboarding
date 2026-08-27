import type { Submission } from "./types";

export const statusLabel: Record<Submission["status"], string> = {
  pendente: "Pendente",
  revisado: "Revisado",
  criado: "Criado",
};

export function formatSubmissionCopy(submission: Submission) {
  const { company, admin, sectors, members } = submission.data;
  const sectorName = (sectorId: string) =>
    sectors.find((sector) => sector.id === sectorId)?.name ?? "—";

  const address = [
    [company.street, company.number].filter(Boolean).join(", "),
    company.complement,
    company.district,
    [company.city, company.state].filter(Boolean).join(" - "),
    company.cep,
  ]
    .filter((part) => part && part.trim())
    .join(", ");

  const userLines =
    members.length === 0
      ? ["- Nenhum"]
      : members.map(
          (member) => `- ${member.name} <${member.email}> (${sectorName(member.sectorId)})`,
        );

  return [
    `Empresa: ${company.name}`,
    `CNPJ: ${company.cnpj}`,
    `WhatsApp: ${company.whatsapp}`,
    `Endereço: ${address || "—"}`,
    "",
    `Administrador: ${admin.name}`,
    `Email: ${admin.email}`,
    "",
    `Setores: ${sectors.map((sector) => sector.name).join(", ") || "—"}`,
    "",
    "Usuários:",
    ...userLines,
    "",
    `Status: ${statusLabel[submission.status]}`,
    `Data: ${submission.date}`,
    `Responsável: ${submission.responsible}`,
  ].join("\n");
}
