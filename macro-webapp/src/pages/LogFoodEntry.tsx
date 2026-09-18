// wireframes.dsl "LogFoodEntry": log a new food entry. A write-only form —
// its screen `loads` names the create operation (see src/authz/screens.ts).
import { useState, type JSX, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { macroApi } from "../api";
import { todayISODate } from "../lib/date";

export function LogFoodEntryPage(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const { error: apiError } = await macroApi.POST("/me/food-entries", {
      body: {
        name,
        loggedDate: todayISODate(),
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

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Log food</PageTitle.Header>
      </PageTitle>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)}>
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
            <TextField
              label="Fat (g)"
              type="number"
              value={fatG}
              onChange={(e) => setFatG(e.target.value)}
              required
            />
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate("/today")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Save entry
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
