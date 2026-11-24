# HOPE App Smoke Tests (S1-TST-05)

Automated smoke tests (Playwright) for login and the main page of the HOPE App.
They give a quick check that the essential features still work after changes.

## What is covered
| ID | Check |
|----|-------|
| SMOKE-01 | A user can log in successfully (the Log out button is shown) |
| SMOKE-02 | The main page loads after login (welcome message and Log out button) |
| SMOKE-03 | The main page shows navigation (sidebar) and module tiles |

## Prerequisites
- Node.js (LTS) and Git
- The HOPE App code and its own `.env` (Supabase URL and anon key from the DB Admin)
- A **test** account that can log in (ask the DB Admin). Never use a real person's account.

## Setup (one time)
1. Start the HOPE App from its folder (the one with its `package.json`):
   ```
   npm install
   npm run dev
   ```
   Note the address it prints, for example `http://localhost:5173`.
2. In a second terminal, go to this folder (`testing/smoke`) and run:
   ```
   npm install
   npx playwright install chromium
   ```
3. Create a file named `.env` in this folder with these four lines, using your own values:
   ```
   BASE_URL=http://localhost:5173
   LOGIN_PATH=/login
   TEST_EMAIL=<test account email>
   TEST_PASSWORD=<test account password>
   ```
   Never commit or upload `.env`. The repo is public.

## Run the tests
Keep the app running, then in this folder:
```
npm test
```
To open the HTML report afterwards:
```
npm run report
```
On a slow computer the timeout in `playwright.config.js` is set to 120000 ms.

## If the UI changes
Selectors are in the `SELECTORS` block of `tests/smoke.spec.js`. Update them there.
Module tiles are expected to have `data-testid="module-tile"`.

## Results

**Run 1: 2026-11-09 (about 6:11 AM)**
- Branch tested: `s1-dev-08-main-page` (downloaded as a ZIP from GitHub)
- Account used: Admin test account
- Total time: 1.5 minutes

| Test | Result | Notes |
|------|--------|-------|
| SMOKE-01 Login | PASS | |
| SMOKE-02 Main page loads after login | PASS | Shows the welcome message, account card, and Log out button |
| SMOKE-03 Navigation and module tiles | FAIL | No navigation element or module tiles found on the main page. Depends on S1-DEV-08 (Issue #16). Logged as BUG-01 under S1-TST-06 |

**Summary:** 2 passed, 1 failed.

An earlier run had SMOKE-01 time out while setting up the browser (the computer was slow
and the 30 second timeout was too short). It was not an app problem. After raising the
timeout it passed.

**Next run:** repeat after the sidebar and module tiles are delivered. SMOKE-03 should then pass.
