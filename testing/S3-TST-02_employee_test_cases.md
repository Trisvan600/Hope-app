S3-TST-02: Test cases for employee

Tester: Ariah Lin Valencia
Covers: the Employees screen (Human Resources menu): list, search and filters, create, edit, form validation, department and job selection, separate, linked records and access (Sprint 3 HR module)
Date tested: 11/20/2026
Branch tested: Sprint 3 build of the HOPE App 
App address: http://localhost:5173
Account used: Super Admin test account

A. Employee list
ID	Test case	Account	Steps	Expected result	Result
EMP-01	Employee list loads	Super Admin	1. Log in. 2. Click Employees under Human Resources.	The list shows Emp. no., Name, Department, Job, Hired and Status, with Profile, Edit and Separate buttons. The Add employee button is shown and the status filter is on Active. No error.	Pass
EMP-02	Empty state	Super Admin	1. Search for a name that does not exist (for example "zzzz").	A clear "no employees found" message, not a blank or broken page.	Not run
EMP-03	Open the employee profile	Super Admin	1. Click an employee's name, or the Profile button.	The profile of that employee opens. No error.	Not run
B. Employee search and filters
ID	Test case	Account	Steps	Expected result	Result
EMP-04	Search by part of the name	Super Admin	1. Type "da" in the search box.	Only employees that match are shown (Darwin, Davis, Raven, Danny).	Pass
EMP-05	Letter case	Super Admin	1. Type "da", then "DA".	Both give the same results.	Not run
EMP-06	Search by employee number	Super Admin	1. Type an employee number (for example "00017").	The matching employee is shown.	Not run
EMP-07	Search by email	Super Admin	1. Type an employee's email.	The matching employee is shown.	Not run
EMP-08	Clear the search box	Super Admin	1. Search. 2. Delete the text in the box.	The full list is shown again.	Not run
EMP-09	Filter by department	Super Admin	1. Choose a department in the All departments filter.	Only employees of that department are shown.	Not run
EMP-10	Filter by job	Super Admin	1. Choose a job in the All jobs filter.	Only employees with that job are shown.	Not run
EMP-11	Filter by status	Super Admin	1. Change the status filter from Active to the other options.	The list changes to match the chosen status.	Not run
EMP-12	Search with filters together	Super Admin	1. Choose a department. 2. Type a name in the search box.	Only employees that match both are shown.	Not run
C. Employee create and edit
ID	Test case	Account	Steps	Expected result	Result
EMP-13	Create with valid data	Super Admin	1. Click Add employee. 2. Fill in Employee no., First name, Last name, Email, Hire date, Department and Job. 3. Click Save.	The employee is saved and appears in the list as Active.	Not run
EMP-14	Edit and save	Super Admin	1. Click Edit on an employee. 2. Change a detail (for example the job). 3. Click Save changes.	The change is saved and shown in the list.	Not run
EMP-15	Cancel create or edit	Super Admin	1. Open the form and type or change data. 2. Click Cancel.	The form closes and nothing is saved.	Not run
EMP-16	Duplicate employee no. or email	Super Admin	1. Add an employee with an employee number or email that already exists.	It is rejected with a clear message.	Not run
D. Employee form validation
ID	Test case	Account	Steps	Expected result	Result
EMP-17	Empty required fields	Super Admin	1. Click Add employee. 2. Leave the required fields empty. 3. Click Save.	Not saved. The required fields are marked with a message.	Not run
EMP-18	Invalid email	Super Admin	1. Enter an email without "@" or domain (for example "juan.com"). 2. Click Save.	Not saved. A clear message says the email is invalid.	Not run
EMP-19	Invalid hire date	Super Admin	1. Enter a wrong date, or clear the Hire date. 2. Click Save.	Not saved. A clear message says the date is invalid or required.	Not run
EMP-20	Very long values	Super Admin	1. Enter a very long name or employee number. 2. Click Save.	It is rejected with a clear message.	Not run
E. Department and job selection
ID	Test case	Account	Steps	Expected result	Result
EMP-21	Department can be selected	Super Admin	1. Open the employee form. 2. Open the Department dropdown.	The departments are listed (Accounting, Executive, Human Resource, Information Tech, Payroll, Sales Branch 1, Sales Branch 2, Security, Warehouse) and one can be selected.	Pass
EMP-22	Job can be selected	Super Admin	1. Open the employee form. 2. Open the Job dropdown.	The jobs are listed (Accountant, Analyst, Clerk 1, Clerk 2, HR Specialist, Manager, President, Programmer 1, Programmer 2, Sales Agent 1, Sales Agent 2, Supervisor, Vice president, Warehouse man) and one can be selected.	Pass
EMP-23	Department and job are saved	Super Admin	1. Create or edit an employee with a department and a job. 2. Save. 3. Open Edit on the same employee.	The chosen department and job are shown in the list and in the form.	Not run
EMP-24	"None" option	Super Admin	1. Choose None in Department or Job. 2. Click Save.	It is either saved as no department or job, or rejected with a clear message. It does not crash.	Not run
EMP-25	Deleted department or job	Super Admin	1. Delete an unused department or job (Departments or Jobs screen). 2. Open the employee form.	The deleted department or job is not offered in the dropdown.	Not run
F. Separate employee
ID	Test case	Account	Steps	Expected result	Result
SEP-01	Separate an employee	Super Admin	1. Click Separate on an employee. 2. Confirm if asked.	The employee leaves the Active list. The employee's record is not lost.	Not run
SEP-02	Separated employee is still viewable	Super Admin	1. Change the status filter to show separated employees.	The separated employee appears in the list with the correct status.	Not run
G. Access
ID	Test case	Account	Steps	Expected result	Result
ACC-01	User with view right only	User (HR view right)	1. Log in. 2. Open Employees.	The list is shown. There are no Add employee, Edit or Separate buttons.	Not run
ACC-02	User without HR rights	User (no HR rights)	1. Look at the menu. 2. Type the employees page address in the browser.	The Human Resources menu is hidden and direct access is denied.	Not run
ACC-03	Logged-out user	None	1. Log out. 2. Open the employees page address.	The user is sent to the login page.	Not run
Screenshot evidence

Screenshots are in the testing/ folder.

Test case	Screenshot	File name
EMP-01	Employee list (Emp. no., Name, Department, Job, Hired, Status)	S3-TST-02_EMP-01_employee-list.png
EMP-04	Searching "da" shows Darwin, Davis and Raven	S3-TST-02_EMP-04_employee-search.png
EMP-17	Error message for empty required fields	S3-TST-02_EMP-17_validation-required.png
EMP-18	Error message for invalid email	S3-TST-02_EMP-18_validation-email.png
EMP-19	Error message for invalid hire date	S3-TST-02_EMP-19_validation-date.png
EMP-21	Department dropdown open in the employee form	S3-TST-02_EMP-21_department-selection.png
EMP-22	Job dropdown open in the employee form	S3-TST-02_EMP-22_job-selection.png
EMP-13	Successful employee creation	S3-TST-02_EMP-13_create-success.png
EMP-14	Successful employee edit	S3-TST-02_EMP-14_edit-success.png
Results summary
Date	Branch	Total	Passed	Failed	Not run	Bugs logged
11/20/2026	Sprint 3 build	30	4	0	26	0

Failed cases: none. Bugs logged: none.
