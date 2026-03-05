# TestFlow – Project & Feature Management (Detailed PRD)

---

# 1. Project Management

## 1.1 Purpose

The Project module represents a software product or application under testing.

All testing activities such as:

- Features
- Test Cases
- Test Plans
- Test Execution
- Defects

are organized under a **Project**.

A project acts as the **top-level container** in the test management system.

---

# 1.2 Project Structure

Project
└── Features  
  └── Test Cases  
  └── Test Plans  
  └── Defects  

Each project can have:

- Multiple Features
- Multiple QA team members
- Multiple Releases
- Multiple Test Plans

---

# 1.3 Project Fields

Project entity should contain:

| Field | Description |
|-----|-----|
| id | Unique project ID |
| name | Project name |
| description | Description of project |
| product_owner | Product manager responsible |
| qa_lead | QA Lead responsible |
| start_date | Project start |
| expected_end_date | Planned completion |
| status | Active / On Hold / Completed / Archived |
| created_by | Admin who created project |
| created_at | Timestamp |

Optional fields:

- repository_url
- documentation_link
- jira_reference
- environment_details

---

# 1.4 Project Status Lifecycle

Draft  
→ Active  
→ On Hold  
→ Completed  
→ Archived

### Draft
Project created but not started.

### Active
Testing activities ongoing.

### On Hold
Temporarily paused.

### Completed
Project finished.

### Archived
Locked for history.

---

# 1.5 Project Dashboard

Each project has a dashboard displaying:

- Total Features
- Total Test Cases
- Total Test Plans
- Execution Progress
- Defect Summary
- Team Members
- Coverage Metrics

Example:

Total Test Cases: 240  
Executed: 160  
Passed: 140  
Failed: 20  

Execution Progress: 66%

---

# 1.6 Project Roles Assignment

During project creation, users are assigned roles.

Roles include:

- QA Lead
- QA Engineers
- QA Automation Engineers
- Developers
- Product Managers

Each role has different permissions.

---

# 1.7 Project Role Responsibilities

## Admin

Responsibilities:

- Create project
- Assign team members
- Configure project settings
- Archive project
- Monitor overall system usage

Admin does not participate in execution.

---

## QA Lead

Responsibilities:

- Manage features
- Oversee test case creation
- Create test plans
- Assign test execution
- Monitor progress
- Review defects

QA Lead controls the **testing strategy for the project**.

---

## QA Engineer

Responsibilities:

- Write test cases
- Update test cases
- Execute test plans
- Log defects

QA Engineers perform **manual testing activities**.

---

## QA Automation Engineer

Responsibilities:

- Convert test cases into automation scripts
- Maintain automated test cases
- Upload automation results

Automation engineers extend manual coverage.

---

## Developer

Responsibilities:

- View reported defects
- Fix issues
- Update defect status

Developers mainly interact with **defects**.

---

## Product Manager

Responsibilities:

- View test progress
- Monitor release readiness
- Review defect trends

They use the system mostly for **visibility**.

---

# 2. Feature Management

---

# 2.1 Purpose

A Feature represents a **functional module or capability** of the product.

Features organize test cases logically.

Without features, managing test cases becomes chaotic.

Example project:

E-commerce Website

Features:

- User Registration
- Login
- Product Search
- Cart Management
- Checkout
- Payment

Each feature contains its own set of test cases.

---

# 2.2 Feature Structure

Project
└── Feature
  └── Test Cases
  └── Test Plans
  └── Defects

A feature groups:

- related test cases
- related defects
- execution results

---

# 2.3 Feature Fields

| Field | Description |
|-----|-----|
| id | Feature ID |
| project_id | Project reference |
| name | Feature name |
| description | Feature explanation |
| priority | High / Medium / Low |
| owner | Responsible person |
| status | Active / Deprecated |
| created_by | Creator |
| created_at | Timestamp |

Optional:

- requirement_link
- design_document
- story_reference

---

# 2.4 Feature Status

Active  
Deprecated  
In Development  
Completed

---

# 2.5 Feature Dashboard

Feature page should display:

- Number of test cases
- Execution progress
- Defects count
- Coverage percentage

Example:

Feature: Login

