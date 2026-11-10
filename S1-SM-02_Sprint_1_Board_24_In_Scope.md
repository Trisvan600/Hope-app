# HOPE, Inc. ERP — Sprint 1 Board

**Task ID:** S1-SM-02  
**Prepared by:** Scrum Master  
**Sprint duration:** 2 weeks (10 sprint working days)  
**Planning sources:** Professor-provided Sprint Task Plan and HOPE, Inc. ERP Student Guide

## 1. Sprint 1 goal

Prepare the application and database foundation and deliver the Sprint 1 user-account workflow needed for the midterm demonstration: registration, login/logout, password reset, and the main landing page connected to Supabase. Track all **24 in-scope Sprint 1 tasks** assigned across the five team roles.

> Scope note: The professor's task materials distinguish 24 in-scope tasks from 6 out-of-scope tasks. The six excluded tasks remain visible in the scope note at the end; they are not counted as Sprint 1 commitments in this board.

## 2. Board workflow

Use these columns in the team's tracking board:

1. **Backlog** — identified but not yet ready.
2. **To Do** — ready to be started.
3. **In Progress** — actively being worked on.
4. **In Review** — awaiting teammate review.
5. **Done** — verified and merged.

**Completion rule:** Do not mark a task Done just because a PR was opened. The professor's task plan treats merged work as done. Link each task to its GitHub issue and PR.

## 3. Six-module roadmap across four sprints

The Student Guide identifies six ERP modules. The sprint placement below follows the professor's task plan:

| Sprint | Weeks | Module(s) | Planned focus |
|---|---:|---|---|
| Sprint 1 | 1–2 | User Management foundation | App/database foundation, accounts, registration, login, password reset, roles/rights foundation, role-aware main page |
| Sprint 2 | 3–4 | Customers; Products | Customer management and product catalogue |
| Sprint 3 | 5–6 | Human Resources | Departments, jobs, employees and job history |
| Sprint 4 | 7–8 | Sales; Reports | Sales transactions, payments/balances and reports |

**Scheduling note:** The guide's suggested technical build order discusses dependencies and integration. The sprint allocation above follows the professor's task plan. User Management permissions should continue to be applied and tested as later modules are developed.

## 4. Sprint 1 in-scope task board — 24 tasks

The task titles below are shortened for board readability. Preserve the original task IDs when creating GitHub issues and PRs. Acceptance criteria are practical checks derived from each task description; follow any more specific instructor/team criteria if provided.

### Developer — 5 tasks

| Task ID | Task | Due day | Acceptance criteria |
|---|---|---:|---|
| S1-DEV-01 | Project scaffold, environment configuration and database connection | 2 | App skeleton runs; configuration is documented without committing secrets; app connects to the configured database/Supabase environment. |
| S1-DEV-02 | Register form and API; new users start as pending | 4 | Valid registration submits successfully; invalid input is handled; newly registered account has pending status. |
| S1-DEV-03 | Login/logout, sessions, password hashing, first-login set-password and blocked-user check | 6 | Login/logout work; sessions are handled; passwords are hashed; first-login password setup works; blocked users cannot log in. |
| S1-DEV-04 | Reset-password request, emailed token and reset form | 7 | User can request reset; token is sent; valid token permits reset; expired/used token is rejected. |
| S1-DEV-08 | Main page with role/rights-aware sidebar and tiles; server-side permission check | 9 | Main page shows permitted navigation/tiles; server rejects unauthorized actions even if UI is bypassed. |

### Database Administrator — 5 tasks

| Task ID | Task | Due day | Acceptance criteria |
|---|---|---:|---|
| S1-DBA-01 | Team database setup, migration runner and setup README (no Docker) | 2 | Teammates can follow README to configure DB and run migrations; process does not require Docker. |
| S1-DBA-02 | Migration for HOPE base tables and sample data from supplied SQL | 3 | Migration creates required base tables/sample data; process is repeatable using documented steps. |
| S1-DBA-03 | Migration for app_user, role, module, rights catalogue and user_permission | 4 | Required user/role/module/rights/permission structures are created according to the task specification. |
| S1-DBA-04 | Password-reset token table | 5 | Table stores hashed reset token and includes expiry and used-state fields. |
| S1-DBA-05 | Seed Superadmin accounts, modules, rights and default roles | 5 | Required accounts, module rows, rights and default roles are seeded; no passwords/secrets are committed; first password setup uses the specified secure process. |

### Tester — 4 tasks

