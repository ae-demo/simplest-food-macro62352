// wireframes.dsl "CoachAccess": Client manages which Coaches can view their
// data. List + revoke + a primary "Grant access" action.
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ListingTable, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { Plus, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { macroApi } from "../api";
import type { CoachAccessGrant } from "../lib/macros";

export function CoachAccessPage(): JSX.Element {
  const navigate = useNavigate();
  const [grants, setGrants] = useState<CoachAccessGrant[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(): Promise<void> {
    const { data } = await macroApi.GET("/me/coach-access");
    if (data) setGrants(data.data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleRevoke(grantId: string): Promise<void> {
    const { error } = await macroApi.DELETE("/me/coach-access/{grantId}", {
      params: { path: { grantId } },
    });
    if (!error) await load();
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Coach access</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/coach-access/grant")}>
            Grant access
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Coach email</ListingTable.Cell>
              <ListingTable.Cell>Granted</ListingTable.Cell>
              <ListingTable.Cell />
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {grants.map((grant) => (
              <ListingTable.Row key={grant.id}>
                <ListingTable.Cell>{grant.coachEmail}</ListingTable.Cell>
                <ListingTable.Cell>{grant.grantedAt.slice(0, 10)}</ListingTable.Cell>
                <ListingTable.Cell>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={() => void handleRevoke(grant.id)}
                  >
                    Revoke
                  </Button>
                </ListingTable.Cell>
              </ListingTable.Row>
            ))}
            {grants.length === 0 && !loading ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <ListingTable.EmptyState title="No coaches yet" description="Grant a coach access to review your progress." />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : null}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>
    </PageContent>
  );
}
