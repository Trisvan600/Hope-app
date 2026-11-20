# S2-TST-05: Regression test of Sprint 1

Tester: Ariah
Covers: Sprint 1 features (login, registration, password reset, session and access, main page, user approval and blocking), the automated smoke tests (S1-TST-05) and the Sprint 1 bug fixes (S1-TST-06), rerun on the Sprint 2 build to check that nothing broke.
Branch tested: [fill in]
App address: [fill in, e.g. http://localhost:5173]

> How to use: run the app on the branch above, follow each case, then change **Not run** to **Pass** or **Fail**.
> Leave "Not run" for anything you did not run yourself. Never write passwords in this file or in a bug Issue.
> If you wrote other Sprint 1 test cases (S1-TST-01 to S1-TST-04), add the ones that are still relevant to this table.

## A. Login
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-01 | Login page loads | None | 1. Open the app address. | The login page shows Email, Password, Log in, Forgot password and Register. | Not run |
| REG-02 | Valid login reaches the main page | Superadmin | 1. Enter valid details. 2. Click Log in. | The main page (Overview) opens. | Not run |
| REG-03 | Wrong password | Any | 1. Enter a wrong password. 2. Click Log in. | A clear error is shown. The user is not logged in. | Not run |
| REG-04 | Empty fields | None | 1. Click Log in with both fields empty. | A message asks for the missing fields. | Not run |
| REG-05 | Blocked user cannot sign in | Blocked user | 1. Try to log in. | Sign in is refused with a clear message. | Not run |
| REG-06 | Pending user cannot sign in | Pending user | 1. Try to log in. | Sign in is refused because the account is not approved yet. | Not run |

## B. Registration and password
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-07 | Register a new user | New test user | 1. Open Register. 2. Fill all fields. 3. Submit. | The account is created and is pending approval. | Not run |
| REG-08 | Mismatched passwords | None | 1. Enter different Password and Confirm password. 2. Submit. | The form is rejected with a message. | Not run |
| REG-09 | Forgot password page | None | 1. Open Forgot password. 2. Enter an email. 3. Click Send reset link. | A message says the reset link was sent. (Do not repeat this many times, emails are limited per hour.) | Not run |

## C. Session and access
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-10 | Log out | Any | 1. Click Log out. | The user is sent to the login page. | Not run |
| REG-11 | Logged-out user cannot open the dashboard | None | 1. Log out. 2. Type the dashboard address in the browser. | The user is sent to the login page. | Not run |
| REG-12 | Reload keeps the session | Any | 1. Log in. 2. Refresh the page. | The user stays logged in. | Not run |

## D. Main page
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-13 | Main page loads after login | Superadmin | 1. Log in. | The Overview page loads with the greeting and the summary tiles. No error. | Not run |
| REG-14 | Sidebar matches the role | Superadmin and User | 1. Log in as each role. | The sidebar shows only the modules that role may use. | Not run |
| REG-15 | Shortcuts open the right pages | Superadmin | 1. Click each sidebar item and each shortcut button. | Each one opens the matching page. | Not run |
| REG-16 | Header shows the HOPE name | Any | 1. Look at the header and the login page. | The app name is HopeApp / Hope, not "Midterm App". | Not run |

## E. User management basics
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-17 | Approve a pending user | Superadmin | 1. Open Pending Approvals. 2. Approve a pending user. 3. Log in as that user. | The user can now log in. | Not run |
| REG-18 | Block and unblock a user | Superadmin | 1. Block a user. 2. Try to log in as them. 3. Unblock. 4. Try again. | Blocked: refused. Unblocked: login works. | Not run |

## F. Automated smoke tests (S1-TST-05)
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-19 | Rerun the smoke tests | Superadmin | 1. Start the app. 2. In `testing/smoke` run `npm test`. | SMOKE-01, SMOKE-02 and SMOKE-03 all pass. Record any failure and whether the app or the test is at fault. | Not run |

## G. Sprint 1 bug retests (S1-TST-06)
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| REG-20 | BUG-01 (Issue #62): main page has sidebar and module tiles | Superadmin | 1. Log in. 2. Look at the main page. | A sidebar and module tiles or shortcuts are shown. | Not run |
| REG-21 | BUG-02 (Issue #63): header name | Any | 1. Look at the header. | The header shows the HOPE app name, not "Midterm App". | Not run |

## Screenshot evidence
Upload screenshots to the `testing/` folder. Crop out emails and cover usernames or emails where they appear.
Name pattern: `S2-TST-05_<test case>_<short-description>.png`

| Test case | Screenshot needed | File name |
|-----------|-------------------|-----------|
| REG-01 | The login page | `S2-TST-05_REG-01_login-page.png` |
| REG-02, REG-13, REG-16, REG-20, REG-21 | The main page after login (Overview with sidebar and tiles, HopeApp name) | `S2-TST-05_REG-13_main-page.png` |
| REG-19 | Terminal result of `npm test` | `S2-TST-05_REG-19_smoke-results.png` |

## Results summary
| Date | Branch | Total | Passed | Failed | Not run | Bugs logged |
|------|--------|-------|--------|--------|---------|-------------|
| | | 21 | | | 21 | |

Failed cases: write each one as a GitHub Issue (Tester Guide, section 7) and list the Issue number here.
