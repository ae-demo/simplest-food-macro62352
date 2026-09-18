screen Today "Client's food log and progress for the current day"
  navbar "Macro Tracker"
  sidebar "Today -> Today | History -> History | Goal -> Goal | Coach access -> CoachAccess"
  heading "Today"
  row
    card "Calories | 1450 / 2000 | 550 remaining"
    card "Protein | 80g / 150g | 70g remaining"
    card "Carbs | 140g / 220g | 80g remaining"
    card "Fat | 40g / 65g | 25g remaining"
  row
    heading "Food entries"
    right
    button "Log food" primary -> LogFoodEntry
  table "Name | Calories | Protein | Carbs | Fat | "
    row "Oatmeal | 300 | 10g | 54g | 5g | Edit -> EditFoodEntry"
    row "Chicken breast | 250 | 45g | 0g | 6g | Edit -> EditFoodEntry"

screen LogFoodEntry "Log a new food entry"
  navbar "Macro Tracker"
  heading "Log food"
  input "Food name"
  input "Calories"
  input "Protein (g)"
  input "Carbs (g)"
  input "Fat (g)"
  row
    button "Cancel" -> Today
    right
    button "Save entry" primary -> Today

screen EditFoodEntry "Edit or delete a logged food entry"
  navbar "Macro Tracker"
  heading "Edit food entry"
  input "Food name"
  input "Calories"
  input "Protein (g)"
  input "Carbs (g)"
  input "Fat (g)"
  row
    button "Delete" danger -> Today
    right
    button "Save changes" primary -> Today

screen History "Client's past days of logged food and totals"
  navbar "Macro Tracker"
  sidebar "Today -> Today | History -> History | Coach access -> CoachAccess"
  heading "History"
  table "Date | Calories | Protein | Carbs | Fat | vs. goal"
    row "2026-09-17 | 1980 | 145g | 210g | 60g | Met goal"
    row "2026-09-16 | 2200 | 130g | 240g | 70g | Over goal"

screen Goal "Set or update the caller's ongoing daily goal"
  navbar "Macro Tracker"
  sidebar "Today -> Today | History -> History | Coach access -> CoachAccess"
  heading "Daily goal"
  text "Applies to every day until you change it"
  input "Calories"
  input "Protein (g)"
  input "Carbs (g)"
  input "Fat (g)"
  row
    right
    button "Save goal" primary -> Today

screen CoachAccess "Client manages which Coaches can view their data"
  navbar "Macro Tracker"
  sidebar "Today -> Today | History -> History | Coach access -> CoachAccess"
  row
    heading "Coach access"
    right
    button "Grant access" primary -> GrantCoachAccess
  table "Coach email | Granted | "
    row "coach@example.com | 2026-09-01 | Revoke"

screen GrantCoachAccess "Grant a Coach access by email"
  navbar "Macro Tracker"
  heading "Grant coach access"
  input "Coach's email"
  row
    button "Cancel" -> CoachAccess
    right
    button "Grant access" primary -> CoachAccess

screen ClientsList "Coach's list of Clients who granted access"
  navbar "Macro Tracker"
  sidebar "Clients -> ClientsList"
  heading "Your clients"
  table "Client | Granted | "
    row "Jane Doe | 2026-09-01 | View -> ClientProgress"
    row "Sam Lee | 2026-08-20 | View -> ClientProgress"

screen ClientProgress "Coach's read-only view of a client's log and goal progress"
  navbar "Macro Tracker"
  sidebar "Clients -> ClientsList"
  breadcrumb "Clients / Jane Doe"
  row
    card "Calories | 1450 / 2000 | 550 remaining"
    card "Protein | 80g / 150g | 70g remaining"
    card "Carbs | 140g / 220g | 80g remaining"
    card "Fat | 40g / 65g | 25g remaining"
  heading "Food entries"
  table "Name | Calories | Protein | Carbs | Fat"
    row "Oatmeal | 300 | 10g | 54g | 5g"
    row "Chicken breast | 250 | 45g | 0g | 6g"

flow "Log food and track progress"
  role "Client"
  description "A Client logs food and checks today's progress against their goal"
  Today
  LogFoodEntry
  EditFoodEntry
  History
  Goal

flow "Manage coach access"
  role "Client"
  description "A Client grants or revokes a Coach's read-only access to their data"
  CoachAccess
  GrantCoachAccess

flow "Review a client's progress"
  role "Coach"
  description "A Coach reviews the progress of Clients who granted them access"
  ClientsList
  ClientProgress
