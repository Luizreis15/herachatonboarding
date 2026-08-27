import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import type { Database } from "./database";
import { getSupabasePublicEnv } from "./env";

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
          setCookie(cookie.name, cookie.value, {
            ...cookie.options,
            path: cookie.options?.path ?? "/",
            sameSite: cookie.options?.sameSite ?? "lax",
            secure: cookie.options?.secure ?? process.env.NODE_ENV === "production",
          });
        }
        for (const [name, value] of Object.entries(headers)) {
          setResponseHeader(name, value);
        }
      },
    },
  });
}
