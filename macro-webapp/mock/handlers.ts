// Mock mode's API layer for macro-api. One handler per operation in
// specs/design/components/macro-api/openapi.yaml, seeded so the Today and
// ClientProgress stat cards and food-entries tables read exactly as
// wireframes.dsl draws them (node scripts/seed.mjs wireframes.dsl).
//
// State lives in module scope, not on a server: a full page load re-runs this
// module and resets the seed (react-webapp's mock-mode.md). Only in-app
// navigation carries a change forward.
//
// NO scope check here — mock/authz/gateway.ts is the gateway layer that
// decides whether an operation may be called at all, exactly as the real API
// gateway does. What a handler owes is its path's reach: a /me/... handler
// answers the caller's own rows.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/macro-api";
import { todayISODate } from "../src/lib/date";

type FoodEntry = components["schemas"]["FoodEntry"];
type FoodEntryInput = components["schemas"]["FoodEntryInput"];
type DailyGoal = components["schemas"]["DailyGoal"];
type DailyGoalInput = components["schemas"]["DailyGoalInput"];
type CoachAccessGrant = components["schemas"]["CoachAccessGrant"];
type ClientSummary = components["schemas"]["ClientSummary"];

const TODAY = todayISODate();

// Off-screen macros already logged today, before the two entries the Today
// table draws — folded into `/me/progress` so its consumed totals match
// wireframes.dsl's stat cards (1450 / 80g / 140g / 40g) exactly while the
// visible table still shows only the two seeded rows. A new entry the walk
// logs is added on top of this baseline, so "log food -> refreshed progress"
// (client-logs-food-against-goal.md) genuinely moves the numbers.
const TODAY_BASELINE = { calories: 900, proteinG: 25, carbsG: 86, fatG: 29 };

let nextEntryId = 3;
let myFoodEntries: FoodEntry[] = [
  {
    id: "1",
    name: "Oatmeal",
    loggedDate: TODAY,
    calories: 300,
    proteinG: 10,
    carbsG: 54,
    fatG: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chicken breast",
    loggedDate: TODAY,
    calories: 250,
    proteinG: 45,
    carbsG: 0,
    fatG: 6,
    createdAt: new Date().toISOString(),
  },
  // Two past days, sized so History's per-day totals read "Met goal" /
  // "Over goal" against the 2000-calorie goal below, exactly as
  // wireframes.dsl's History table draws them.
  {
    id: "hist-1",
    name: "Balanced meals",
    loggedDate: "2026-09-17",
    calories: 1980,
    proteinG: 145,
    carbsG: 210,
    fatG: 60,
    createdAt: "2026-09-17T20:00:00.000Z",
  },
  {
    id: "hist-2",
    name: "Heavier day",
    loggedDate: "2026-09-16",
    calories: 2200,
    proteinG: 130,
    carbsG: 240,
    fatG: 70,
    createdAt: "2026-09-16T20:00:00.000Z",
  },
];

let myGoal: DailyGoal | null = {
  id: "goal-1",
  calories: 2000,
  proteinG: 150,
  carbsG: 220,
  fatG: 65,
  updatedAt: new Date().toISOString(),
};

let nextGrantId = 2;
let myCoachGrants: CoachAccessGrant[] = [
  { id: "1", coachEmail: "coach@example.com", grantedAt: "2026-09-01T00:00:00.000Z" },
];

// Clients who granted the caller (as a Coach) access, and their data —
// read-only from this side. "client-jane" mirrors wireframes.dsl's
// ClientProgress seed exactly (same baseline trick as the caller's own Today);
// "client-sam" is a second, differently-shaped client so the screen is not a
// copy-paste of one client. Any other id is "not found" (access not granted),
// exercising coach-views-client-progress.md's alt branch.
const CLIENTS: ClientSummary[] = [
  { id: "client-jane", displayName: "Jane Doe", email: "jane@example.com" },
  { id: "client-sam", displayName: "Sam Lee", email: "sam@example.com" },
];

const CLIENT_GOALS: Record<string, DailyGoal> = {
  "client-jane": { id: "g-jane", calories: 2000, proteinG: 150, carbsG: 220, fatG: 65, updatedAt: TODAY },
  "client-sam": { id: "g-sam", calories: 2400, proteinG: 170, carbsG: 260, fatG: 80, updatedAt: TODAY },
};

const CLIENT_ENTRIES: Record<string, FoodEntry[]> = {
  "client-jane": [
    { id: "cj-1", name: "Oatmeal", loggedDate: TODAY, calories: 300, proteinG: 10, carbsG: 54, fatG: 5, createdAt: TODAY },
    {
      id: "cj-2",
      name: "Chicken breast",
      loggedDate: TODAY,
      calories: 250,
      proteinG: 45,
      carbsG: 0,
      fatG: 6,
      createdAt: TODAY,
    },
  ],
  "client-sam": [
    { id: "cs-1", name: "Greek yogurt", loggedDate: TODAY, calories: 180, proteinG: 20, carbsG: 12, fatG: 4, createdAt: TODAY },
  ],
};

const CLIENT_BASELINE: Record<string, { calories: number; proteinG: number; carbsG: number; fatG: number }> = {
  "client-jane": TODAY_BASELINE,
  "client-sam": { calories: 700, proteinG: 40, carbsG: 60, fatG: 20 },
};

