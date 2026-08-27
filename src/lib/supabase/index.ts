export { getSupabase } from "./client";
export { getSupabaseBrowser } from "./browser";
export { submitOnboarding, validateOnboardingToken } from "./onboarding";
export type { TokenValidation, TokenValidationState } from "./onboarding";
export type {
  AdminRole,
  AdminUserRow,
  Database,
  OnboardingLinkPublic,
  OnboardingLinkRow,
  OnboardingLinkStatus,
  SetorRow,
  SubmissionRecordStatus,
  SubmissionRow,
  UsuarioRow,
} from "./database";
export type { AdminProfile, AdminSubmissionListItem } from "./admin";
