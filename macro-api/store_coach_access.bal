import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

function toCoachAccessGrant(CoachAccessRow row) returns CoachAccessGrant => {
    id: row.id,
    coachEmail: row.coachEmail,
    grantedAt: time:utcToString(row.grantedAt)
};

function listCoachAccessGrants(string clientId, int 'limit, int offset) returns [CoachAccessGrant[], int]|error {
    CountRow countRow = check dbClient->queryRow(`
        SELECT COUNT(*) AS count FROM coach_access WHERE client_id = ${clientId}
    `);
    stream<CoachAccessRow, sql:Error?> rows = dbClient->query(`
        SELECT id, client_id AS "clientId", coach_email AS "coachEmail", granted_at AS "grantedAt"
        FROM coach_access WHERE client_id = ${clientId}
        ORDER BY granted_at DESC LIMIT ${'limit} OFFSET ${offset}
    `);
    CoachAccessGrant[] grants = [];
    check from CoachAccessRow r in rows
        do {
            grants.push(toCoachAccessGrant(r));
        };
    check rows.close();
    return [grants, countRow.count];
}

function createCoachAccessGrant(string clientId, string coachEmail) returns CoachAccessGrant|error {
    string id = uuid:createRandomUuid();
    time:Utc grantedAt = time:utcNow();
    sql:TimestampValue grantedAtValue = new (grantedAt);
    _ = check dbClient->execute(`
        INSERT INTO coach_access (id, client_id, coach_email, granted_at)
        VALUES (${id}, ${clientId}, ${coachEmail}, ${grantedAtValue})
    `);
    return {id, coachEmail, grantedAt: time:utcToString(grantedAt)};
}

function revokeCoachAccessGrant(string clientId, string grantId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`
        DELETE FROM coach_access WHERE id = ${grantId} AND client_id = ${clientId}
    `);
    int? affected = result.affectedRowCount;
    return affected is int && affected > 0;
}
