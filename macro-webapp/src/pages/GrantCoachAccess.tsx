// wireframes.dsl "GrantCoachAccess": grant a Coach access by email.
import { useState, type JSX, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { macroApi } from "../api";

export function GrantCoachAccessPage(): JSX.Element {
  const navigate = useNavigate();
  const [coachEmail, setCoachEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const { error: apiError } = await macroApi.POST("/me/coach-access", {
      body: { coachEmail },
    });
    setSaving(false);
    if (apiError) {
      setError(apiError.message);
      return;
    }
    navigate("/coach-access");
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Grant coach access</PageTitle.Header>
      </PageTitle>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <Form.Section>
          <Form.Stack>
            <TextField
              label="Coach's email"
              type="email"
              value={coachEmail}
              onChange={(e) => setCoachEmail(e.target.value)}
              required
            />
          </Form.Stack>
        </Form.Section>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate("/coach-access")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Grant access
          </Button>
        </Stack>
      </form>
    </PageContent>
  );
}
