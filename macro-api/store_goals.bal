import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

function toDailyGoal(DailyGoalRow row) returns DailyGoal => {
    id: row.id,
    updatedAt: time:utcToString(row.updatedAt),
    calories: row.calories,
    proteinG: row.proteinG,
    carbsG: row.carbsG,
    fatG: row.fatG
};

function findGoal(string clientId) returns DailyGoal?|error {
    DailyGoalRow|sql:Error row = dbClient->queryRow(`
        SELECT id, client_id AS "clientId", calories, protein_g AS "proteinG",
               carbs_g AS "carbsG", fat_g AS "fatG", updated_at AS "updatedAt"
        FROM daily_goals WHERE client_id = ${clientId}
    `);
    if row is sql:NoRowsError {
        return ();
    }
    if row is error {
        return row;
    }
    return toDailyGoal(row);
}

function upsertGoal(string clientId, DailyGoalInput input) returns DailyGoal|error {
    string id = uuid:createRandomUuid();
    time:Utc updatedAt = time:utcNow();
    sql:TimestampValue updatedAtValue = new (updatedAt);
    _ = check dbClient->execute(`
        INSERT INTO daily_goals (id, client_id, calories, protein_g, carbs_g, fat_g, updated_at)
        VALUES (${id}, ${clientId}, ${input.calories}, ${input.proteinG}, ${input.carbsG}, ${input.fatG}, ${updatedAtValue})
        ON CONFLICT (client_id) DO UPDATE SET
            calories = ${input.calories}, protein_g = ${input.proteinG},
            carbs_g = ${input.carbsG}, fat_g = ${input.fatG}, updated_at = ${updatedAtValue}
    `);
    DailyGoal? saved = check findGoal(clientId);
    if saved is () {
        return error("goal upsert did not persist for client " + clientId);
    }
    return saved;
}
