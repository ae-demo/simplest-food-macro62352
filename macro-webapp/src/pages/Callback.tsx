// The OIDC redirect target. Not a wireframe screen — Thunder SSO owns
// sign-in, and this route only completes the code exchange and lands the
// user back at the app root, where SignedIn (src/App.tsx) picks their role's
// landing screen.
import { useEffect, useState, type JSX } from "react";
import { Box, Stack, Typography } from "@wso2/oxygen-ui";
import { handleCallback } from "../authz/session";

export function CallbackPage(): JSX.Element {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback()
      .then(() => window.location.assign("/"))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      });
  }, []);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Stack spacing={1} alignItems="center">
        <Typography variant="h6">Signing you in…</Typography>
        {error ? (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
