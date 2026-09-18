import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

function toFoodEntry(FoodEntryRow row) returns FoodEntry => {
    id: row.id,
    createdAt: time:utcToString(row.createdAt),
    name: row.name,
    loggedDate: row.loggedDate,
    calories: row.calories,
    proteinG: row.proteinG,
    carbsG: row.carbsG,
    fatG: row.fatG
};

function listFoodEntries(string clientId, string? loggedDate, int 'limit, int offset) returns [FoodEntry[], int]|error {
    sql:ParameterizedQuery whereClause = `client_id = ${clientId}`;
    if loggedDate is string {
        whereClause = sql:queryConcat(whereClause, ` AND logged_date = ${loggedDate}::date`);
    }
    CountRow countRow = check dbClient->queryRow(sql:queryConcat(`SELECT COUNT(*) AS count FROM food_entries WHERE `, whereClause));
    stream<FoodEntryRow, sql:Error?> rows = dbClient->query(sql:queryConcat(
        `SELECT id, client_id AS "clientId", name, logged_date::text AS "loggedDate",
                calories, protein_g AS "proteinG", carbs_g AS "carbsG", fat_g AS "fatG",
                created_at AS "createdAt"
         FROM food_entries WHERE `,
        whereClause,
        ` ORDER BY logged_date DESC, created_at DESC LIMIT ${'limit} OFFSET ${offset}`
    ));
    FoodEntry[] entries = [];
    check from FoodEntryRow r in rows
        do {
            entries.push(toFoodEntry(r));
        };
    check rows.close();
    return [entries, countRow.count];
}

function createFoodEntry(string clientId, FoodEntryInput input) returns FoodEntry|error {
    string id = uuid:createRandomUuid();
    time:Utc createdAt = time:utcNow();
    sql:TimestampValue createdAtValue = new (createdAt);
    _ = check dbClient->execute(`
        INSERT INTO food_entries (id, client_id, name, logged_date, calories, protein_g, carbs_g, fat_g, created_at)
        VALUES (${id}, ${clientId}, ${input.name}, ${input.loggedDate}::date,
                ${input.calories}, ${input.proteinG}, ${input.carbsG}, ${input.fatG}, ${createdAtValue})
    `);
    return {
        id,
        createdAt: time:utcToString(createdAt),
        name: input.name,
        loggedDate: input.loggedDate,
        calories: input.calories,
        proteinG: input.proteinG,
        carbsG: input.carbsG,
        fatG: input.fatG
    };
}

function updateFoodEntry(string clientId, string entryId, FoodEntryInput input) returns FoodEntry?|error {
    sql:ExecutionResult result = check dbClient->execute(`
        UPDATE food_entries
        SET name = ${input.name}, logged_date = ${input.loggedDate}::date,
            calories = ${input.calories}, protein_g = ${input.proteinG},
            carbs_g = ${input.carbsG}, fat_g = ${input.fatG}
        WHERE id = ${entryId} AND client_id = ${clientId}
    `);
    int? affected = result.affectedRowCount;
    if affected is () || affected == 0 {
        return ();
    }
    FoodEntryRow row = check dbClient->queryRow(`
        SELECT id, client_id AS "clientId", name, logged_date::text AS "loggedDate",
               calories, protein_g AS "proteinG", carbs_g AS "carbsG", fat_g AS "fatG",
               created_at AS "createdAt"
        FROM food_entries WHERE id = ${entryId} AND client_id = ${clientId}
    `);
    return toFoodEntry(row);
}

function deleteFoodEntry(string clientId, string entryId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`
        DELETE FROM food_entries WHERE id = ${entryId} AND client_id = ${clientId}
    `);
    int? affected = result.affectedRowCount;
    return affected is int && affected > 0;
}

// Totals for one client on one day — used both for the caller's own progress
// and for a Coach's granted read of a client's progress.
function foodTotalsFor(string clientId, string loggedDate) returns MacroTotals|error {
    MacroTotalsRow row = check dbClient->queryRow(`
        SELECT COALESCE(SUM(calories), 0) AS calories,
               COALESCE(SUM(protein_g), 0) AS "proteinG",
               COALESCE(SUM(carbs_g), 0) AS "carbsG",
               COALESCE(SUM(fat_g), 0) AS "fatG"
        FROM food_entries WHERE client_id = ${clientId} AND logged_date = ${loggedDate}::date
    `);
    return {
        calories: row.calories ?: 0,
        proteinG: row.proteinG ?: 0,
        carbsG: row.carbsG ?: 0,
        fatG: row.fatG ?: 0
    };
}
