# Feature: Workdays for Team Members

- Team members should support an optional `schedule` field in their YAML data files under `content/data/team/`
- Workdays must be configurable with half-day precision
- Supported weekdays should be `monday` to `sunday`
- Supported periods per day should be `morning` and `afternoon`
- The data structure should allow one or both periods per day
- The YAML content must be validated through the existing JSON schema for team data

- The workdays should be displayed on the team member detail page in a compact calendar-like view
- The calendar should show weekdays as columns and half-days as two rows
- Morning and afternoon should be visually distinguishable
- Saturday and Sunday should only be shown when a member actually has workdays on those days
- The calendar should only be rendered when a member has a schedule configured

- The feature must be fully localized
- Labels for the schedule title and half-days should come from `content/i18n/*.yaml`
- Weekday labels should use the existing localized weekday translations from the i18n files
- The `team` section must be treated as a canonical section key, while the path segment itself must be translatable per language

- The rendering and behavior must be consistent across both team member detail routes:
  - the canonical team-member route using the localized team section segment
  - `app/[locale]/[section]/[slug]/page.tsx`
- The `[section]` route must resolve the localized path segment for the canonical `team` section through the existing i18n/route mapping
- Language-specific routing must not result in different workday UI behavior