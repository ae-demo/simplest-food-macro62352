// wireframes.dsl "EditFoodEntry": edit or delete a logged food entry.
// The API has no single-entry GET, so the entry arrives as router state from
// the Today screen's Edit link; a direct visit (no state) falls back to one
// list call and finds it by id — the entry stays the caller's own row either
// way, resolved through /me/food-entries.
import { useEffect, useState, type JSX, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { macroApi } from "../api";
import type { FoodEntry } from "../lib/macros";

export function EditFoodEntryPage(): JSX.Element {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const location = useLocation();
  const stateEntry = (location.state as { entry?: FoodEntry } | null)?.entry;

  const [entry, setEntry] = useState<FoodEntry | null>(stateEntry ?? null);
  const [name, setName] = useState(stateEntry?.name ?? "");
  const [calories, setCalories] = useState(stateEntry ? String(stateEntry.calories) : "");
  const [proteinG, setProteinG] = useState(stateEntry ? String(stateEntry.proteinG) : "");
  const [carbsG, setCarbsG] = useState(stateEntry ? String(stateEntry.carbsG) : "");
  const [fatG, setFatG] = useState(stateEntry ? String(stateEntry.fatG) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry || !entryId) return;
    void (async () => {
      const { data } = await macroApi.GET("/me/food-entries", { params: { query: { limit: 100 } } });
      const found = data?.data.find((item) => item.id === entryId) ?? null;
      if (found) {
        setEntry(found);
        setName(found.name);
        setCalories(String(found.calories));
        setProteinG(String(found.proteinG));
        setCarbsG(String(found.carbsG));
        setFatG(String(found.fatG));
      }
    })();
  }, [entry, entryId]);

  async function handleSave(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!entryId || !entry) return;
    setError(null);
    setSaving(true);
    const { error: apiError } = await macroApi.PUT("/me/food-entries/{entryId}", {
      params: { path: { entryId } },
      body: {
        name,
        loggedDate: entry.loggedDate,
        calories: Number(calories),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        fatG: Number(fatG),
      },
    });
    setSaving(false);
    if (apiError) {
      setError(apiError.message);
      return;
    }
    navigate("/today");
  }

  async function handleDelete(): Promise<void> {
    if (!entryId) return;
    setError(null);
    const { error: apiError } = await macroApi.DELETE("/me/food-entries/{entryId}", {
      params: { path: { entryId } },
    });
    if (apiError) {
      setError(apiError.message);
      return;
    }
    navigate("/today");
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Edit food entry</PageTitle.Header>
      </PageTitle>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <form onSubmit={(event) => void handleSave(event)}>
        <Form.Section>
          <Form.Stack>
            <TextField label="Food name" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField
              label="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
            <TextField
              label="Protein (g)"
              type="number"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value)}
              required
            />
            <TextField
              label="Carbs (g)"
              type="number"
              value={carbsG}
              onChange={(e) => setCarbsG(e.target.value)}
              required
            />
            <TextField label="Fat (g)" type="number" value={fatG} onChange={(e) => setFatG(e.target.value)} required />
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="outlined" color="error" onClick={() => void handleDelete()}>
            Delete
          </Button>
          <Button type="submit" variant="contained" disabled={saving || !entry}>
            Save changes
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
