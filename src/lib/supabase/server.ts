import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import type { Database } from "./database";
import { getSupabasePublicEnv } from "./env";

type CookieSameSite = "lax" | "strict" | "none";

function toSameSite(value: unknown): CookieSameSite {
  if (value === true || value === "strict" || value === "Strict") return "strict";
  if (value === "none" || value === "None") return "none";
  return "lax";
}

function toCookieOptions(options?: Record<string, unknown>) {
  const sameSite = toSameSite(options?.["sameSite"]);
  const secure =
    sameSite === "none"
      ? true
      : Boolean(options?.["secure"] ?? process.env.NODE_ENV === "production");
  const maxAge = options?.["maxAge"];
  const expires = options?.["expires"];
  const domain = options?.["domain"];
  const path = options?.["path"];

  return {
    path: typeof path === "string" && path ? path : "/",
    httpOnly: Boolean(options?.["httpOnly"]),
    secure,
    sameSite,
    ...(typeof domain === "string" && domain ? { domain } : {}),
    ...(typeof maxAge === "number" && Number.isFinite(maxAge)
      ? { maxAge: Math.trunc(maxAge) }
      : {}),
    ...(expires instanceof Date ? { expires } : {}),
  };
}

export function getSupabaseServer() {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookies, headers) {
        for (const cookie of cookies) {
          setCookie(cookie.name, cookie.value, toCookieOptions(cookie.options));
        }
        for (const [name, value] of Object.entries(headers)) {
          setResponseHeader(name, value);
        }
      },
    },
  });
}
