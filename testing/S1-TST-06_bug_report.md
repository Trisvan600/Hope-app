# Sprint 1 Bug Report and Fix Verification (S1-TST-06)

Tester: Ariah | Date found: 2026-11-09

Branch tested: `s1-dev-08-main-page` (downloaded as a ZIP from GitHub)

Account used: Admin test account

How found: manual check and automated smoke test (see `testing/smoke/README.md`, task S1-TST-05)

## BUG-01: Main page has no sidebar or module tiles
- **Related task:** S1-DEV-08 (Issue #16, PR #6)
- **Responsible developer:** Prince (Developer)
- **Severity:** High (a required part of the main page is missing)
- **Steps to reproduce:**
  1. Start the app with `npm run dev` on branch `s1-dev-08-main-page`.
  2. Open the login page.
  3. Log in with the admin test account.
  4. Look at the main page after login.
- **Expected result:** The main page shows a role-sensitive sidebar and module tiles, as described in Issue #16.
- **Actual result:** The main page shows a welcome message, an account card, and a Log out button. No navigation element and no module tiles are shown.
- **Evidence:** Automated test SMOKE-03 fails (`getByRole('navigation')` element not found). Screenshots of the test report and the main page are attached to the PR.
- **Status:** Open
- **Retest result:** Not retested yet. Waiting for a fix.

## BUG-02: App header shows the wrong name
- **Related task:** S1-DEV-08 (Issue #16, PR #6)
- **Responsible developer:** Prince (Developer)
- **Severity:** Low (cosmetic)
- **Steps to reproduce:**
  1. Start the app on branch `s1-dev-08-main-page` and log in.
  2. Look at the header at the top left of the main page.
- **Expected result:** The header shows the HOPE App name.
- **Actual result:** The header says "Midterm App".
- **Status:** Open
- **Retest result:** Not retested yet. Waiting for a fix.

## Fix verification summary
| Bug | Severity | Reported to | Fix submitted | Retest | Result |
|-----|----------|-------------|---------------|--------|--------|
| BUG-01 | High | Prince | Not yet | Pending | Open |
| BUG-02 | Low | Prince | Not yet | Pending | Open |

Remaining issues: both bugs are open. They will be retested when Prince pushes a fix.
To retest, run `npm test` in `testing/smoke` and check the main page by hand. Record the new result here.