Test Cases: 32  
Executed: 24  
Passed: 21  
Failed: 3  

Coverage: 75%

---

# 2.6 Feature-Based Test Case Organization

Example:

Feature: Checkout

Test Cases:

TC001 Verify checkout with valid cart  
TC002 Verify checkout with empty cart  
TC003 Verify address validation  
TC004 Verify payment redirect  
TC005 Verify checkout timeout  

All these belong to the Checkout feature.

---

# 2.7 Feature Role-Based Access

## Admin

Can:

- Create feature
- Edit feature
- Delete feature
- Reassign ownership

---

## QA Lead

Can:

- Create features
- Organize test cases under features
- Monitor feature test coverage
- Assign test case owners

QA Lead manages the **structure of testing**.

---

## QA Engineer

Can:

- View features
- Add test cases under feature
- Update test cases
- Execute test cases

Cannot delete features.

---

## QA Automation Engineer

Can:

- View features
- Access test cases for automation
- Link automated tests

---

## Developer

Can:

- View features
- See related defects
- Understand affected areas

---

## Product Manager

Can:

- View feature coverage
- Check feature readiness
- Review defect counts

---

# 3. Feature Workflow

Feature Creation  
↓  
Test Cases Added  
↓  
Test Plan Created  
↓  
Execution Begins  
↓  
Defects Logged  
↓  
Fixes Applied  
↓  
Retesting  
↓  
Feature Verified

---

# 4. Feature Coverage Tracking

Coverage is calculated as:

Executed Test Cases / Total Test Cases

Example:

Feature: Payment

Total Test Cases = 40  
Executed = 30  

Coverage = 75%

---

# 5. Feature Risk Visibility

Features can be flagged as:

High Risk  
Medium Risk  
Low Risk

Based on:

- Defect count
- Failed test cases
- Critical functionality

---

# 6. Feature Reporting

Reports should support:

- Test coverage by feature
- Defects by feature
- Execution progress by feature
- High-risk features

This helps management track quality.

---

# 7. Example Real Workflow

Step 1  
Admin creates project "Banking App"

Step 2  
QA Lead adds features:

Login  
Fund Transfer  
Transaction History  

Step 3  
QA Engineers create test cases under each feature.

Step 4  
QA Lead creates Test Plan selecting test cases.

Step 5  
QA Engineers execute test plan.

Step 6  
Defects are logged against specific features.

Step 7  
Developers fix defects.

Step 8  
QA retests and verifies feature stability.

---

# 8. Best Practice Recommendations

Features should:

- represent functional modules
- be small and manageable
- contain 10–100 test cases ideally

Too large features create reporting problems.

---

# 9. Summary

Project:

Top level container that holds all testing activities.

Feature:

Logical grouping of test cases representing product functionality.

Using:

Project → Feature → Test Case

ensures

- scalability
- reporting accuracy
- professional test organization.

---

END




# TestFlow – Project View (Assigned Member Perspective)

---

# 1. Purpose

The Project View allows assigned team members to:

- Understand the project scope
- Access features and test cases
- View their assigned work
- Monitor testing progress
- Track defects related to the project

Each user sees **data filtered according to their role and assignments**.

---

# 2. Access Rules

Only **assigned members** can access a project.

Assigned roles may include:

- QA Lead
- QA Engineer
- QA Automation Engineer
- Developer
- Product Manager

If a user is not assigned to the project, they **cannot view the project**.

---

# 3. Project Page Layout

When a user opens a project, they see the **Project Dashboard**.

## Top Section (Project Header)

Displays:

Project Name  
Project Status  
Project Description  
Start Date  
Release Version  
QA Lead  
Team Members  

Example:

Project: Banking App  
Status: Active  
QA Lead: Sarah Khan  
Team Members: 12  

---

# 4. Navigation Tabs

Inside a project, users navigate through structured modules.

Navigation:

Dashboard  
Features  
Test Cases  
Test Plans  
Defects  
Reports  
Team

Each tab shows data filtered based on **role permissions**.

---

# 5. Project Dashboard (Assigned Member View)

The dashboard provides a quick overview of testing progress.

Widgets displayed:

- Total Features
- Total Test Cases
- Test Execution Progress
- Defect Summary
- My Assigned Tasks

