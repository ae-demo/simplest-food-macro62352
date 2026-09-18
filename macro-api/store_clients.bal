import ballerina/sql;

// Upserts the CLIENT row for the caller of a `/me/...` operation. userId
// (the assertion's `sub`) is the row key; email/displayName are the caller's
// login identity — the only identity the gateway assertion carries.
function ensureClientRow(string clientId, string identity) returns error? {
    _ = check dbClient->execute(`
        INSERT INTO clients (id, email, display_name)
        VALUES (${clientId}, ${identity}, ${identity})
        ON CONFLICT (id) DO UPDATE SET email = ${identity}, display_name = ${identity}
    `);
    return;
}

function findClientById(string clientId) returns ClientRow|error? {
    ClientRow|sql:Error row = dbClient->queryRow(`
        SELECT id, email, display_name AS "displayName"
        FROM clients WHERE id = ${clientId}
    `);
    if row is sql:NoRowsError {
        return ();
    }
    return row;
}

// Every client who has granted the given coach an active access grant, most
// recently granted first.
function listGrantingClients(string coachEmail, int 'limit, int offset) returns [ClientSummary[], int]|error {
    CountRow countRow = check dbClient->queryRow(`
        SELECT COUNT(*) AS count
        FROM coach_access ca JOIN clients c ON c.id = ca.client_id
        WHERE ca.coach_email = ${coachEmail}
    `);
    stream<ClientRow, sql:Error?> rows = dbClient->query(`
        SELECT c.id, c.email, c.display_name AS "displayName"
        FROM coach_access ca JOIN clients c ON c.id = ca.client_id
        WHERE ca.coach_email = ${coachEmail}
        ORDER BY ca.granted_at DESC
        LIMIT ${'limit} OFFSET ${offset}
    `);
    ClientSummary[] summaries = [];
    check from ClientRow r in rows
        do {
            summaries.push({id: r.id, displayName: r.displayName, email: r.email});
        };
    check rows.close();
    return [summaries, countRow.count];
}

// Whether the coach has an active grant from this client — the one check
// every relation-reach handler makes before answering anything about
// clientId's rows.
function coachHasGrant(string coachEmail, string clientId) returns boolean|error {
    CountRow row = check dbClient->queryRow(`
        SELECT COUNT(*) AS count FROM coach_access
        WHERE coach_email = ${coachEmail} AND client_id = ${clientId}
    `);
    return row.count > 0;
}
