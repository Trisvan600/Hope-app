# S2-TST-03: Soft delete and restore tests (including delete blocked by active children)

Tester: Ariah
Covers: soft delete and restore for customers and products (S2-DEV-03, S2-DEV-06, S2-DBA-04)
Branch tested: [fill in]
App address: [fill in, e.g. http://localhost:5173]

> How to use: run the app on the branch above, follow each case's steps exactly, then change **Not run**
> to **Pass** or **Fail**. Leave "Not run" for anything you did not run yourself.
> "Soft delete" means the record is marked inactive (is_deleted = true) and is not erased.
> Never write passwords in this file or in a bug Issue.

## Test accounts (roles only)
Superadmin, Admin. Get them from the DB Admin. Ask the DB Admin which records count as "active child records".

## A. Product soft delete
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| SDL-01 | Delete asks for confirmation | Admin | 1. Open Products. 2. Click Delete on a product. | A confirmation is shown before anything is deleted. | Not run |
| SDL-02 | Delete removes it from the default list | Admin | 1. Note the Total. 2. Delete a product and confirm. | The product is gone from the default list and the Total goes down by 1. | Not run |
| SDL-03 | Record is not erased | Admin | 1. After deleting, tick "Show deleted" (or check the database, view only). | The record still exists with is_deleted = true. | Not run |
| SDL-04 | Cancel delete | Admin | 1. Click Delete. 2. Cancel. | The product stays in the list. Nothing changes. | Not run |
| SDL-05 | Show deleted lists deleted products | Admin | 1. Tick "Show deleted". | Deleted products are listed with is_deleted = true, a DELETE stamp, and a Restore button. | Not run |

## B. Product restore
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| SDL-06 | Restore brings it back | Admin | 1. Tick "Show deleted". 2. Click Restore on a product. 3. Untick "Show deleted". | The product is back in the default list, is_deleted = false, and the Total goes up by 1. | Not run |
| SDL-07 | Restored product keeps its data | Admin | 1. Open the restored product and its price history. | Description, unit and price history are unchanged. | Not run |
| SDL-08 | Stamp is updated | Admin | 1. Look at the stamp column after restoring. | The stamp shows RESTORE with the user and the time. | Not run |

## C. Customer soft delete and restore
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| SDL-09 | Delete a customer | Admin | 1. Open Customers. 2. Delete a customer and confirm. | The customer is gone from the default list and the Total goes down by 1. | Not run |
| SDL-10 | Deleted customer appears in Show deleted | Admin | 1. Tick "Show deleted". | The customer is listed as deleted with a Restore button. | Not run |
| SDL-11 | Restore a customer | Admin | 1. Click Restore. | The customer is back in the default list with is_deleted = false. | Not run |
| SDL-12 | Restored customer keeps its data | Admin | 1. Open the restored customer. | All fields are unchanged. | Not run |

## D. Delete blocked by active child records
Ask the DB Admin which records count as active children for a customer and for a product.
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| SDL-13 | Customer with active child records | Admin | 1. Pick a customer that has active child records. 2. Try to delete it. | Delete is blocked with a clear message. The customer stays active. | Not run |
| SDL-14 | Product with active child records | Admin | 1. Pick a product that has active child records. 2. Try to delete it. | Delete is blocked with a clear message. The product stays active. | Not run |
| SDL-15 | Delete is allowed once children are inactive | Admin | 1. Make the child records inactive. 2. Try to delete again. | Delete now works. | Not run |
| SDL-16 | Blocked delete changes nothing | Admin | 1. Try a blocked delete. 2. Check the list and Show deleted. | The record is not partly changed. The stamp is not updated. | Not run |

## E. Show deleted and search
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| SDL-17 | Search ignores deleted records by default | Admin | 1. Search for the name of a deleted record. | It is not found unless "Show deleted" is ticked. | Not run |
| SDL-18 | Total changes with the Show deleted toggle | Admin | 1. Compare the Total with the box ticked and unticked. | The Total matches the list shown in each view. | Not run |

## Screenshot evidence
Upload screenshots to the `testing/` folder. Crop out emails and User IDs and cover usernames in the stamp column.
Name pattern: `S2-TST-03_<test case>_<short-description>.png`

| Test case | Screenshot needed | File name |
|-----------|-------------------|-----------|
| SDL-02 | Before delete: products list Total 54 with product 0001 shown | `S2-TST-03_SDL-02_before-delete.png` |
| SDL-02 | After delete: Total 53, product 0001 no longer in the list | `S2-TST-03_SDL-02_after-delete.png` |
| SDL-05 | Show deleted ticked: deleted products with is_deleted true and a Restore button | `S2-TST-03_SDL-05_show-deleted.png` |
| SDL-06 | After restore: product 0001 back in the list, Total 54 | `S2-TST-03_SDL-06_after-restore.png` |

## Results summary
| Date | Branch | Total | Passed | Failed | Not run | Bugs logged |
|------|--------|-------|--------|--------|---------|-------------|
| | | 18 | | | 18 | |

Failed cases: write each one as a GitHub Issue (Tester Guide, section 7) and list the Issue number here.
