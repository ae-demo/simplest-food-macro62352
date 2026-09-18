# Simplest Food Macro Tracker — PRD

## Problem Statement

People who want to watch what they eat — whether for weight management,
performance, or working with a coach — need a fast way to record what they ate
and see how it stacks up against a daily target. Spreadsheets and general
fitness apps are slow to log into and cluttered with features (recipes,
barcode scanners, social feeds) that get in the way of the one thing that
matters: log a food, see the day's totals against a goal.

## Solution

A minimal macro tracker where a Client logs each food they eat by hand —
name plus calories, protein, carbs and fat — against a daily goal they set
themselves, and sees running totals and remaining amounts for the day. A
Client can optionally grant a Coach read-only access to their log and goal
progress, so the Coach can support them without needing to log in as them.

## Actors

- **Client** — signs in, logs their own food entries, sets and updates their
daily calorie/macro goal, reviews their day-by-day history, and controls
which Coaches can see their data.
- **Coach** — signs in, and views (read-only) the log and goal progress of
any Client who has granted them access. Cannot log food or edit goals on a
Client's behalf.

## User Stories

1. As a Client, I want to sign in securely, so that my food log and goals are private to me.
2. As a Client, I want to manually log a food entry with its name, calories, protein, carbs and fat, so that I can track what I eat.
3. As a Client, I want to edit or delete a food entry I logged, so that I can correct mistakes.
4. As a Client, I want to see my food entries grouped by day, so that I can review everything I logged on a given date.
5. As a Client, I want to set a daily calorie and macro (protein/carbs/fat) goal, so that I have a target to track against.
6. As a Client, I want to update my daily goal at any time, so that it stays current as my needs change.
7. As a Client, I want to see today's progress — consumed vs. goal, and how much is remaining — for calories and each macro, so that I know how close I am to my targets.
8. As a Client, I want to view my logging history over past days, so that I can see trends over time.
9. As a Client, I want to grant a Coach access to my log and goal progress, so that they can support me.
10. As a Client, I want to revoke a Coach's access, so that I control who sees my data.
11. As a Coach, I want to sign in securely, so that I can access only the Clients who granted me access.
12. As a Coach, I want to see the list of Clients who have granted me access, so that I know whose data I can view.
13. As a Coach, I want to view a Client's daily log and goal progress read-only, so that I can support them without changing their data.

## Product Decisions

- **Sign-in**: every user (Client and Coach) signs in via SSO through Thunder, the platform identity provider — an organization default.
- **Food entry method**: manual entry only — a Client types the food name and its calories/protein/carbs/fat by hand. No nutrition database lookup or search is used.
- **Daily goal**: one ongoing daily target per Client (calories, protein, carbs, fat) that applies to every day until the Client changes it — it is not set separately per day.
- **Coach access grant**: a Client grants a Coach access by entering the Coach's existing sign-in email address; no invitation email is sent — the Coach sees the Client appear in their list once granted, next time they sign in.
- **Coach scope**: a Coach may be granted access by any number of Clients, and sees all of them in one list. *assumed*
- **Notifications**: none — no email, push or other notification channel is part of this product. *assumed*

## Out of Scope

- Searching or auto-filling macros from a food/nutrition database.
- Recipes, meal planning, or saved/favorite foods.
- Barcode scanning.
- Exercise or activity tracking.
- Calorie or macro goal recommendations/calculators — the Client enters their own target.
- Coach editing a Client's log or goal, or messaging/commenting between Coach and Client.
- Any notification (email, push, etc.) to Coach or Client.

## Open Questions

*(none — all decisions needed to write this PRD were either answered or assumed above)*

