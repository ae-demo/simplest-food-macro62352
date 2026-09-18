// Typed read of window._env_, mounted by the platform at request time as
// /env-config.js. Throws at module load if that file never loaded — see
// react-webapp's Constraints. Only keys the platform actually emits for this
// app are declared: the four `USER_AUTH_*` OIDC keys (`USER_AUTH_JWKS_URL` is
// emitted too, but the browser never validates a token, so it is not here).
// There is no sibling API URL key — macro-api is reached same-origin at
// `/api` (src/api.ts).

export type Env = {
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_SCOPES: string;
  USER_AUTH_RESOURCE: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server (see mock mode).",
  );
}

export const env: Env = window._env_;