Example:

Total Features: 8  
Total Test Cases: 320  

Execution:

Passed: 180  
Failed: 20  
Not Run: 120  

Execution Progress: 62%

---

# 6. My Assigned Work Section

Each user sees **their personal tasks**.

Example:

My Assigned Test Cases: 15  
My Active Test Plans: 2  
Defects Assigned to Me: 3  

This section helps users quickly start their work.

---

# 7. Features Tab

Shows the list of features in the project.

Columns:

Feature Name  
Owner  
Total Test Cases  
Execution Progress  
Defect Count  
Status  

Example:

| Feature | Test Cases | Progress | Defects |
|--------|------------|---------|--------|
| Login | 32 | 80% | 2 |
| Cart | 25 | 60% | 5 |
| Payment | 40 | 30% | 7 |

Clicking a feature opens:

- feature details
- related test cases
- defect list
- execution results

---

# 8. Test Cases Tab

Displays all test cases in the project.

Users can filter by:

Feature  
Priority  
Status  
Assigned Tester  

Example columns:

Test Case ID  
Title  
Feature  
Priority  
Assigned To  
Last Updated  

QA Engineers see **their assigned cases highlighted**.

---

# 9. Test Plans Tab

Shows all test plans for the project.

Columns:

Test Plan Name  
Release Version  
Status  
Execution Progress  
Created By  

Example:

| Test Plan | Release | Status | Progress |
|----------|---------|--------|---------|
| Sprint 5 Regression | v2.1 | Active | 45% |
| Login Testing | v2.0 | Completed | 100% |

Users can open test plans to view assigned execution tasks.

---

# 10. Defects Tab

Displays all defects related to the project.

Columns:

Defect ID  
Title  
Severity  
Status  
Assigned Developer  
Related Test Case  

Example:

| ID | Title | Severity | Status |
|----|------|---------|--------|
| BUG-101 | Login crash | Critical | Open |
| BUG-102 | Cart quantity error | Medium | In Progress |

Developers primarily work in this section.

---

# 11. Reports Tab

Provides testing insights.

Reports include:

Test Execution Progress  
Defect Distribution  
Feature Coverage  
Tester Performance  

Example charts:

- Execution progress chart
- Defect severity distribution
- Feature coverage graph

---

# 12. Team Tab

Displays project members.

Columns:

Name  
Role  
Assigned Tasks  
Status  

Example:

| Name | Role | Assigned Tasks |
|-----|------|---------------|
| Ahmed | QA Engineer | 18 |
| Sara | QA Lead | Management |
| John | Developer | 4 defects |

Users can see who is responsible for different parts of testing.

---

# 13. Role-Based Visibility

Different roles see slightly different project views.

---

## QA Engineer

Can view:

Features  
Test Cases  
Assigned Test Plans  
Defects  

Main focus:

Executing test cases and reporting bugs.

---

## QA Automation Engineer

Can view:

Features  
Automated test cases  
Execution results  

Main focus:

Automation execution.

---

## QA Lead

Can view:

Full project dashboard  
Team performance  
All test plans  
Execution progress  

Main focus:

Monitoring testing progress.

---

## Developer

Can view:

Defects  
Related test cases  
Feature information  

Main focus:

Fixing bugs.

---

## Product Manager

Can view:

Project dashboard  
Execution progress  
Defect trends  

Main focus:

Release readiness.

---

# 14. Example User Flow (QA Engineer)

Login  
↓  
Open Assigned Project  
↓  
View Dashboard  
↓  
Check "My Assigned Tasks"  
↓  
Open Test Plan  
↓  
Execute Test Cases  
↓  
Log Defect if needed

---

# 15. Key Design Principles

Project view must:

- Be role-aware
- Highlight assigned work
- Provide quick navigation
- Show real-time testing progress
- Support filtering and search

This ensures productivity and visibility across the team.

---

# 16. Summary

The Project View is the **central workspace for all assigned team members**.

It provides:

- Project overview
- Feature organization
- Test execution management
- Defect tracking
- Team collaboration

The interface adapts based on **user roles and responsibilities**, ensuring each user sees relevant information.

---

END