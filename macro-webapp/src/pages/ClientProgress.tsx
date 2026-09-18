// wireframes.dsl "ClientProgress": Coach's READ-ONLY view of a client's log
// and goal progress (story 13). No log/edit controls exist anywhere on this
// screen, by construction — there is nothing here that writes.
import { useEffect, useState, type JSX } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AppBreadcrumbs, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { useNavigate } from "react-router-dom";
import { macroApi } from "../api";
import { todayISODate } from "../lib/date";
import type { ClientSummary, FoodEntry, ProgressSummary } from "../lib/macros";
import { MacroStatCards } from "../components/MacroStatCards";

export function ClientProgressPage(): JSX.Element {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const client = (location.state as { client?: ClientSummary } | null)?.client;

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let live = true;
    void (async () => {
      const date = todayISODate();
      const [progressResult, entriesResult] = await Promise.all([
        macroApi.GET("/me/clients/{clientId}/progress", {
          params: { path: { clientId }, query: { date } },
        }),
        macroApi.GET("/me/clients/{clientId}/food-entries", {
          params: { path: { clientId }, query: { date, limit: 100 } },
        }),
      ]);
      if (!live) return;
      if (progressResult.response.status === 404) {
        setNotFound(true);
        return;
      }
      if (progressResult.data) setProgress(progressResult.data);
      if (entriesResult.data) setEntries(entriesResult.data.data);
    })();
    return () => {
      live = false;
    };
  }, [clientId]);

  return (
    <PageContent>
      <AppBreadcrumbs
        items={[
          { key: "clients", label: "Clients", onClick: () => navigate("/clients") },
          { key: "client", label: client?.displayName ?? clientId ?? "" },
        ]}
      />

      <PageTitle sx={{ mt: 2 }}>
        <PageTitle.Header>{client?.displayName ?? "Client progress"}</PageTitle.Header>
      </PageTitle>

      {notFound ? (
        <p>This client has not granted you access, or has revoked it.</p>
      ) : (
        <>
          {progress ? <MacroStatCards progress={progress} /> : null}

          <PageTitle sx={{ mb: 2 }}>
            <PageTitle.Header>Food entries</PageTitle.Header>
          </PageTitle>

          <ListingTable.Container>
            <ListingTable>
              <ListingTable.Head>
                <ListingTable.Row>
                  <ListingTable.Cell>Name</ListingTable.Cell>
                  <ListingTable.Cell>Calories</ListingTable.Cell>
                  <ListingTable.Cell>Protein</ListingTable.Cell>
                  <ListingTable.Cell>Carbs</ListingTable.Cell>
                  <ListingTable.Cell>Fat</ListingTable.Cell>
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
                  </ListingTable.Row>
                ))}
                {entries.length === 0 ? (
                  <ListingTable.Row>
                    <ListingTable.Cell colSpan={5}>
                      <ListingTable.EmptyState title="No food logged" description="This client has not logged food today." />
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ) : null}
              </ListingTable.Body>
            </ListingTable>
          </ListingTable.Container>
        </>
      )}
    </PageContent>
  );
}
