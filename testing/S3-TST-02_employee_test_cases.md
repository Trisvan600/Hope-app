S3-TST-02: Test cases for employee

Tester: Ariah Lin Valencia
Covers: the Employees screen (Human Resources menu): list, search, create, edit, form validation, department and job selection, show deleted and access
Date tested: 11/20/2026
Branch tested: Sprint 3 build of the HOPE App 
App address: http://localhost:5173
Account used: Super Admin test account

A. Employee list
ID	Test case	Account	Steps	Expected result	Result
EMP-01	Employee list loads	Super Admin	1. Log in. 2. Click Employees under Human Resources.	The list shows the employees with their main details (for example Code, Name, Department, Job, Status), with Edit and Delete buttons. No error.	Not run
EMP-02	Empty state	Super Admin	1. Search for a name that does not exist (for example "zzzz").	A clear "no employees found" message, not a blank or broken page.	Not run
B. Employee search
ID	Test case	Account	Steps	Expected result	Result
EMP-03	Search by part of the name	Super Admin	1. Type part of an employee's name in Search employees.	Only employees that match are shown.	Not run
EMP-04	Letter case	Super Admin	1. Type a name in lowercase, then in uppercase.	Both give the same results.	Not run
EMP-05	Search by code or email	Super Admin	1. Type an employee code or email.	The matching employee is shown.	Not run
EMP-06	Clear the search box	Super Admin	1. Search. 2. Delete the text in the box.	The full list is shown again.	Not run
C. Employee create and edit
ID	Test case	Account	Steps	Expected result	Result
EMP-07	Create with valid data	Super Admin	1. Click Add employee. 2. Fill in all required fields with valid data. 3. Save.	The employee is saved and appears in the list as Active.	Not run
EMP-08	Edit and save	Super Admin	1. Click Edit on an employee. 2. Change a detail (for example the name). 3. Save.	The change is saved and shown in the list.	Not run
EMP-09	Cancel create or edit	Super Admin	1. Type data in the form. 2. Cancel (or close).	Nothing is saved.	Not run
EMP-10	Duplicate code or email	Super Admin	1. Add an employee with a code or email that already exists.	It is rejected with a clear message.	Not run
D. Employee form validation
ID	Test case	Account	Steps	Expected result	Result
EMP-11	Empty required fields	Super Admin	1. Click Add employee. 2. Leave the required fields empty. 3. Save.	Not saved. The required fields are marked with a message.	Not run
EMP-12	Invalid email	Super Admin	1. Enter an email without "@" or domain (for example "juan.com"). 2. Save.	Not saved. A clear message says the email is invalid.	Not run
EMP-13	Invalid date	Super Admin	1. Enter a wrong or impossible date (for example 31/02/2026 or letters). 2. Save.	Not saved. A clear message says the date is invalid.	Not run
EMP-14	Very long values	Super Admin	1. Enter a very long name or code. 2. Save.	It is rejected with a clear message.	Not run
E. Department and job selection
ID	Test case	Account	Steps	Expected result	Result
EMP-15	Department can be selected	Super Admin	1. Open the Add employee form. 2. Open the Department dropdown.	The active departments are listed and one can be selected.	Not run
EMP-16	Job can be selected	Super Admin	1. Open the Add employee form. 2. Open the Job dropdown.	The active jobs are listed and one can be selected.	Not run
EMP-17	Department and job are saved	Super Admin	1. Create or edit an employee with a department and a job. 2. Save. 3. Open the employee again.	The chosen department and job are shown in the list and in the form.	Not run
EMP-18	Deleted department or job	Super Admin	1. Delete an unused department or job. 2. Open the employee form.	The deleted department or job is not offered in the dropdown.	Not run
F. Show deleted
ID	Test case	Account	Steps	Expected result	Result
SHW-01	Show deleted box	Super Admin	1. Tick "Show deleted" on Employees. 2. Untick it.	Deleted (inactive) employees are listed when ticked. The active list returns when unticked.	Not run
LNK-01	Delete an employee	Super Admin	1. Click Delete on an employee. 2. Tick Show deleted.	The employee leaves the active list and appears under Show deleted.	Not run
LNK-02	Restore an employee	Super Admin	1. Tick Show deleted. 2. Click Restore on the deleted employee.	The employee is back in the active list.	Not run
G. Access
ID	Test case	Account	Steps	Expected result	Result
ACC-01	User with view right only	User (HR view right)	1. Log in. 2. Open Employees.	The list is shown. There are no Add, Edit or Delete buttons.	Not run
ACC-02	User without HR rights	User (no HR rights)	1. Look at the menu. 2. Type the employees page address in the browser.	The Human Resources menu is hidden and direct access is denied.	Not run
ACC-03	Logged-out user	None	1. Log out. 2. Open the employees page address.	The user is sent to the login page.	Not run
Screenshot evidence

Screenshots are in the testing/ folder.

Test case	Screenshot	File name
EMP-01	Employee list	S3-TST-02_EMP-01_employee-list.png
EMP-03	Searching for an employee	S3-TST-02_EMP-03_employee-search.png
EMP-11	Error message for empty required fields	S3-TST-02_EMP-11_validation-required.png
EMP-12	Error message for invalid email	S3-TST-02_EMP-12_validation-email.png
EMP-13	Error message for invalid date	S3-TST-02_EMP-13_validation-date.png
EMP-17	Employee form with department and job selected	S3-TST-02_EMP-17_department-job-selection.png
EMP-07	Successful employee creation	S3-TST-02_EMP-07_create-success.png
EMP-08	Successful employee edit	S3-TST-02_EMP-08_edit-success.png
Results summary
Date	Branch	Total	Passed	Failed	Not run	Bugs logged
11/20/2026	Sprint 3 build	24	0	0	24	0

Failed cases: none. Bugs logged: none.