function sumMacros(entries: FoodEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      proteinG: totals.proteinG + entry.proteinG,
      carbsG: totals.carbsG + entry.carbsG,
      fatG: totals.fatG + entry.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

function progressFor(
  date: string,
  entriesForDate: FoodEntry[],
  baseline: { calories: number; proteinG: number; carbsG: number; fatG: number } | null,
  goal: DailyGoalInput | null,
) {
  const sum = sumMacros(entriesForDate);
  const consumed = baseline
    ? {
        calories: sum.calories + baseline.calories,
        proteinG: sum.proteinG + baseline.proteinG,
        carbsG: sum.carbsG + baseline.carbsG,
        fatG: sum.fatG + baseline.fatG,
      }
    : sum;
  const remaining = goal
    ? {
        calories: goal.calories - consumed.calories,
        proteinG: goal.proteinG - consumed.proteinG,
        carbsG: goal.carbsG - consumed.carbsG,
        fatG: goal.fatG - consumed.fatG,
      }
    : null;
  return { date, goal, consumed, remaining };
}

export const handlers = [
  // --- the caller's own food entries ---------------------------------------
  http.get("/api/me/food-entries", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const data = date ? myFoodEntries.filter((entry) => entry.loggedDate === date) : myFoodEntries;
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.post("/api/me/food-entries", async ({ request }) => {
    const input = (await request.json()) as FoodEntryInput;
    if (!input?.name || input.calories == null) {
      return HttpResponse.json({ code: 400, message: "invalid entry" }, { status: 400 });
    }
    const created: FoodEntry = { id: String(nextEntryId++), createdAt: new Date().toISOString(), ...input };
    myFoodEntries = [...myFoodEntries, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/me/food-entries/:entryId", async ({ request, params }) => {
    const input = (await request.json()) as FoodEntryInput;
    const index = myFoodEntries.findIndex((entry) => entry.id === params.entryId);
    if (index === -1) {
      return HttpResponse.json({ code: 404, message: "no such entry" }, { status: 404 });
    }
    const updated: FoodEntry = { ...myFoodEntries[index], ...input };
    myFoodEntries = myFoodEntries.map((entry, i) => (i === index ? updated : entry));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/me/food-entries/:entryId", ({ params }) => {
    const before = myFoodEntries.length;
    myFoodEntries = myFoodEntries.filter((entry) => entry.id !== params.entryId);
    return before === myFoodEntries.length
      ? HttpResponse.json({ code: 404, message: "no such entry" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // --- the caller's own goal ------------------------------------------------
  http.get("/api/me/goal", () => HttpResponse.json({ goal: myGoal })),

  http.put("/api/me/goal", async ({ request }) => {
    const input = (await request.json()) as DailyGoalInput;
    if (input?.calories == null) {
      return HttpResponse.json({ code: 400, message: "invalid goal" }, { status: 400 });
    }
    myGoal = { id: myGoal?.id ?? "goal-1", updatedAt: new Date().toISOString(), ...input };
    return HttpResponse.json(myGoal);
  }),

  // --- the caller's own progress --------------------------------------------
  http.get("/api/me/progress", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? TODAY;
    const entriesForDate = myFoodEntries.filter((entry) => entry.loggedDate === date);
    const baseline = date === TODAY ? TODAY_BASELINE : null;
    return HttpResponse.json(progressFor(date, entriesForDate, baseline, myGoal));
  }),

  // --- coach-access the caller (a Client) has granted -----------------------
  http.get("/api/me/coach-access", () =>
    HttpResponse.json({ count: myCoachGrants.length, next: null, previous: null, data: myCoachGrants }),
  ),

  http.post("/api/me/coach-access", async ({ request }) => {
    const input = (await request.json()) as { coachEmail?: string };
    if (!input?.coachEmail) {
      return HttpResponse.json({ code: 400, message: "invalid coach email" }, { status: 400 });
    }
    const created: CoachAccessGrant = {
      id: String(nextGrantId++),
      coachEmail: input.coachEmail,
      grantedAt: new Date().toISOString(),
    };
    myCoachGrants = [...myCoachGrants, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.delete("/api/me/coach-access/:grantId", ({ params }) => {
    const before = myCoachGrants.length;
    myCoachGrants = myCoachGrants.filter((grant) => grant.id !== params.grantId);
    return before === myCoachGrants.length
      ? HttpResponse.json({ code: 404, message: "no such grant" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // --- clients who granted the caller (a Coach) access ----------------------
  http.get("/api/me/clients", () =>
    HttpResponse.json({ count: CLIENTS.length, next: null, previous: null, data: CLIENTS }),
  ),

  http.get("/api/me/clients/:clientId/food-entries", ({ request, params }) => {
    const clientId = String(params.clientId);
    const all = CLIENT_ENTRIES[clientId];
    if (!all) return HttpResponse.json({ code: 404, message: "no access granted by this client" }, { status: 404 });
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const data = date ? all.filter((entry) => entry.loggedDate === date) : all;
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.get("/api/me/clients/:clientId/goal", ({ params }) => {
    const clientId = String(params.clientId);
    const goal = CLIENT_GOALS[clientId];
    if (!goal) return HttpResponse.json({ code: 404, message: "no access granted by this client" }, { status: 404 });
    return HttpResponse.json({ goal });
  }),

  http.get("/api/me/clients/:clientId/progress", ({ request, params }) => {
    const clientId = String(params.clientId);
    const goal = CLIENT_GOALS[clientId];
    const entries = CLIENT_ENTRIES[clientId];
    if (!goal || !entries) {
      return HttpResponse.json({ code: 404, message: "no access granted by this client" }, { status: 404 });
    }
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? TODAY;
    const entriesForDate = entries.filter((entry) => entry.loggedDate === date);
    const baseline = date === TODAY ? CLIENT_BASELINE[clientId] ?? null : null;
    return HttpResponse.json(progressFor(date, entriesForDate, baseline, goal));
  }),
];
