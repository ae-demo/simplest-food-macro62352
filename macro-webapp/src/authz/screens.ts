// Adapted from thunder-authentication's screens.example.ts. THE ONLY file that
// knows about screens — each names the one macro-api operation it LOADS (or,
// for a write-only form, the operation its submit makes). The gate follows
// from that operation's scope in specs/design/components/macro-api/openapi.yaml,
// projected into ./operations.gen.ts. No screen table lives in security.json.
//
// Rail order below is wireframes.dsl's sidebar order for each role: Today,
// History, Goal, Coach access (Client); Clients (Coach). LogFoodEntry,
// EditFoodEntry and GrantCoachAccess are reached by button, not the rail, but
// still need their own route + gate.

import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
  /** Shown in the sidebar rail. Screens reached only by button stay off it. */
  readonly inRail?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  // --- Client -----------------------------------------------------------
  { key: "today", label: "Today", path: "/today", loads: "GET /me/progress", inRail: true },
  {
    key: "log-food-entry",
    label: "Log food",
    path: "/today/log",
    loads: "POST /me/food-entries",
  },
  {
    key: "edit-food-entry",
    label: "Edit food entry",
    path: "/today/entries/:entryId/edit",
    loads: "PUT /me/food-entries/{entryId}",
  },
  { key: "history", label: "History", path: "/history", loads: "GET /me/food-entries", inRail: true },
  { key: "goal", label: "Goal", path: "/goal", loads: "PUT /me/goal", inRail: true },
  {
    key: "coach-access",
    label: "Coach access",
    path: "/coach-access",
    loads: "GET /me/coach-access",
    inRail: true,
  },
  {
    key: "grant-coach-access",
    label: "Grant coach access",
    path: "/coach-access/grant",
    loads: "POST /me/coach-access",
  },
  // --- Coach --------------------------------------------------------------
  { key: "clients-list", label: "Clients", path: "/clients", loads: "GET /me/clients", inRail: true },
  {
    key: "client-progress",
    label: "Client progress",
    path: "/clients/:clientId",
    loads: "GET /me/clients/{clientId}/progress",
  },
];

// FAIL LOUDLY at module load — a committed table that outlived its contract
// must never silently gate on nothing.
for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some((screen) => !screen.public && screen.loads !== null);
}
