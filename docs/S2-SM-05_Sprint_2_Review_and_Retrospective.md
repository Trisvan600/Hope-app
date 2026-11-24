# Sprint 2 Review and Retrospective Report

**Project:** HOPE App – ERP System  
**Task ID:** S2-SM-05  
**Role:** Scrum Master  
**Prepared by:** Trisvan600  
**Related Issue:** #141  
**Report Date:** November 25, 2026

## 1. Sprint Overview

Sprint 2 focused on the development, database support, testing, and interface design of the customer, product, and price history modules.

The sprint also included Scrum Master activities related to sprint planning, retrospective action follow-up, impediment monitoring, progress reporting, and team coordination.

## 2. Sprint Objectives

- Implement customer management functionality.
- Implement product management functionality.
- Implement price history management.
- Apply database validation and record management restrictions.
- Verify module functionality and user permissions.
- Prepare interface designs and usability improvements.
- Monitor sprint progress and team collaboration.

## 3. Sprint Review

### 3.1 Sprint Progress Summary

Based on the reconciled Sprint 2 Project Board snapshot:

| Status | Tasks |
|---|---:|
| Todo | 1 |
| In Progress | 2 |
| Testing / Review | 10 |
| Done | 17 |
| Total | 30 |

- Board-based completion rate: 56.7%
- Tasks with identified merged PRs: 23
- PR-based task coverage: 76.7%
- Project Board coverage by task count: 100%

These figures represent the progress snapshot collected before the completion of the final Scrum Master reports.

### 3.2 Deliverables by Role

| Role | Planned Tasks | Tasks with Merged PRs |
|---|---:|---:|
| Developer | 8 | 7 |
| Database Administrator | 6 | 6 |
| Tester | 6 | 6 |
| UI/UX Designer | 5 | 1 |
| Scrum Master | 5 | 3 |
| Total | 30 | 23 |

The figures are based on the earlier PR inventory. Merged PRs indicate integrated work but do not independently confirm satisfaction of all acceptance criteria.

### 3.3 Developer Deliverables

Merged PRs were identified for the following tasks:

- Customer create and edit forms.
- Customer soft delete and restore.
- Product listing with search and filtering.
- Product create and edit forms.
- Product soft delete and restore.
- Price history management.
- Current-price display and per-action rights checks.

S2-DEV-01 requires further verification because its identified PR #53 was closed without merging, despite the task being marked Done.

### 3.4 Database Administrator Deliverables

Merged PRs were identified for all six planned DBA tasks:

- Customer and product active views and indexes.
- Current-price queries based on a given date.
- Database validation constraints.
- Child-record deletion checks.
- Customer, product, and price history demo data.
- Search performance checks and index tuning.

### 3.5 Tester Deliverables

Merged PRs were identified for all six planned testing tasks:

- Customer module test cases.
- Product and price history test cases.
- Soft delete and restore tests.
- Per-right permission tests.
- Sprint 1 regression testing.
- Bug reporting and fix verification.

The corresponding Issues were created retrospectively to improve task tracking. Deliverable verification remains necessary before final closure.

### 3.6 UI/UX Deliverables

- Customer screen wireframes: merged PR #95.
- Product and price history wireframes: PR #96 awaiting review.
- High-fidelity mockups and handoff notes: PR #102 awaiting review.
- Empty, error, and confirm-delete states: PR #103 awaiting review.
- Usability review of built screens: no corresponding PR identified.

### 3.7 Scrum Master Deliverables

- Sprint 2 planning notes and board: merged PR #72.
- Sprint 1 retrospective action follow-up: merged PR #74.
- Mid-sprint check and impediment log: merged PR #76.
- Velocity and burndown report: Issue #140.
- Sprint 2 review and retrospective report: Issue #141.

The final two reports were in progress at the time of the collected board snapshot.

## 4. Outstanding Work

The following items require completion or verification:

