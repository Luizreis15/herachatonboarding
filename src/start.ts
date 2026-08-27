import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

function responseFromMiddlewareResult(result: unknown): Response | undefined {
  if (result instanceof Response) return result;
  if (result && typeof result === "object" && "response" in result) {
    const response = (result as { response?: unknown }).response;
    if (response instanceof Response) return response;
  }
  return undefined;
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const result = await next();
    const response = responseFromMiddlewareResult(result);
    if (response) {
      const { copySessionCookies } = await import("./lib/supabase/server");
      copySessionCookies(response);
    }
    return result;
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  secFetchSite: ["same-origin", "same-site"],
  origin: (origin, ctx) => {
    try {
      const originHost = new URL(origin).host;
      const requestHost = new URL(ctx.request.url).host;
      const forwarded = (
        ctx.request.headers.get("x-forwarded-host") ??
        ctx.request.headers.get("host") ??
        ""
      )
        .split(",")[0]
        ?.trim();
      return originHost === requestHost || (Boolean(forwarded) && originHost === forwarded);
    } catch {
      return false;
    }
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
