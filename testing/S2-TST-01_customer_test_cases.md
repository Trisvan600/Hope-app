# S2-TST-01: Test cases for the customer module

Tester: Ariah
Covers: customer listing, searching, creating, editing and permissions (S2-DEV-01, S2-DEV-02)
Branch tested: [fill in, e.g. s2-dev-01-customer-list]
App address: [fill in, e.g. http://localhost:5173]

> How to use: run the app on the branch above, follow each test case's steps exactly, then fill in the
> Result column with **Pass** or **Fail** and the account used. Leave "Not run" until you really run it.
> Field names (name, email, payTerms, etc.) are examples. Change them to match the real form.
> Never write passwords in this file or in a bug Issue.

## Test accounts (roles only)
Superadmin, Admin, User (view rights), User (no customer rights). Get them from the DB Admin.

## A. Customer list
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUS-01 | List page loads | Admin | 1. Log in. 2. Open the Customers module. | The customer list is shown with the expected columns. No error message. | Not run |
| CUS-02 | List shows only active customers | Admin | 1. Open the Customers list. 2. Compare with the database (view-only Supabase Table Editor). | Inactive (soft-deleted) customers are not in the active list. | Not run |
| CUS-03 | Empty state | Admin | 1. Search for a name that does not exist. | A clear "no customers found" message is shown, not a blank or broken page. | Not run |

## B. Search and filter
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUS-04 | Search by full name | Admin | 1. Type a full customer name in search. | Only matching customers are shown. | Not run |
| CUS-05 | Search by partial name | Admin | 1. Type the first 3 letters of a customer name. | Customers containing those letters are shown. | Not run |
| CUS-06 | Search is not case sensitive | Admin | 1. Search the same name in UPPERCASE and lowercase. | Both return the same results. | Not run |
| CUS-07 | Clear search | Admin | 1. Search for a name. 2. Clear the box. | The full list is shown again. | Not run |
| CUS-08 | Filter works | Admin | 1. Choose a filter option (for example payment terms). | Only customers matching the filter are shown. | Not run |
| CUS-09 | Search and filter together | Admin | 1. Apply a filter. 2. Also type a search. | Results match both. | Not run |

## C. Create customer
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUS-10 | Create with valid data | Admin | 1. Click Add customer. 2. Fill every field with valid data. 3. Save. | The customer is saved and appears in the list. | Not run |
| CUS-11 | Empty required fields | Admin | 1. Open the create form. 2. Leave required fields empty. 3. Save. | The form is not saved and shows which fields are required. | Not run |
| CUS-12 | Invalid email | Admin | 1. Enter an email like "abc". 2. Save. | A validation message is shown. Nothing is saved. | Not run |
| CUS-13 | Invalid payment terms | Admin | 1. Enter an invalid payTerms value (if it is a free-text field). 2. Save. | The value is rejected with a clear message. | Not run |
| CUS-14 | Cancel create | Admin | 1. Open the form. 2. Type some data. 3. Cancel. | Nothing is saved and the list is unchanged. | Not run |

## D. Edit customer
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUS-15 | Edit and save | Admin | 1. Open a customer to edit. 2. Change one field. 3. Save. | The change is saved and shown in the list. | Not run |
| CUS-16 | Edit form shows current data | Admin | 1. Open a customer to edit. | All fields are filled with the saved values. | Not run |
| CUS-17 | Edit with invalid data | Admin | 1. Clear a required field or enter an invalid email. 2. Save. | The change is rejected with a message. The old data stays. | Not run |
| CUS-18 | Cancel edit | Admin | 1. Change a field. 2. Cancel. | The old data stays. | Not run |

## E. Permissions (view, create and edit access)
Per-right Add/Edit/Delete tests are covered in S2-TST-04. These cases only check access to the module.
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUS-19 | User with view right sees the list | User (view right) | 1. Log in. 2. Open Customers. | The list is shown. | Not run |
| CUS-20 | User without customer rights | User (no customer rights) | 1. Log in. 2. Look at the menu. | The Customers module is not shown. | Not run |
| CUS-21 | Direct address is also blocked | User (no customer rights) | 1. Type the customers page address in the browser. | Access is denied or redirected. The data is not shown. | Not run |
| CUS-22 | Logged-out user | None | 1. Log out. 2. Open the customers page address. | The user is sent to the login page. | Not run |

## Screenshot evidence
Screenshots are uploaded to the `testing/` folder in GitHub, next to this file.
Crop out emails, passwords and User IDs before uploading (the repo is public).

| Test case | Screenshot needed | File name |
|-----------|-------------------|-----------|
| CUS-01 | Customer list view (the list as it appears) | `S2-TST-01_CUS-01_customer-list.png` |

(More rows can be added here as more screenshots are required, using the same name pattern
`S2-TST-01_<test case>_<short-description>.png`.)

## Results summary
| Date | Branch | Total | Passed | Failed | Not run | Bugs logged |
|------|--------|-------|--------|--------|---------|-------------|
| | | 22 | | | 22 | |

Failed cases: write each one as a GitHub Issue (see the Tester Guide, section 7) and list the Issue number here.
