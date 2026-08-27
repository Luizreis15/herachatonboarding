export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OnboardingLinkStatus = "ativo" | "utilizado" | "expirado" | "revogado";
export type SubmissionRecordStatus = "pendente" | "revisado" | "criado";

export type OnboardingLinkRow = {
  id: string;
  token: string;
  cliente_nome: string | null;
  empresa_nome: string | null;
  status: OnboardingLinkStatus;
  expires_at: string | null;
  used_at: string | null;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  onboarding_link_id: string | null;
  empresa_nome: string;
  empresa_cnpj: string;
  empresa_whatsapp: string;
  empresa_cep: string | null;
  empresa_rua: string | null;
  empresa_numero: string | null;
  empresa_complemento: string | null;
  empresa_bairro: string | null;
  empresa_cidade: string | null;
  empresa_estado: string | null;
  admin_nome: string;
  admin_email: string;
  status: SubmissionRecordStatus;
  created_at: string;
  updated_at: string;
};

export type SetorRow = {
  id: string;
  submission_id: string;
  nome: string;
  created_at: string;
};

export type UsuarioRow = {
  id: string;
  submission_id: string;
  setor_id: string;
  nome: string;
  email: string;
  created_at: string;
};

export type AdminRole = "admin" | "operador";

export type AdminUserRow = {
  user_id: string;
  email: string;
  nome: string | null;
  role: AdminRole;
  active: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingLinkPublic = {
  id: string;
  cliente_nome: string | null;
  empresa_nome: string | null;
  status: OnboardingLinkStatus;
  expires_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      onboarding_links: {
        Row: OnboardingLinkRow;
        Insert: {
          id?: string;
          token: string;
          cliente_nome?: string | null;
          empresa_nome?: string | null;
          status?: OnboardingLinkStatus;
          expires_at?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<OnboardingLinkRow>;
        Relationships: [];
      };
      submissions: {
        Row: SubmissionRow;
        Insert: {
          id?: string;
          onboarding_link_id?: string | null;
          empresa_nome: string;
          empresa_cnpj: string;
          empresa_whatsapp: string;
          empresa_cep?: string | null;
          empresa_rua?: string | null;
          empresa_numero?: string | null;
          empresa_complemento?: string | null;
          empresa_bairro?: string | null;
          empresa_cidade?: string | null;
          empresa_estado?: string | null;
          admin_nome: string;
          admin_email: string;
          status?: SubmissionRecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SubmissionRow>;
        Relationships: [
          {
            foreignKeyName: "submissions_onboarding_link_id_fkey";
            columns: ["onboarding_link_id"];
            isOneToOne: true;
            referencedRelation: "onboarding_links";
            referencedColumns: ["id"];
          },
        ];
      };
      setores: {
        Row: SetorRow;
        Insert: {
          id?: string;
          submission_id: string;
          nome: string;
          created_at?: string;
        };
        Update: Partial<SetorRow>;
        Relationships: [
          {
            foreignKeyName: "setores_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      usuarios: {
        Row: UsuarioRow;
        Insert: {
          id?: string;
          submission_id: string;
          setor_id: string;
          nome: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<UsuarioRow>;
        Relationships: [
          {
            foreignKeyName: "usuarios_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "usuarios_setor_id_fkey";
            columns: ["setor_id"];
            isOneToOne: false;
            referencedRelation: "setores";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: {
          user_id: string;
          email: string;
          nome?: string | null;
          role?: AdminRole;
          active?: boolean;
          is_owner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<AdminUserRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_onboarding_link_by_token: {
        Args: { _token: string };
        Returns: OnboardingLinkPublic[];
      };
      submit_onboarding: {
        Args: { _token: string; _payload: Json };
        Returns: string;
      };
      is_system_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_active_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
