# S2-TST-04: Per-right permission tests for customer and product (Add/Edit/Delete, price rights)

Tester: Ariah
Covers: View, Create, Edit and Delete rights checked one at a time for the Customers module, the Products module and price history (S2-DEV-01 to S2-DEV-08)
Branch tested: [fill in]
App address: [fill in, e.g. http://localhost:5173]

> How to use: use the **Users** page, then **Rights**, to set the rights for a test user. Log in as that user
> and follow each case. Change **Not run** to **Pass** or **Fail**. Leave "Not run" for anything you did not run yourself.
> The Rights dialog has the modules User Management, Customers and Products, and the boxes View, Create, Edit, Delete, All.
> Never write passwords in this file or in a bug Issue.

## Test accounts (roles only)
Superadmin (sets the rights), plus a normal test User whose rights you change for each case.
Ask the DB Admin or the Developer which product right controls price history actions (Create, Edit, Delete of a price).

## A. Rights screen
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| RGT-01 | Rights dialog shows modules and boxes | Superadmin | 1. Open Users. 2. Click Rights on a user. | The dialog lists User Management, Customers and Products with View, Create, Edit, Delete and All boxes. | Not run |
| RGT-02 | The "All" box | Superadmin | 1. Tick All for Customers. 2. Untick it. | Ticking All ticks all four boxes. Unticking clears them. | Not run |
| RGT-03 | Save rights | Superadmin | 1. Change some boxes. 2. Click Save rights. 3. Open Rights again. | The saved boxes are shown as set. | Not run |
| RGT-04 | Cancel discards changes | Superadmin | 1. Change some boxes. 2. Click Cancel. 3. Open Rights again. | The old settings are shown. | Not run |

## B. Customer rights, one right at a time
For each case, set only the stated box, save, then log in as that user.
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CRT-01 | View only | User (Customers: View) | 1. Open Customers. | The list is shown. There is no Add customer button, no Edit and no Delete. | Not run |
| CRT-02 | Create only | User (Customers: View + Create) | 1. Open Customers. 2. Add a customer. | Add customer is shown and works. Edit and Delete are not shown. | Not run |
| CRT-03 | Edit only | User (Customers: View + Edit) | 1. Open Customers. 2. Edit a customer. | Edit is shown and works. Add and Delete are not shown. | Not run |
| CRT-04 | Delete only | User (Customers: View + Delete) | 1. Open Customers. 2. Delete a customer. | Delete is shown and works. Add and Edit are not shown. | Not run |
| CRT-05 | No View right | User (Customers: none) | 1. Look at the menu. 2. Type the customers page address in the browser. | The Customers menu is hidden and direct access is denied. | Not run |
| CRT-06 | Server enforces the right | User (Customers: View + Delete) | 1. Open Customers as the user. 2. As Superadmin, remove Delete. 3. As the user, without reloading, click Delete. | The action is refused with a message and the customer is unchanged. | Not run |

## C. Product rights, one right at a time
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRT-01 | View only | User (Products: View) | 1. Open Products. | The list is shown. There is no Add product button, no Edit and no Delete. | Not run |
| PRT-02 | Create only | User (Products: View + Create) | 1. Add a product. | Add product is shown and works. Edit and Delete are not shown. | Not run |
| PRT-03 | Edit only | User (Products: View + Edit) | 1. Edit a product. | Edit is shown and works. Add and Delete are not shown. | Not run |
| PRT-04 | Delete only | User (Products: View + Delete) | 1. Delete a product. | Delete is shown and works. Add and Edit are not shown. | Not run |
| PRT-05 | No View right | User (Products: none) | 1. Look at the menu. 2. Type the products page address in the browser. | The Products menu is hidden and direct access is denied. | Not run |
| PRT-06 | Server enforces the right | User (Products: View + Edit) | 1. Open Products as the user. 2. As Superadmin, remove Edit. 3. As the user, without reloading, click Edit and save. | The action is refused with a message and the product is unchanged. | Not run |

## D. Price rights
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRP-01 | View only | User (Products: View) | 1. Open Price history for a product. | The history is shown. There is no Add, Edit or Delete for prices. | Not run |
| PRP-02 | Add price right | User (the right that controls adding a price) | 1. Add a price with an effective date. | The price is added. Edit and Delete are not shown. | Not run |
| PRP-03 | Edit price right | User (the right that controls editing a price) | 1. Edit a price entry. | Edit works. Add and Delete are not shown. | Not run |
| PRP-04 | Delete price right | User (the right that controls deleting a price) | 1. Delete a price entry. | Delete works. Add and Edit are not shown. | Not run |
| PRP-05 | No Products View | User (Products: none) | 1. Try to reach a product's price history. | It cannot be reached. | Not run |

## E. Rights changes
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| RGT-05 | New rights take effect | User | 1. Superadmin changes the user's rights. 2. The user logs out and in again. | The menu and buttons match the new rights. | Not run |
| RGT-06 | Rights change is logged | Superadmin | 1. Change a user's rights. 2. Check audit_log (view-only Supabase Table Editor). | A new audit_log row records the change. | Not run |

## F. Role and account limits
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| RGT-07 | Admin cannot see Superadmin accounts | Admin | 1. Open Users. | Superadmin accounts are not listed. | Not run |
| RGT-08 | Blocked user cannot sign in | Blocked user | 1. Go to the login page. 2. Enter the blocked account's details. | Sign in is refused with a clear message. | Not run |

## Screenshot evidence
Upload screenshots to the `testing/` folder. Crop out emails and cover usernames or emails where they appear.
Name pattern: `S2-TST-04_<test case>_<short-description>.png`

| Test case | Screenshot needed | File name |
|-----------|-------------------|-----------|
| RGT-01 | The Rights dialog (Customers: View only, Products: all boxes) | `S2-TST-04_RGT-01_rights-dialog.png` |
| CRT-01 | Customers page as a View-only user (no Add, Edit or Delete) | `S2-TST-04_CRT-01_view-only.png` |
| RGT-08 | Login refused for a blocked user | `S2-TST-04_RGT-08_blocked-login.png` |

## Results summary
| Date | Branch | Total | Passed | Failed | Not run | Bugs logged |
|------|--------|-------|--------|--------|---------|-------------|
| | | 25 | | | 25 | |

Failed cases: write each one as a GitHub Issue (Tester Guide, section 7) and list the Issue number here.
