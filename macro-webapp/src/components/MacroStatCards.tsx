// The four stat cards every progress screen draws (Today, ClientProgress).
// A three-line card ("Label | Value | Caption") has no StatCard slot for the
// caption, so this is Card > CardContent > three Typography's, per
// oxygen-ui-design-system's wireframe mapping table.
import { Card, CardContent, Grid, Typography } from "@wso2/oxygen-ui";
import type { JSX } from "react";
import { macroStats, remainingLabel, type ProgressSummary } from "../lib/macros";

export function MacroStatCards({ progress }: { progress: ProgressSummary }): JSX.Element {
  const stats = macroStats(progress);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat) => (
        <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h4">
                {Math.round(stat.consumed)}
                {stat.unit} {stat.goal !== null ? `/ ${Math.round(stat.goal)}${stat.unit}` : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {remainingLabel(stat)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