- Review and verify the six Tester deliverables.
- Verify the customer screen wireframes.
- Complete the review of the three outstanding UI/UX PRs.
- Complete the usability review of implemented screens.
- Verify the implementation status of S2-DEV-01.
- Complete and obtain approval for the final Scrum Master reports.
- Confirm the resolution status of previously reported defects.

## 5. Sprint Retrospective

The following retrospective observations are based on available GitHub records and Scrum Master tracking activities. Direct team feedback remains pending confirmation.

### 5.1 What Went Well

- The team submitted work across all five assigned roles.
- Most planned development tasks had corresponding merged PRs.
- All six DBA tasks had corresponding approved and merged PRs.
- All six Tester tasks had corresponding approved and merged PRs.
- Teammate reviews and approvals were recorded in GitHub.
- Sprint tracking coverage was improved through Issue creation and board reconciliation.
- Sprint planning, retrospective follow-up, and mid-sprint monitoring were documented.

### 5.2 What Needs Improvement

- Some tasks were submitted through PRs before corresponding Issues were created.
- Several PRs lacked clear Issue references.
- Project Board statuses were not consistently synchronized with PR progress.
- Some PR descriptions and self-check sections required improvement.
- Several UI/UX deliverables remained awaiting review.
- A task was marked Done despite its identified PR being closed without merging.
- Historical daily progress records were unavailable for actual burndown reconstruction.

### 5.3 What Should Continue

- Using GitHub Issues for task assignment.
- Submitting work through separate Pull Requests.
- Requesting teammate reviews before merging.
- Documenting testing and database deliverables.
- Conducting sprint planning and mid-sprint progress checks.
- Recording impediments and improvement actions.

## 6. Sprint 3 Improvement Action Plan

The following actions are proposed for team discussion and confirmation.

| Improvement Action | Proposed Owner | Target |
|---|---|---|
| Create Issues before starting assigned tasks | All members | Sprint 3 planning |
| Link PRs to corresponding Issues | All members | Every PR |
| Update Project Board statuses regularly | All members | Daily |
| Record remaining task counts | Scrum Master | Daily |
| Complete PR descriptions and self-checks | PR authors | Before review |
| Review submitted PRs promptly | Assigned reviewers | Within one working day |
| Verify acceptance criteria before closing Issues | Task owners and Tester, as applicable | Before closure |
| Resolve or carry forward unfinished Sprint 2 tasks | Scrum Team | Sprint 3 planning |
| Improve task estimation practices | Scrum Team | Sprint 3 planning |

## 7. Proposed Definition of Done Reinforcement

A task should be considered Done when:

- The assigned deliverable has been completed.
- Applicable acceptance criteria have been satisfied.
- Required testing or verification has been performed.
- The related PR has been reviewed and approved.
- Required changes have been merged.
- The corresponding Issue and Project Board status have been updated.
- Relevant documentation has been provided.

## 8. Team Feedback

Team members should provide feedback regarding:

- Challenges encountered during Sprint 2.
- Effectiveness of team communication.
- Task distribution and workload.
- PR review and approval delays.
- Suggested improvements for Sprint 3.

Direct retrospective feedback was not available during the preparation of this report. This section remains open for team confirmation and additional observations.

## 9. Conclusion

Sprint 2 demonstrated measurable progress toward the customer, product, and price history modules of the HOPE App.

The earlier PR inventory identified merged work for 23 of the 30 planned tasks, while the reconciled Project Board recorded 17 tasks as Done.

Although substantial work was submitted, outstanding reviews, acceptance criteria verification, and tracking discrepancies remain.

Sprint 3 should prioritize consistent Issue-to-PR traceability, timely reviews, accurate board updates, daily progress monitoring, and completion of outstanding work.

## 10. References

- Repository: https://github.com/Trisvan600/Hope-app
- Sprint Planning Board: https://github.com/users/Trisvan600/projects/1
- Sprint 2 Velocity and Burndown Report: Issue #140
- Sprint 2 Review and Retrospective Report: Issue #141
- Sprint 2 Pull Request and Issue records

**Report Status:** Prepared for team review and retrospective feedback.
