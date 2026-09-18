// Shared by the caller's own /me/progress and a Coach's granted read of a
// client's progress — same computation, different clientId source.
function buildProgress(string clientId, string? dateParam) returns ProgressSummary|error {
    string date = dateParam is string ? dateParam : todayDate();
    MacroTotals consumed = check foodTotalsFor(clientId, date);
    DailyGoal? goal = check findGoal(clientId);
    DailyGoalInput? goalInput = ();
    MacroTotals? remaining = ();
    if goal is DailyGoal {
        goalInput = {calories: goal.calories, proteinG: goal.proteinG, carbsG: goal.carbsG, fatG: goal.fatG};
        remaining = {
            calories: goal.calories - consumed.calories,
            proteinG: goal.proteinG - consumed.proteinG,
            carbsG: goal.carbsG - consumed.carbsG,
            fatG: goal.fatG - consumed.fatG
        };
    }
    return {date, goal: goalInput, consumed, remaining};
}
