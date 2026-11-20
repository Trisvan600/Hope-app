Sprint 2 Bug Report and Fix Verification (S2-TST-06)

Tester: Ariah | 
Date: 2026-11-11 
Branch / build tested:  
Account used: Super Admin test account 
This report updates the Sprint 1 bug report (S1-TST-06_bug_report.md) and covers the Sprint 2 testing (S2-TST-01 to S2-TST-05).

1. Summary
Sprint 1 bugs reported: 2 (BUG-01, BUG-02). Both were retested on the Sprint 2 build and are fixed and verified.
New bugs found in Sprint 2 testing: none so far in the test cases that were run.
Not every case has been run. Cases marked "Not run" in S2-TST-01 to S2-TST-05 are still untested, so this does not mean the rest of the app is free of bugs. New bugs will be added here and as GitHub Issues.
2. Sprint 1 bugs and fix verification
BUG-01: Main page has no sidebar or module tiles (GitHub Issue #62)
Related task: S1-DEV-08 (Issue #16)
Responsible developer: Prince (Developer)
Severity: High
Reported: Sprint 1, tagged to Prince in the Issue
Original steps to reproduce:
Log in with the Admin test account on branch s1-dev-08-main-page.
Look at the main page.
Original expected / actual: Expected a sidebar and module tiles. Actual: only a welcome message, an account card and a Log out button.
Retest steps:
Start the app on the build above.
Log in with the Super Admin test account.
Look at the main page.
Retest result: The Overview page shows a sidebar (Overview, Products, Customers, Users, Pending Approvals) and summary tiles and shortcut buttons (Total users, Pending approvals, Customers, Products).
Evidence: S2-TST-06_BUG-01_sidebar-tiles.png
Status: Fixed and verified (2026-11-11)
BUG-02: App header shows the wrong name (GitHub Issue #63)
Related task: S1-DEV-08 (Issue #16)
Responsible developer: Prince (Developer)
Severity: Low
Reported: Sprint 1, tagged to Prince in the Issue
Original steps to reproduce:
Log in on branch s1-dev-08-main-page.
Look at the header at the top left.
Original expected / actual: Expected the HOPE app name. Actual: "Midterm App".
Retest steps:
Open the login page and look at the header.
Log in and look at the sidebar header.
Retest result: The login page header shows "Hope" and the sidebar header shows "HopeApp". "Midterm App" no longer appears.
Evidence: S2-TST-06_BUG-02_hope-login.png
Status: Fixed and verified (2026-11-11)
3. Sprint 2 bugs

No new bugs were found in the test cases that were run (see the results in S2-TST-01 to S2-TST-05).

When a case fails, it is written as a GitHub Issue (Tester Guide, section 7) with: title, task and PR, branch tested, account used (role only), numbered steps, expected vs actual, and a screenshot. The developer is tagged. The fix is retested and the result is added to the table below.

4. Fix verification summary
Bug	Severity	Reported to	Issue	Fix submitted	Retest date	Result
BUG-01	High	Prince	#62	Yes	2026-11-11	Fixed and verified
BUG-02	Low	Prince	#63	Yes	2026-11-11	Fixed and verified
5. Remaining issues
No known open bugs from the cases run.
