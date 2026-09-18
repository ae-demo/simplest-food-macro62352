import ballerina/time;

// Records mirroring specs/design/components/macro-api/openapi.yaml schemas.

public type ErrorPayload record {|
    int code;
    string message;
    string description?;
    string moreInfo?;
|};

public type FoodEntryInput record {|
    string name;
    string loggedDate;
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
|};

public type FoodEntry record {|
    string id;
    string createdAt;
    string name;
    string loggedDate;
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
|};

public type FoodEntryList record {|
    int count;
    string? next;
    string? previous;
    FoodEntry[] data;
|};

public type DailyGoalInput record {|
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
|};

public type DailyGoal record {|
    string id;
    string updatedAt;
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
|};

public type DailyGoalOrNone record {|
    DailyGoal? goal = ();
|};

public type MacroTotals record {|
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
|};

public type ProgressSummary record {|
    string date;
    DailyGoalInput? goal;
    MacroTotals consumed;
    MacroTotals? remaining;
|};

public type CoachAccessInput record {|
    string coachEmail;
|};

public type CoachAccessGrant record {|
    string id;
    string coachEmail;
    string grantedAt;
|};

public type CoachAccessGrantList record {|
    int count;
    string? next;
    string? previous;
    CoachAccessGrant[] data;
|};

public type ClientSummary record {|
    string id;
    string displayName;
    string email?;
|};

public type ClientSummaryList record {|
    int count;
    string? next;
    string? previous;
    ClientSummary[] data;
|};

// Internal row shapes, matched to the DB columns.

type FoodEntryRow record {|
    string id;
    string clientId;
    string name;
    string loggedDate;
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
    time:Utc createdAt;
|};

type DailyGoalRow record {|
    string id;
    string clientId;
    decimal calories;
    decimal proteinG;
    decimal carbsG;
    decimal fatG;
    time:Utc updatedAt;
|};

type CoachAccessRow record {|
    string id;
    string clientId;
    string coachEmail;
    time:Utc grantedAt;
|};

type ClientRow record {|
    string id;
    string email;
    string displayName;
|};

type CountRow record {|
    int count;
|};

type MacroTotalsRow record {|
    decimal? calories;
    decimal? proteinG;
    decimal? carbsG;
    decimal? fatG;
|};
