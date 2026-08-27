export type Sector = {
  id: string;
  name: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  sectorId: string;
};

export type CompanyData = {
  name: string;
  cnpj: string;
  whatsapp: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export type AdminData = {
  name: string;
  email: string;
};

export type OnboardingData = {
  company: CompanyData;
  admin: AdminData;
  sectors: Sector[];
  members: TeamMember[];
};

export type SubmissionStatus = "pendente" | "revisado" | "criado";

export type Submission = {
  id: string;
  company: string;
  responsible: string;
  date: string;
  status: SubmissionStatus;
  data: OnboardingData;
};

export const emptyOnboarding: OnboardingData = {
  company: {
    name: "",
    cnpj: "",
    whatsapp: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  },
  admin: { name: "", email: "" },
  sectors: [],
  members: [],
};
