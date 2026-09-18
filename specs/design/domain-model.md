# Domain Model

Core entities for the macro tracker: a Client's food entries, their ongoing
daily goal, and the read-only access grants that let a Coach view a Client's
data.

```mermaid
erDiagram
    CLIENT ||--o{ FOOD_ENTRY : logs
    CLIENT ||--|| DAILY_GOAL : sets
    CLIENT ||--o{ COACH_ACCESS : grants

    CLIENT {
        string id
        string email
        string displayName
    }
    FOOD_ENTRY {
        string id
        string clientId
        string name
        date loggedDate
        number calories
        number proteinG
        number carbsG
        number fatG
        datetime createdAt
    }
    DAILY_GOAL {
        string id
        string clientId
        number calories
        number proteinG
        number carbsG
        number fatG
        datetime updatedAt
    }
    COACH_ACCESS {
        string id
        string clientId
        string coachEmail
        datetime grantedAt
    }
```

- `CLIENT` is the signed-in user who owns their `FOOD_ENTRY` rows and one
ongoing `DAILY_GOAL`.
- `FOOD_ENTRY.loggedDate` groups entries by day for the daily/history views.
- `COACH_ACCESS` records that the Coach identified by `coachEmail` may read
this Client's entries and goal; a Coach's own account is matched to these
rows by their sign-in email at read time.

