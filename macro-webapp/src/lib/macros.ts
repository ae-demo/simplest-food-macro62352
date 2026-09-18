import type { components } from "../generated/macro-api";

export type FoodEntry = components["schemas"]["FoodEntry"];
export type DailyGoalInput = components["schemas"]["DailyGoalInput"];
export type ProgressSummary = components["schemas"]["ProgressSummary"];
export type CoachAccessGrant = components["schemas"]["CoachAccessGrant"];
export type ClientSummary = components["schemas"]["ClientSummary"];

export interface MacroStat {
  readonly label: string;
  readonly consumed: number;
  readonly goal: number | null;
  readonly unit: string;
}

/** The four stat cards every progress screen draws, in wireframe order. */
export function macroStats(progress: ProgressSummary): MacroStat[] {
  const goal = progress.goal;
  return [
    { label: "Calories", consumed: progress.consumed.calories, goal: goal?.calories ?? null, unit: "" },
    { label: "Protein", consumed: progress.consumed.proteinG, goal: goal?.proteinG ?? null, unit: "g" },
    { label: "Carbs", consumed: progress.consumed.carbsG, goal: goal?.carbsG ?? null, unit: "g" },
    { label: "Fat", consumed: progress.consumed.fatG, goal: goal?.fatG ?? null, unit: "g" },
  ];
}

export function remainingLabel(stat: MacroStat): string {
  if (stat.goal === null) return "no goal set";
  const remaining = stat.goal - stat.consumed;
  const rounded = Math.round(remaining);
  return remaining >= 0 ? `${rounded}${stat.unit} remaining` : `${Math.abs(rounded)}${stat.unit} over`;
}
