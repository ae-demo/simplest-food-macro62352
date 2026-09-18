// wireframes.dsl "History": the Client's past days of logged food and
// totals vs. goal. macro-api has no per-day history endpoint, so this is one
// bulk call to the caller's food-entries list, grouped by loggedDate, plus
// one call to the goal — never a request per row.
import { useEffect, useState, type JSX } from "react";
import { ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { macroApi } from "../api";
import type { DailyGoalInput, FoodEntry } from "../lib/macros";

interface DayTotals {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function groupByDay(entries: FoodEntry[]): DayTotals[] {
  const byDate = new Map<string, DayTotals>();
  for (const entry of entries) {
    const existing = byDate.get(entry.loggedDate) ?? {
      date: entry.loggedDate,
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    };
    existing.calories += entry.calories;
    existing.proteinG += entry.proteinG;
    existing.carbsG += entry.carbsG;
    existing.fatG += entry.fatG;
    byDate.set(entry.loggedDate, existing);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function vsGoal(day: DayTotals, goal: DailyGoalInput | null): string {
  if (!goal) return "No goal set";
  return day.calories <= goal.calories ? "Met goal" : "Over goal";
}

export function HistoryPage(): JSX.Element {
  const [days, setDays] = useState<DayTotals[]>([]);
  const [goal, setGoal] = useState<DailyGoalInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    void (async () => {
      const [entriesResult, goalResult] = await Promise.all([
        macroApi.GET("/me/food-entries", { params: { query: { limit: 100 } } }),
        macroApi.GET("/me/goal"),
      ]);
      if (!live) return;
      if (entriesResult.data) setDays(groupByDay(entriesResult.data.data));
      if (goalResult.data) setGoal(goalResult.data.goal ?? null);
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>History</PageTitle.Header>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Date</ListingTable.Cell>
              <ListingTable.Cell>Calories</ListingTable.Cell>
              <ListingTable.Cell>Protein</ListingTable.Cell>
              <ListingTable.Cell>Carbs</ListingTable.Cell>
              <ListingTable.Cell>Fat</ListingTable.Cell>
              <ListingTable.Cell>vs. goal</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {days.map((day) => (
              <ListingTable.Row key={day.date}>
                <ListingTable.Cell>{day.date}</ListingTable.Cell>
                <ListingTable.Cell>{day.calories}</ListingTable.Cell>
                <ListingTable.Cell>{day.proteinG}g</ListingTable.Cell>
                <ListingTable.Cell>{day.carbsG}g</ListingTable.Cell>
                <ListingTable.Cell>{day.fatG}g</ListingTable.Cell>
                <ListingTable.Cell>{vsGoal(day, goal)}</ListingTable.Cell>
              </ListingTable.Row>
            ))}
            {days.length === 0 && !loading ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={6}>
                  <ListingTable.EmptyState title="No history yet" description="Log food to build up your history." />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : null}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
