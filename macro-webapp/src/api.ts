// Same-origin typed client for macro-api. nginx proxies /api to the sibling
// (preferring MACRO_API_GATEWAY_URL, falling back to MACRO_API_URL — pod env,
// never window._env_). Authorization is entirely src/authz/client.ts's: this
// module adds nothing of its own about it.
import createClient from "openapi-fetch";
import type { Middleware } from "openapi-fetch";
import type { paths } from "./generated/macro-api";
import { authorizationHeader, classifyResponse, ForbiddenError } from "./authz/client";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
};

export const macroApi = createClient<paths>({ baseUrl: "/api" });
macroApi.use(authMiddleware);
