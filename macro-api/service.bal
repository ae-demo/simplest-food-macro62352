import ballerina/http;

listener http:Listener httpListener = new (9090);

service http:InterceptableService / on httpListener {

    public function createInterceptors() returns AssertionInterceptor => new;

    // ---- own-rows reach: /me/food-entries ----

    resource function get me/food\-entries(http:RequestContext ctx, string? date, int 'limit = 20, int offset = 0)
            returns FoodEntryList|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        int safeLimit = clampLimit('limit);
        int safeOffset = clampOffset(offset);
        [FoodEntry[], int] result = check listFoodEntries(caller.userId, date, safeLimit, safeOffset);
        FoodEntry[] entries = result[0];
        int count = result[1];
        map<string> extra = {};
        if date is string {
            extra["date"] = date;
        }
        [string?, string?] links = paginationLinks("/me/food-entries", extra, count, safeLimit, safeOffset);
        return {count, next: links[0], previous: links[1], data: entries};
    }

    resource function post me/food\-entries(http:RequestContext ctx, FoodEntryInput payload)
            returns http:Created|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        check ensureClientRow(caller.userId, identityOf(caller));
        FoodEntry entry = check createFoodEntry(caller.userId, payload);
        return <http:Created>{body: entry};
    }

    resource function put me/food\-entries/[string entryId](http:RequestContext ctx, FoodEntryInput payload)
            returns FoodEntry|http:NotFound|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        FoodEntry? updated = check updateFoodEntry(caller.userId, entryId, payload);
        if updated is () {
            return <http:NotFound>{body: {code: 404, message: "no such entry for the caller"}};
        }
        return updated;
    }

    resource function delete me/food\-entries/[string entryId](http:RequestContext ctx)
            returns http:NoContent|http:NotFound|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        boolean deleted = check deleteFoodEntry(caller.userId, entryId);
        if !deleted {
            return <http:NotFound>{body: {code: 404, message: "no such entry for the caller"}};
        }
        return http:NO_CONTENT;
    }

    // ---- own-rows reach: /me/goal ----

    resource function get me/goal(http:RequestContext ctx) returns DailyGoalOrNone|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        DailyGoal? goal = check findGoal(caller.userId);
        return {goal};
    }

    resource function put me/goal(http:RequestContext ctx, DailyGoalInput payload)
            returns DailyGoal|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        check ensureClientRow(caller.userId, identityOf(caller));
        DailyGoal goal = check upsertGoal(caller.userId, payload);
        return goal;
    }

    // ---- own-rows reach: /me/progress ----

    resource function get me/progress(http:RequestContext ctx, string? date)
            returns ProgressSummary|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        ProgressSummary summary = check buildProgress(caller.userId, date);
        return summary;
    }

    // ---- own-rows reach: /me/coach-access ----

    resource function get me/coach\-access(http:RequestContext ctx, int 'limit = 20, int offset = 0)
            returns CoachAccessGrantList|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        int safeLimit = clampLimit('limit);
        int safeOffset = clampOffset(offset);
        [CoachAccessGrant[], int] result = check listCoachAccessGrants(caller.userId, safeLimit, safeOffset);
        CoachAccessGrant[] grants = result[0];
        int count = result[1];
        [string?, string?] links = paginationLinks("/me/coach-access", {}, count, safeLimit, safeOffset);
        return {count, next: links[0], previous: links[1], data: grants};
    }

    resource function post me/coach\-access(http:RequestContext ctx, CoachAccessInput payload)
            returns http:Created|http:BadRequest|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string coachEmail = payload.coachEmail.trim();
        if coachEmail == "" {
            return <http:BadRequest>{body: {code: 400, message: "coachEmail is required"}};
        }
        check ensureClientRow(caller.userId, identityOf(caller));
        CoachAccessGrant grant = check createCoachAccessGrant(caller.userId, coachEmail);
        return <http:Created>{body: grant};
    }

    resource function delete me/coach\-access/[string grantId](http:RequestContext ctx)
            returns http:NoContent|http:NotFound|http:Unauthorized|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        boolean revoked = check revokeCoachAccessGrant(caller.userId, grantId);
        if !revoked {
            return <http:NotFound>{body: {code: 404, message: "no such grant for the caller"}};
        }
        return http:NO_CONTENT;
    }

    // ---- relation reach (Coach): /me/clients ----

    resource function get me/clients(http:RequestContext ctx, int 'limit = 20, int offset = 0)
            returns ClientSummaryList|http:Unauthorized|http:InternalServerError|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError username = requireCallerUsername(caller);
        if username is http:InternalServerError {
            return username;
        }
        int safeLimit = clampLimit('limit);
        int safeOffset = clampOffset(offset);
        [ClientSummary[], int] result = check listGrantingClients(username, safeLimit, safeOffset);
        ClientSummary[] clients = result[0];
        int count = result[1];
        [string?, string?] links = paginationLinks("/me/clients", {}, count, safeLimit, safeOffset);
        return {count, next: links[0], previous: links[1], data: clients};
    }

    resource function get me/clients/[string clientId]/food\-entries(http:RequestContext ctx, string? date, int 'limit = 20, int offset = 0)
            returns FoodEntryList|http:NotFound|http:Unauthorized|http:InternalServerError|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError username = requireCallerUsername(caller);
        if username is http:InternalServerError {
            return username;
        }
        boolean granted = check coachHasGrant(username, clientId);
        if !granted {
            return <http:NotFound>{body: {code: 404, message: "no access granted by this client"}};
        }
        int safeLimit = clampLimit('limit);
        int safeOffset = clampOffset(offset);
        [FoodEntry[], int] result = check listFoodEntries(clientId, date, safeLimit, safeOffset);
        FoodEntry[] entries = result[0];
        int count = result[1];
        map<string> extra = {};
        if date is string {
            extra["date"] = date;
        }
        [string?, string?] links = paginationLinks("/me/clients/" + clientId + "/food-entries", extra, count, safeLimit, safeOffset);
        return {count, next: links[0], previous: links[1], data: entries};
    }

    resource function get me/clients/[string clientId]/goal(http:RequestContext ctx)
            returns DailyGoalOrNone|http:NotFound|http:Unauthorized|http:InternalServerError|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError username = requireCallerUsername(caller);
        if username is http:InternalServerError {
            return username;
        }
        boolean granted = check coachHasGrant(username, clientId);
        if !granted {
            return <http:NotFound>{body: {code: 404, message: "no access granted by this client"}};
        }
        DailyGoal? goal = check findGoal(clientId);
        return {goal};
    }

    resource function get me/clients/[string clientId]/progress(http:RequestContext ctx, string? date)
            returns ProgressSummary|http:NotFound|http:Unauthorized|http:InternalServerError|error {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller is http:Unauthorized {
            return caller;
        }
        string|http:InternalServerError username = requireCallerUsername(caller);
        if username is http:InternalServerError {
            return username;
        }
        boolean granted = check coachHasGrant(username, clientId);
        if !granted {
            return <http:NotFound>{body: {code: 404, message: "no access granted by this client"}};
        }
        ProgressSummary summary = check buildProgress(clientId, date);
        return summary;
    }
}
