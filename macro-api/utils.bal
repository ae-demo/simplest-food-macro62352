import ballerina/time;

// The identity label stored on a CLIENT row when it is first seen — the
// gateway assertion carries no `email` claim, only `sub` (userId) and
// `username` (the login name), so the login name stands in for it.
function identityOf(GatewayCaller caller) returns string => caller.username != "" ? caller.username : caller.userId;

function clampLimit(int requested) returns int {
    if requested <= 0 {
        return 20;
    }
    if requested > 100 {
        return 100;
    }
    return requested;
}

function clampOffset(int requested) returns int => requested < 0 ? 0 : requested;

function todayDate() returns string {
    time:Utc now = time:utcNow();
    time:Civil civil = time:utcToCivil(now);
    return civilDateString(civil);
}

function civilDateString(time:Civil civil) returns string {
    string month = civil.month < 10 ? "0" + civil.month.toString() : civil.month.toString();
    string day = civil.day < 10 ? "0" + civil.day.toString() : civil.day.toString();
    return civil.year.toString() + "-" + month + "-" + day;
}

// Relative next/previous URIs for a paginated collection response.
function paginationLinks(string basePath, map<string> extraParams, int count, int 'limit, int offset) returns [string?, string?] {
    string? next = ();
    string? previous = ();
    if offset + 'limit < count {
        next = pageUri(basePath, extraParams, 'limit, offset + 'limit);
    }
    if offset > 0 {
        int prevOffset = offset - 'limit;
        if prevOffset < 0 {
            prevOffset = 0;
        }
        previous = pageUri(basePath, extraParams, 'limit, prevOffset);
    }
    return [next, previous];
}

function pageUri(string basePath, map<string> extraParams, int 'limit, int offset) returns string {
    string qs = "limit=" + 'limit.toString() + "&offset=" + offset.toString();
    foreach [string, string] [k, v] in extraParams.entries() {
        if v != "" {
            qs = qs + "&" + k + "=" + v;
        }
    }
    return basePath + "?" + qs;
}
