S3-TST-03: Test cases for job history (effective date, salary)

Tester: ARIAH LIN VALENCIA
Covers: the Job history section on the employee profile (Employees, then Profile): entries, add entry, effective date and salary validation, current entry, future-dated entry, edit and delete (Sprint 3 HR module)
Date tested: 11/20/2026
Branch tested: Sprint 3 build of the HOPE App 
App address: http://localhost:5173
Account used: Super Admin test account
Employee used: Nelia Celestino (00017)

Salary visibility and access by user rights are covered in S3-TST-04.

A. Job history list
ID	Test case	Account	Steps	Expected result	Result
JH-01	Job history entries are shown	Super Admin	1. Log in. 2. Click Employees under Human Resources. 3. Click Profile on an employee.	The Job history section lists the entries. Each shows the job, a change type label (for example Hire, Promotion), the department, the salary, the effective date, and Edit and Delete buttons. The Add entry button is shown. No error.	Pass
JH-02	Newest entry is first	Super Admin	1. Open the profile of an employee with two or more entries.	The entries are listed from the newest effective date to the oldest.	Pass
JH-03	Salary format	Super Admin	1. Look at the salary of each entry.	The salary shows the peso sign, thousands separators and two decimals (for example ₱40,000.00).	Pass
JH-04	Current entry is shown	Super Admin	1. Open the profile of an employee with several entries.	The entry with the latest effective date that is today or earlier is marked as current. The Department and Job in the profile header match it.	Not run
JH-05	Employee with no job history	Super Admin	1. Open the profile of an employee that has no entries.	A clear "no job history" message, not a blank or broken page.	Not run
B. Add entry
ID	Test case	Account	Steps	Expected result	Result
JH-06	Add form opens	Super Admin	1. Click Add entry.	The Add job history form opens with Change type, Effective date, Job, Department, Salary and Remarks, and Cancel and Save changes buttons.	Pass
JH-07	Add with valid data	Super Admin	1. Click Add entry. 2. Choose a change type, an effective date, a job and a department. 3. Enter a valid salary. 4. Click Save changes.	The entry is saved and a new row appears in the list with the correct date, job, department and salary.	Not run
JH-08	Dropdown choices	Super Admin	1. Click Add entry. 2. Open the Change type, Job and Department dropdowns.	Each dropdown lists its choices and one can be selected.	Not run
JH-09	Cancel add	Super Admin	1. Click Add entry and type some data. 2. Click Cancel.	The form closes and nothing is saved.	Not run
JH-10	Entry dated today is current	Super Admin	1. Add an entry with today's date as the effective date. 2. Save.	The new entry is marked as current. The Department and Job in the profile header change to match it.	Not run
C. Invalid input
ID	Test case	Account	Steps	Expected result	Result
JH-11	No effective date	Super Admin	1. Click Add entry. 2. Leave the effective date empty. 3. Click Save changes.	Not saved. A clear message says the effective date is required.	Not run
JH-12	Negative salary	Super Admin	1. Enter -5000 in Salary. 2. Click Save changes.	Not saved. A clear message says the salary is invalid.	Not run
JH-13	Zero salary	Super Admin	1. Enter 0 in Salary. 2. Click Save changes.	Not saved. A clear message says the salary must be more than zero.	Not run
JH-14	Letters in salary	Super Admin	1. Enter "abc" in Salary. 2. Click Save changes.	Not saved. A clear message says the salary must be a number.	Not run
JH-15	Empty salary	Super Admin	1. Leave Salary empty. 2. Click Save changes.	It follows the salary rule: rejected with a clear message if salary is required, or saved and shown as "—" if it is optional.	Not run
JH-16	No job or department chosen	Super Admin	1. Leave Job or Department on "Select job" or "Select department". 2. Click Save changes.	Not saved. A clear message says the field is required.	Not run
D. Future-dated entry
ID	Test case	Account	Steps	Expected result	Result
JH-17	Future date is not current	Super Admin	1. Add an entry with an effective date in the future. 2. Save.	The entry is listed but is not marked as current.	Not run
JH-18	Future date does not change the profile	Super Admin	1. After JH-17, look at the Department and Job in the profile header.	The header still shows the job and department of the real current entry, not the future one.	Not run
E. Edit and delete entry
ID	Test case	Account	Steps	Expected result	Result
JH-19	Edit and save	Super Admin	1. Click Edit on an entry. 2. Change the salary or the date. 3. Click Save changes.	The Edit job history form opens with the current values. The change is saved and shown in the list.	Not run
JH-20	Cancel edit	Super Admin	1. Click Edit and change a value. 2. Click Cancel.	The form closes and the entry is unchanged.	Not run
JH-21	Delete an entry	Super Admin	1. Click Delete on an entry. 2. Confirm if asked.	The entry is removed from the list.	Not run
JH-22	Delete the current entry	Super Admin	1. Delete the entry marked as current.	The next newest entry becomes current and the profile header updates to match it.	Not run
Screenshot evidence

Screenshots are in the testing/ folder.


Results summary
Date	Branch	Total	Passed	Failed	Not run	Bugs logged
11/20/2026	Sprint 3 build	22	4	0	18	0

Failed cases: none. Bugs logged: none.
