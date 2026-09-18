// window._env_ for mock mode — exactly the keys the platform actually emits
// for this app (src/env.ts's Env), plus the project's catalog handles on
// USER_AUTH_SCOPES so mock/authz/session.ts can mint a realistic scope string
// per `?role=`.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  USER_AUTH_SCOPES:
    "openid profile email group ou " +
    "food-entries:read food-entries:write food-entries:read-granted " +
    "daily-goal:read daily-goal:write daily-goal:read-granted " +
    "progress:read progress:read-granted " +
    "coach-access:manage coach-access:read",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
