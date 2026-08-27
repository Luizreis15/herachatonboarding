import type { Submission } from "./types";

export const mockSubmissions: Submission[] = [
  {
    id: "1",
    company: "JB Auto",
    responsible: "João Batista",
    date: "25/08/2026",
    status: "pendente",
    data: {
      company: {
        name: "JB Auto",
        cnpj: "12.345.678/0001-90",
        whatsapp: "(11) 98888-1234",
        cep: "01310-100",
        street: "Av. Paulista",
        number: "1000",
        complement: "Sala 42",
        district: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      },
      admin: { name: "João Batista", email: "joao@jbauto.com.br" },
      sectors: [
        { id: "s1", name: "Comercial" },
        { id: "s2", name: "Financeiro" },
        { id: "s3", name: "Oficina" },
      ],
      members: [
        { id: "m1", name: "Carla Souza", email: "carla@jbauto.com.br", sectorId: "s1" },
        { id: "m2", name: "Rafael Lima", email: "rafael@jbauto.com.br", sectorId: "s1" },
        { id: "m3", name: "Bruna Dias", email: "bruna@jbauto.com.br", sectorId: "s2" },
        { id: "m4", name: "Pedro Alves", email: "pedro@jbauto.com.br", sectorId: "s3" },
      ],
    },
  },
  {
    id: "2",
    company: "Empresa Exemplo",
    responsible: "Maria Silva",
    date: "24/08/2026",
    status: "revisado",
    data: {
      company: {
        name: "Empresa Exemplo",
        cnpj: "98.765.432/0001-10",
        whatsapp: "(21) 97777-4321",
        cep: "22041-011",
        street: "Rua Barata Ribeiro",
        number: "205",
        complement: "",
        district: "Copacabana",
        city: "Rio de Janeiro",
        state: "RJ",
      },
      admin: { name: "Maria Silva", email: "maria@exemplo.com.br" },
      sectors: [
        { id: "s1", name: "Suporte" },
        { id: "s2", name: "Comercial" },
      ],
      members: [
        { id: "m1", name: "Lucas Prado", email: "lucas@exemplo.com.br", sectorId: "s1" },
        { id: "m2", name: "Ana Rocha", email: "ana@exemplo.com.br", sectorId: "s2" },
      ],
    },
  },
  {
    id: "3",
    company: "Clínica Vitale",
    responsible: "Fernanda Costa",
    date: "22/08/2026",
    status: "criado",
    data: {
      company: {
        name: "Clínica Vitale",
        cnpj: "45.111.222/0001-55",
        whatsapp: "(31) 96666-7788",
        cep: "30140-071",
        street: "Rua da Bahia",
        number: "1500",
        complement: "Conj. 12",
        district: "Funcionários",
        city: "Belo Horizonte",
        state: "MG",
      },
      admin: { name: "Fernanda Costa", email: "fernanda@vitale.com.br" },
      sectors: [
        { id: "s1", name: "Recepção" },
        { id: "s2", name: "Financeiro" },
      ],
      members: [
        { id: "m1", name: "Juliana Reis", email: "juliana@vitale.com.br", sectorId: "s1" },
        { id: "m2", name: "Marcos Nunes", email: "marcos@vitale.com.br", sectorId: "s2" },
      ],
    },
  },
];

export const statusLabel: Record<Submission["status"], string> = {
  pendente: "Pendente",
  revisado: "Revisado",
  criado: "Criado",
};
