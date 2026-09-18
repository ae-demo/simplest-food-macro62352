// wireframes.dsl "Today": the Client's food log and progress for the current
// day. Stat cards + a food-entries table with an Edit link per row, and a
// primary "Log food" action.
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus, Pencil } from "@wso2/oxygen-ui-icons-react";
import { macroApi } from "../api";
import { Can } from "../authz/gates";
import { todayISODate } from "../lib/date";
import type { FoodEntry, ProgressSummary } from "../lib/macros";
import { MacroStatCards } from "../components/MacroStatCards";

export function TodayPage(): JSX.Element {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    void load();
    return () => {
      live = false;
    };

    async function load(): Promise<void> {
      const date = todayISODate();
      const [progressResult, entriesResult] = await Promise.all([
        macroApi.GET("/me/progress", { params: { query: { date } } }),
        macroApi.GET("/me/food-entries", { params: { query: { date, limit: 100 } } }),
      ]);
      if (!live) return;
      if (progressResult.data) setProgress(progressResult.data);
      if (entriesResult.data) setEntries(entriesResult.data.data);
      setLoading(false);
    }
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Today</PageTitle.Header>
      </PageTitle>

      {!loading && progress && !progress.goal ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't set a daily goal yet. Set one on the Goal screen to see your progress.
        </Alert>
      ) : null}

      {progress ? <MacroStatCards progress={progress} /> : null}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Food entries</Typography>
        <Can op="POST /me/food-entries">
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/today/log")}>
            Log food
          </Button>
        </Can>
      </Stack>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Name</ListingTable.Cell>
              <ListingTable.Cell>Calories</ListingTable.Cell>
              <ListingTable.Cell>Protein</ListingTable.Cell>
              <ListingTable.Cell>Carbs</ListingTable.Cell>
              <ListingTable.Cell>Fat</ListingTable.Cell>
              <ListingTable.Cell />
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {entries.map((entry) => (
              <ListingTable.Row key={entry.id}>
                <ListingTable.Cell>{entry.name}</ListingTable.Cell>
                <ListingTable.Cell>{entry.calories}</ListingTable.Cell>
                <ListingTable.Cell>{entry.proteinG}g</ListingTable.Cell>
                <ListingTable.Cell>{entry.carbsG}g</ListingTable.Cell>
                <ListingTable.Cell>{entry.fatG}g</ListingTable.Cell>
                <ListingTable.Cell>
                  <Can op="PUT /me/food-entries/{entryId}">
                    <Button
                      size="small"
                      startIcon={<Pencil size={16} />}
                      onClick={() => navigate(`/today/entries/${entry.id}/edit`, { state: { entry } })}
                    >
                      Edit
                    </Button>
                  </Can>
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
            {entries.length === 0 && !loading ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={6}>
                  <ListingTable.EmptyState title="No food logged today" description="Log your first entry to start tracking." />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : null}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
