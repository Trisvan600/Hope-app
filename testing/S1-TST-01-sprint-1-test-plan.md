HOPE, Inc. ERP: Sprint 1 Test Plan and Acceptance Criteria
Task ID: S1-TST-01 
Prepared by: Tester (ayangeii) 
Sprint: 1 
Midterm demo: Nov 4 (Login, Register, Reset Password, Main landing page, connected to Supabase)

1. Purpose
This plan describes how the Tester will check that the Sprint 1 features of the HOPE ERP app work correctly and safely before they are marked Done. A task is only verified when the Tester has run its test cases and recorded the result with proof.

2. Scope
In scope (Sprint 1)
Area
Related tasks
Project setup and database connection (app runs, connects to Supabase)
S1-DEV-01, S1-DBA-01
Database base tables, sample data, audit behavior, migration order
S1-DBA-02
Register user (new users start as pending)
S1-DEV-02
Login and logout with session handling, set password on first login, blocked users cannot sign in
S1-DEV-03
Reset password: request, emailed token, reset form (expired and reused token)
S1-DEV-04
Main page: sidebar and module tiles by role and rights, server-side permission check
S1-DEV-08
Repository rules, access, and templates
S1-SM-01 (Issue #32)
Out of scope
• Modules and features planned for later sprints.
• Performance, load, and security penetration testing.
• Browsers other than the one listed in Section 4.
• Final visual polish (covered by the UI/UX usability review, S1-UIX-05).

3. Test approach
1. Manual functional testing of each feature using written test cases (S1-TST-02).
2. Role-based testing: every applicable feature is tested as Superadmin, Admin, and User. The menu, buttons, and server must all follow the same rights.
3. Negative testing: wrong password, empty fields, mismatched passwords, duplicate email, expired link, reused link, blocked user, pending user.
4. Automated smoke test for login and main page (S1-TST-05).
5. Bug reporting and fix verification using GitHub Issues (S1-TST-06). Each fix is retested and marked verified or reopened.
6. Cross-team verification: independent checks of the DBA setup and tables (Issues #17 and #29) and the Scrum Master repository rules (Issue #32), with results commented on each issue.
Each feature is tested when its PR is reviewable. If a feature is not built yet, its result is Not tested. It is never marked Passed.

4. Test environment
Item
Detail
App
HOPE ERP, run locally with npm run dev (usually http://localhost:5173)
Database
Team shared Supabase project (anon key only; service role key is never used)
Code version
The branch of the PR being tested (for example s1-dev-03-login), then main after merge
Browser
Browser used by the Tester (record name and version in results)
Tools
Node.js (LTS), GitHub, Supabase dashboard (view-only)
The branch name is written in every test result so everyone knows which version was tested.

5. Test accounts
Accounts are provided by the DB Admin. Credentials are never written in this repository, in issues, or in results.
Role
Used for
Superadmin
Approve users, designate admins, rights, audit log
Admin
User Management; must not see Superadmin accounts
User
Normal user; limited modules and rights
Blocked user
Must not be able to sign in
Pending user
New registration not yet approved
Some tests need setup by the DB Admin (an expired or already-used reset token, the "last superadmin" guard). These are requested in advance.

6. Acceptance criteria
ID
Feature
Acceptance criteria
AC-01
App setup
The app starts with npm run dev, loads in the browser, and connects to Supabase without errors. Missing env values show a clear message.
AC-02
Database
Base tables and sample data exist; migrations run in the documented order; changes are recorded in the audit log.
AC-03
Register
A valid registration creates a new user with status pending. Empty fields, mismatched passwords, and duplicate emails are rejected with a clear message.
AC-04
Pending users
A pending user cannot sign in until approved by a Superadmin.
AC-05
Login
An approved, unblocked user with correct credentials can sign in and reaches the main page. Wrong password or empty fields show an error and do not sign in.
AC-06
Blocked users
A blocked user cannot sign in.
AC-07
First login
A user with a one-time set-password link can set a password; passwords are not stored or shown in plain text.
AC-08
Logout and session
Logout ends the session and returns to the login page. A page refresh while logged in keeps the session. Protected pages are not reachable after logout.
AC-09
Reset password
A valid email receives a reset link. The link opens the reset form and the new password works. Mismatched passwords are rejected.
AC-10
Reset token rules
An expired link is rejected. An already-used link is rejected.
AC-11
Main page
After login, the sidebar and module tiles show only what the user's role and rights allow. Superadmin, Admin, and User views differ as designed.
AC-12
Permissions
Admin cannot see Superadmin accounts. The server rejects actions the user has no rights for, even if the menu is bypassed.
AC-13
Repository
Branch protection, PR template, and issue template work as described (Issue #32).

7. Pass and fail rules
Result
Meaning
Pass
Actual result matches the expected result, with proof (screenshot or output).
Fail
Actual result differs from expected. A bug is logged (S1-TST-06).
Not tested
The feature is not built yet, is not reviewable, or could not be set up. A reason is written.
A task is only recommended for Done when all its related cases are Pass and no open bug remains. Each result records the branch and the account role used.
8. Bug handling
• Every Fail becomes a GitHub Issue with: title, Task ID and PR link, branch tested, role used (no passwords), numbered steps to reproduce, expected vs. actual result, and a screenshot.
• When the developer pushes a fix, the Tester pulls the update, repeats the steps, and marks the issue verified or reopens it.
• A summary of bugs and their status is kept in testing/bug-log.md.
9. Schedule
Task
Deliverable
Due (sprint day)
S1-TST-01
Test plan and acceptance criteria (this document)
3
S1-TST-02
Test cases: register, login/logout, set and reset password
7
S1-TST-05
Automated smoke test: login and main page
9
S1-TST-06
Bug reports and fix verification
9
Cross-team verification of Issues #17, #29, and #32 is done as soon as those items can be tested. Developer features are tested as each PR becomes reviewable.
10. Entry and exit criteria
Entry (testing of a feature can start):
• The feature's PR is open and its branch builds and runs.
• Test accounts and Supabase access are available.
• Acceptance criteria for the feature are in this plan.
Exit (a feature is verified):
• All its test cases are executed and recorded.
• All Pass, or every Fail has a logged bug and a documented decision.
• Evidence is attached and results are commented on the related issue.
11. Risks and dependencies
Risk
Plan
Features are not finished before the demo
Mark as Not tested and report status honestly.
Reset email limit in Supabase
Do not repeat the reset test many times in a row.
Expired or used token tests need DB setup
Ask the DB Admin early.
Dependency of PR #3 on scaffold PR #2
Test registration after the scaffold is merged or on its branch.
Secrets in the repo (the repo is public)
Never commit .env, keys, or passwords; report any exposure to the Scrum Master immediately.
12. Evidence
Evidence for this task: this document, plus a link to the PR in the sprint sheet. Test execution evidence is attached with the test cases (S1-TST-02) and bug reports (S1-TST-06).

