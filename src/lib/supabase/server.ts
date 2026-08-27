import { createServerClient } from "@supabase/ssr";
import { getCookies, getResponse, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import type { Database } from "./database";
import { getSupabasePublicEnv } from "./env";

type CookieSameSite = "lax" | "strict" | "none";

function toSameSite(value: unknown): CookieSameSite {
  if (value === true || value === "strict" || value === "Strict") return "strict";
  if (value === "none" || value === "None") return "none";
  return "lax";
}

function toExpires(value: unknown): Date | undefined {
  if (value instanceof Date && Number.isFinite(value.valueOf())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (Number.isFinite(date.valueOf())) return date;
  }
  return undefined;
}

function toCookieOptions(options?: Record<string, unknown>) {
  const sameSite = toSameSite(options?.["sameSite"]);
  const secure =
    sameSite === "none"
      ? true
      : Boolean(options?.["secure"] ?? process.env.NODE_ENV === "production");
  const maxAge = options?.["maxAge"];
  const domain = options?.["domain"];
  const path = options?.["path"];
  const expires = toExpires(options?.["expires"]);

  return {
    path: typeof path === "string" && path ? path : "/",
    httpOnly: Boolean(options?.["httpOnly"]),
    secure,
    sameSite,
    ...(typeof domain === "string" && domain ? { domain } : {}),
    ...(typeof maxAge === "number" && Number.isFinite(maxAge)
      ? { maxAge: Math.trunc(maxAge) }
      : {}),
    ...(expires ? { expires } : {}),
  };
}

function writeCookie(name: string, value: string, options?: Record<string, unknown>) {
  const cookieOptions = toCookieOptions(options);
  try {
    setCookie(name, value, cookieOptions);
    return;
  } catch (error) {
    console.error(error);
  }

  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`, `Path=${cookieOptions.path}`];
  if (cookieOptions.maxAge != null) parts.push(`Max-Age=${cookieOptions.maxAge}`);
  if (cookieOptions.expires) parts.push(`Expires=${cookieOptions.expires.toUTCString()}`);
  if (cookieOptions.domain) parts.push(`Domain=${cookieOptions.domain}`);
  if (cookieOptions.httpOnly) parts.push("HttpOnly");
  if (cookieOptions.secure) parts.push("Secure");
  parts.push(`SameSite=${cookieOptions.sameSite[0].toUpperCase()}${cookieOptions.sameSite.slice(1)}`);
  getResponse().headers.append("set-cookie", parts.join("; "));
}

export function copySessionCookies(response: Response) {
  try {
    const cookies = getResponse().headers.getSetCookie();
    if (cookies.length === 0) return;
    const existing = new Set(response.headers.getSetCookie());
    for (const cookie of cookies) {
      if (!existing.has(cookie)) response.headers.append("set-cookie", cookie);
    }
  } catch {
    // Request context is missing outside a server handler.
  }
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
          writeCookie(cookie.name, cookie.value, cookie.options);
        }
        for (const [name, value] of Object.entries(headers)) {
          setResponseHeader(name, value);
        }
      },
    },
  });
}
