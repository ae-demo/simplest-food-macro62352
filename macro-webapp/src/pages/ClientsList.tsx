// wireframes.dsl "ClientsList": Coach's list of Clients who granted access.
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { Eye } from "@wso2/oxygen-ui-icons-react";
import { macroApi } from "../api";
import type { ClientSummary } from "../lib/macros";

export function ClientsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data } = await macroApi.GET("/me/clients", { params: { query: { limit: 100 } } });
      if (!live) return;
      if (data) setClients(data.data);
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Your clients</PageTitle.Header>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Client</ListingTable.Cell>
              <ListingTable.Cell />
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {clients.map((client) => (
              <ListingTable.Row
                key={client.id}
                clickable
                onClick={() => navigate(`/clients/${client.id}`, { state: { client } })}
              >
                <ListingTable.Cell>{client.displayName}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Button size="small" startIcon={<Eye size={16} />}>
                    View
                  </Button>
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
            {clients.length === 0 && !loading ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={2}>
                  <ListingTable.EmptyState
                    title="No clients yet"
                    description="Clients who grant you access will show up here."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : null}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
