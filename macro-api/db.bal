import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

final postgresql:Client dbClient = check new (
    host = macroDbHost,
    port = check int:fromString(macroDbPort),
    database = macroDbName,
    username = macroDbUser,
    password = macroDbPassword
);

// Runs before any listener starts, so a schema failure fails the service fast.
final () dbSchemaReady = check initSchema();

function initSchema() returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            display_name TEXT NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS food_entries (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL REFERENCES clients(id),
            name TEXT NOT NULL,
            logged_date DATE NOT NULL,
            calories NUMERIC NOT NULL,
            protein_g NUMERIC NOT NULL,
            carbs_g NUMERIC NOT NULL,
            fat_g NUMERIC NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS daily_goals (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL UNIQUE REFERENCES clients(id),
            calories NUMERIC NOT NULL,
            protein_g NUMERIC NOT NULL,
            carbs_g NUMERIC NOT NULL,
            fat_g NUMERIC NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS coach_access (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL REFERENCES clients(id),
            coach_email TEXT NOT NULL,
            granted_at TIMESTAMPTZ NOT NULL
        )
    `);
    _ = check dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_food_entries_client ON food_entries(client_id)
    `);
    _ = check dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_coach_access_client ON coach_access(client_id)
    `);
    _ = check dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_coach_access_email ON coach_access(coach_email)
    `);
    return;
}
