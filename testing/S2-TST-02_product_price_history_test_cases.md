# S2-TST-02: Test cases for product and price history

Tester: Ariah
Covers: product list, search and filter, create and edit product, price history (add, edit, delete with effective date), current-price behavior (S2-DEV-04, S2-DEV-05, S2-DEV-07, S2-DEV-08)
Branch tested: [fill in]
App address: [fill in, e.g. http://localhost:5173]

> How to use: run the app on the branch above, follow each case's steps exactly, then change **Not run**
> to **Pass** or **Fail**. Leave "Not run" for anything you did not run yourself.
> Field names (name, unit, price, effective date) are examples. Change them to match the real form.
> Never write passwords in this file or in a bug Issue.

## Test accounts (roles only)
Superadmin, Admin, User (view rights), User (no product rights). Get them from the DB Admin.

## A. Product list
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRD-01 | List page loads | Admin | 1. Log in. 2. Open the Products module. | The product list is shown with the expected columns. No error. | Not run |
| PRD-02 | Only active products shown by default | Admin | 1. Open Products. 2. Compare with the database (view-only Supabase Table Editor). | Inactive (soft-deleted) products are not in the default list. | Not run |
| PRD-03 | Empty state | Admin | 1. Search for a product name that does not exist. | A clear "no products found" message, not a blank page. | Not run |

## B. Search and filter
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRD-04 | Search by full name | Admin | 1. Type a full product name. | Only matching products are shown. | Not run |
| PRD-05 | Search by partial name, any letter case | Admin | 1. Type the first 3 letters in lowercase, then in UPPERCASE. | Both return the same matching products. | Not run |
| PRD-06 | Filter works (for example by unit) | Admin | 1. Choose a filter option. | Only products matching the filter are shown. | Not run |
| PRD-07 | Clear search and filter | Admin | 1. Apply a search or filter. 2. Click Clear. | The full list is shown again. | Not run |

## C. Create and edit product
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRD-08 | Create with valid data | Admin | 1. Click Add product. 2. Fill all fields with valid data. 3. Save. | The product is saved and appears in the list. | Not run |
| PRD-09 | Empty required fields | Admin | 1. Open the form. 2. Leave required fields empty. 3. Save. | Not saved. Required fields are marked. | Not run |
| PRD-10 | Invalid unit | Admin | 1. Enter a unit that is not allowed. 2. Save. | The value is rejected with a clear message. | Not run |
| PRD-11 | Edit and save | Admin | 1. Open a product. 2. Change a field. 3. Save. | The change is saved and shown in the list. | Not run |
| PRD-12 | Cancel create or edit | Admin | 1. Type data in the form. 2. Cancel. | Nothing is saved. | Not run |

## D. Price history
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRC-01 | Add a price with an effective date | Admin | 1. Open a product's price history. 2. Add a price and an effective date. 3. Save. | The entry appears in the history. | Not run |
| PRC-02 | Add a price without an effective date | Admin | 1. Leave the date empty. 2. Save. | Not saved. A message asks for the date. | Not run |
| PRC-03 | Invalid price (negative, zero, or letters) | Admin | 1. Enter -5, then 0, then "abc". 2. Save each. | Each is rejected with a clear message. | Not run |
| PRC-04 | Edit a price entry | Admin | 1. Edit an existing entry. 2. Save. | The change is saved in the history. | Not run |
| PRC-05 | Delete a price entry | Admin | 1. Delete an entry and confirm. | The entry is removed from the history. | Not run |
| PRC-06 | History order | Admin | 1. Add 3 prices with different dates. | The history is shown in a consistent date order. | Not run |
| PRC-07 | Two prices with the same effective date | Admin | 1. Add a second price with the same date as an existing one. | It is rejected or handled with a clear message. No silent duplicate. | Not run |

## E. Current price
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| CUR-01 | Current price shown on the product page | Admin | 1. Open a product with price history. | The price shown is the one whose effective date is the latest date that is today or earlier. | Not run |
| CUR-02 | Future-dated price is not current yet | Admin | 1. Add a price with a future effective date. 2. Open the product page. | The current price does not change to the future price. | Not run |
| CUR-03 | Price effective today becomes current | Admin | 1. Add a price with today's date. | It is shown as the current price. | Not run |
| CUR-04 | Back-dated price does not replace a newer one | Admin | 1. Add a price with an older date than the current one. | The current price stays the same. | Not run |
| CUR-05 | Deleting the current price | Admin | 1. Delete the current price entry. | The product falls back to the previous valid price. | Not run |
| CUR-06 | Product with no price | Admin | 1. Open a product that has no price history. | A clear "no price" message, not an error or blank. | Not run |

## F. Access
Per-right Add/Edit/Delete tests are covered in S2-TST-04.
| ID | Test case | Account | Steps | Expected result | Result |
|----|-----------|---------|-------|-----------------|--------|
| PRD-13 | User with view right sees products | User (view right) | 1. Log in. 2. Open Products. | The list is shown. | Not run |
| PRD-14 | User without product rights | User (no product rights) | 1. Log in. 2. Check the menu. 3. Type the products page address in the browser. | The module is hidden and direct access is denied. | Not run |

## Screenshot evidence
Screenshots are uploaded to the `testing/` folder. Crop out emails, passwords and User IDs.
Name pattern: `S2-TST-02_<test case>_<short-description>.png`

| Test case | Screenshot needed | File name |
|-----------|-------------------|-----------|
| PRD-01 | Product list view (Total 53, with the Current price column) | `S2-TST-02_PRD-01_product-list.png` |
| PRD-05 | Search result (searching "Stee" shows 2 of 53 products) | `S2-TST-02_PRD-05_product-search.png` |
| PRD-08 | Add product form (123456, hp laptop, pc) and the new row in the list | `S2-TST-02_PRD-08_add-product.png` |
| CUR-01 | Price history for product 0001, with the "current" tag on the latest effective date | `S2-TST-02_CUR-01_price-history.png` |

## Results summary
| Date | Branch | Total | Passed | Failed | Not run | Bugs logged |
|------|--------|-------|--------|--------|---------|-------------|
| | | 27 | | | 27 | |

Failed cases: write each one as a GitHub Issue (Tester Guide, section 7) and list the Issue number here.