| Task ID | Task | Due day | Acceptance criteria |
|---|---|---:|---|
| S1-TST-01 | Sprint 1 test plan and acceptance criteria | 3 | Test plan covers Sprint 1 scope; test cases have clear expected results and trace to tasks. |
| S1-TST-02 | Register, login/logout, set/reset password test cases | 7 | Tests cover registration, login/logout, first-login setup, reset-token expiry and reuse. |
| S1-TST-05 | Automated smoke test: login and main page | 9 | Automated smoke test verifies successful login and main-page loading. |
| S1-TST-06 | Bug reports and fix verification | 9 | Bugs have reproducible steps and expected/actual results; fixes are retested and recorded. |

### UI/UX Designer — 5 tasks

| Task ID | Task | Due day | Acceptance criteria |
|---|---|---:|---|
| S1-UIX-01 | Design system: colors, typography and core components | 2 | Design system documents selected colors, typography and reusable components. |
| S1-UIX-02 | Wireframes: login, register and set/reset password | 3 | Wireframes cover login, registration, set-password and reset-password flows and are shared with Developer. |
| S1-UIX-03 | Wireframes: main page, User Management list and Rights dialog | 4 | Wireframes show these screens and relevant role-based states, even if some screens are outside the current in-scope implementation. |
| S1-UIX-04 | High-fidelity mockups and developer handoff notes | 6 | Mockups and handoff notes cover the agreed Sprint 1 screen scope and explain layout/interactions. |
| S1-UIX-05 | Usability review and fix list | 9 | Built screens are reviewed and usability issues are recorded in a prioritized list. |

### Scrum Master — 5 tasks

| Task ID | Task | Due day | Acceptance criteria |
|---|---|---:|---|
| S1-SM-01 | Repository setup: branch protection, PR and issue templates | 1 | Required repository rules protect the default branch; PR and issue templates are available and usable. |
| S1-SM-02 | Sprint 1 board: stories with acceptance criteria; six-module sprint map | 1 | Sprint 1's 24 in-scope tasks are organized by role and task ID; stories have checkable acceptance criteria; all six modules are mapped across four sprints/eight weeks; board is shared with team. |
| S1-SM-03 | Team working agreement, Definition of Done and role guide | 2 | Agreement records team working/communication expectations; DoD defines completion; role guide explains responsibilities. |
| S1-SM-04 | Mid-sprint check notes and impediment log | 5 | Day-5 check records progress; blockers have owner, action and status; unresolved impediments are visible. |
| S1-SM-05 | Sprint 1 review and retrospective report | 10 | Report compares planned work with merged work; records demo/review outcomes, positives, improvements and action items. |

## 5. Sprint 1 due-day guide

The professor's plan uses sprint working days. Do not convert these to calendar dates unless the team confirms the Sprint 1 start date.

| Due day | Sprint position |
|---:|---|
| 1–5 | Week 1, Days 1–5 |
| 6–10 | Week 2, Days 1–5 |

Day 5 is the mid-sprint check. Day 10 is the sprint review and retrospective.

## 6. November 4 presentation focus

The team has been told to prepare a demonstration of:

1. Login
2. Register
3. Reset Password
4. Main landing page after successful login, connected to Supabase

Keep these as the immediate demo checklist. They are a presentation focus, not four extra tasks to add to the 24-task Sprint 1 count. Do not assume they are the only grading criteria unless the professor confirms that.

## 7. Out-of-scope tasks — track separately, do not count among the 24

The task plan identifies these six tasks as out of scope for the current Sprint 1 commitment:

- S1-DEV-05 — User Management screen: list, add, edit, block/unblock
- S1-DEV-06 — Superadmin approval/designation of Admins and last-Superadmin protection
- S1-DEV-07 — Per-action Rights dialog and audit logging
- S1-DBA-06 — `audit_user()` and audit-log testing
- S1-TST-03 — User Management test cases
- S1-TST-04 — Permission-matrix tests

Keep them visible as **Out of Scope / Future Work** if useful for transparency, but do not include them in the 24-task Sprint 1 commitment unless the professor changes the scope.

## 8. Working rules

- Keep the professor's spreadsheet as the official task/status/PR-link record.
- Use each task ID in the corresponding GitHub issue and PR title.
- Link every PR to its issue.
- A task becomes Done after its PR is approved, merged and verified.
- Record blockers and scope decisions in the board and Scrum Master's impediment log.
- Never commit passwords, `.env` files, access tokens or other secrets.
- The acceptance criteria in this board are proposed, testable interpretations of task descriptions; confirm any additional instructor-specific criteria with the team.
