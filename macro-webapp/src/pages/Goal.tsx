// wireframes.dsl "Goal": set or update the caller's ongoing daily goal.
// Prefilled from GET /me/goal (nullable — no goal yet); the screen's `loads`
// is the write, since saving is what this screen exists for.
import { useEffect, useState, type JSX, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField, Typography } from "@wso2/oxygen-ui";
import { macroApi } from "../api";

export function GoalPage(): JSX.Element {
  const navigate = useNavigate();
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await macroApi.GET("/me/goal");
      const goal = data?.goal;
      if (goal) {
        setCalories(String(goal.calories));
        setProteinG(String(goal.proteinG));
        setCarbsG(String(goal.carbsG));
        setFatG(String(goal.fatG));
      }
    })();
  }, []);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const { error: apiError } = await macroApi.PUT("/me/goal", {
      body: {
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
        <PageTitle.Header>Daily goal</PageTitle.Header>
      </PageTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Applies to every day until you change it
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <Form.Section>
          <Form.Stack>
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

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={saving}>
            Save goal
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
