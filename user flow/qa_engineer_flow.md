# 📘 QA Engineer Flow - TestFlow

---

## Overview

QA Engineers are responsible for manual testing, executing test cases, and logging defects. They have access to projects they're assigned to and can create test cases, execute tests, and create defects.

---

## 1️⃣ Dashboard Access

### User Flow
1. QA Engineer logs in
2. Redirected to Dashboard
3. Sees:
   - Assigned projects
   - Personal test case metrics
   - Personal execution status
   - Defects created/assigned

### Role Badge
- Displayed as "QA Specialist" with indigo color
- Subtitle: "Personal Assignment & Quality Hub"

### Navigation
QA Engineers have access to:
- Dashboard
- Projects (assigned only)
- Test Cases (assigned/created only)
- Test Plans (assigned only)
- Executions (performed by user)
- Defects (created/assigned)

---

## 2️⃣ View Projects

### User Flow
1. Click "Projects" in sidebar
2. See list of projects where user is a team member
3. Each project card shows:
   - Project name
   - Total test cases
   - Executed test cases
   - Open defects
   - Progress percentage

### Permissions
- ✅ View assigned projects
- ❌ Cannot create new projects (Admin/QA Lead only)
- ❌ Cannot edit projects (Admin/QA Lead only)
- ❌ Cannot delete projects (Admin only)

---

## 3️⃣ Create Test Case

### User Flow
1. Go to Test Cases page
2. Click "Create Test Case" button
3. Fill in:
   - Title (required)
   - Description
   - Preconditions
   - Test Steps (dynamic add/remove)
   - Expected Result
   - Priority (Critical, High, Medium, Low)
   - Severity (Critical, Major, Minor, Trivial)
   - Status (Draft, Ready, Deprecated)
   - Project (dropdown - assigned projects only)
   - Assign To (optional - team members)
4. Click "Save"

### System Flow
- Validate required fields
- Ensure project is one user is assigned to
- Create test case with `createdBy` = current user
- Return success with populated test case

### Permissions
- ✅ Create test cases
- ✅ Edit own test cases
- ✅ Delete own test cases (soft delete - mark as deprecated)
- ❌ Cannot edit/delete others' test cases

---

## 4️⃣ View Test Cases

### User Flow
1. Go to Test Cases page
2. See list of test cases where:
   - User is assigned to (assignedTo field)
   - OR user created the test case (createdBy field)
3. Filter options:
   - By project
   - By priority
   - By status
   - Search by title/description
4. Each test case card shows:
   - Title
   - Project name
   - Priority badge
   - Status badge
   - Assigned to (if any)
   - Created date

### Permissions
- ✅ View assigned/created test cases
- ❌ Cannot view others' test cases

---

## 5️⃣ View Test Plans

### User Flow
1. Go to Test Plans page
2. See list of test plans where user is assigned as tester
3. Each test plan shows:
   - Plan name
   - Release version
   - Date range
   - Number of test cases
   - Assigned testers
   - Progress percentage

### Permissions
- ✅ View assigned test plans
- ❌ Cannot create test plans (Admin/QA Lead only)
- ❌ Cannot edit test plans (Admin/QA Lead only)
- ❌ Cannot delete test plans (Admin only)

---

## 6️⃣ Execute Test

### User Flow
1. Go to Test Plans page
2. Click on assigned test plan
3. See list of test cases in the plan
4. Click on a test case to execute
5. View test case details:
   - Title, description, preconditions
   - Test steps with expected results
6. Select execution status:
   - Not Run
   - Pass
   - Fail
   - Blocked
7. Add comments (optional)
8. Click "Submit Execution"

### System Flow
- Validate user is assigned to the test plan
- Create execution record with:
  - testCaseId
  - testPlanId
  - executedBy = current user
  - status
  - comments
  - executedAt = current timestamp
- If status = "Fail", prompt to create defect
- Return success with populated execution

### Permissions
- ✅ Execute assigned test cases
- ✅ View own execution history
- ❌ Cannot execute unassigned test cases

---

## 7️⃣ Create Defect

### Triggered When
- Execution status = "Fail"
- User clicks "Create Defect" button

### User Flow
1. After failing a test, click "Create Defect"
2. Pre-filled with:
   - Title: "Failed: [Test Case Title]"
   - Description: Test execution failed with status: fail
   - Steps to Reproduce: Auto-populated from test case steps
   - Severity: Auto-populated from test case severity
   - Priority: Auto-populated from test case priority
   - Project: Linked to test case's project
   - Linked Test Case: Test case ID and title
   - Linked Execution: Execution ID and status
   - Assigned To: Default to current user
3. User can edit all fields
4. Click "Create Defect"

### System Flow
- Validate required fields
- Create defect with:
  - title
  - description
  - stepsToReproduce
  - expectedResult
  - actualResult
  - severity
  - priority
  - status = "open"
  - linkedTestCase
  - linkedExecution
  - project
  - createdBy = current user
  - assignedTo
- Link defect to execution (execution.linkedDefect = defect._id)
- Return success with populated defect

### Permissions
- ✅ Create defects for assigned test cases
- ✅ View created/assigned defects
- ✅ Edit own defects
- ✅ Update defect status
- ✅ Add comments to own/assigned defects
- ❌ Cannot create defects for unassigned test cases

---

## 8️⃣ View Defects

### User Flow
1. Go to Defects page
2. See list of defects where:
   - User created the defect (createdBy field)
   - OR user is assigned to the defect (assignedTo field)
3. Filter options:
   - By project
   - By status
   - By severity
   - By priority
   - By assigned user
4. Each defect card shows:
   - Title
   - Project name
   - Severity badge
   - Priority badge
   - Status badge
   - Assigned to
   - Created date
   - Linked test case (if any)

### Permissions
- ✅ View created/assigned defects
- ❌ Cannot view others' defects

---

## 9️⃣ Update Defect Status

### User Flow
1. Go to Defects page
2. Click on a defect (created or assigned)
3. View defect details
4. Click "Update Status" button
5. Select new status:
   - Open
   - In Progress
   - Fixed
   - Closed
   - Retest
6. Add comments (optional)
7. Click "Update"

### System Flow
- Validate user is creator or assignee
- Update defect status
- Add comment to defect comments array
- Return success with updated defect

### Permissions
- ✅ Update status of created/assigned defects
- ❌ Cannot update status of others' defects

---

## 🔟 Dashboard Statistics

### What QA Engineer Sees

On Dashboard, QA Engineer sees:

#### Quick Stats
- Test Cases: Count of assigned/created test cases
- Plans: Count of assigned test plans
- Runs: Count of executions performed by user
- Defects: Count of open defects (created/assigned)

#### Project Cards
- Only projects where user is a team member
- Each card shows project-specific metrics

#### Activity Feed
- Recent test cases created by user
- Recent executions performed by user
- Recent defects created/assigned to user

#### Charts
- Test Case Status Distribution (for user's test cases)
- Defect Severity Distribution (for user's defects)

---

## 🎨 UI Color Scheme for QA Engineer

### Role Badge
- Background: `bg-indigo-50`
- Text: `text-indigo-700`
- Border: `border-indigo-100`

### Buttons
- Primary Action: `bg-primary-600` (indigo)
- Secondary Action: `bg-gray-50`
- Danger Action: `bg-rose-50` (red)

### Status Badges
- Pass: `text-emerald-500` (green)
- Fail: `text-rose-500` (red)
- Blocked: `text-amber-500` (orange)
- Not Run: `text-gray-500` (gray)

### Priority Badges
- Critical: `bg-rose-50 text-rose-600 border-rose-100`
- High: `bg-orange-50 text-orange-600 border-orange-100`
- Medium: `bg-amber-50 text-amber-600 border-amber-100`
- Low: `bg-emerald-50 text-emerald-600 border-emerald-100`

### Severity Badges
- Critical: `bg-rose-50 text-rose-600 border-rose-100`
- Major: `bg-amber-50 text-amber-600 border-amber-100`
- Minor: `bg-emerald-50 text-emerald-600 border-emerald-100`
- Trivial: `bg-sky-50 text-sky-600 border-sky-100`

---

## ✅ QA Engineer Capabilities Summary

| Feature | Can Create | Can View | Can Edit | Can Delete |
|---------|-------------|------------|-----------|-------------|
| Projects | ❌ | Assigned only | ❌ | ❌ |
| Test Cases | ✅ | Assigned/Created | Own only | Own only |
| Test Plans | ❌ | Assigned only | ❌ | ❌ |
| Executions | ✅ | Own only | Own only | ❌ |
| Defects | ✅ | Created/Assigned | Own only | ❌ |

---

## 🔐 Security & Permissions

### API Endpoints Access

#### Projects
- `GET /api/projects` - Filtered by team membership
- `GET /api/projects/:id` - Only if team member
- `POST /api/projects` - Forbidden (403)
- `PUT /api/projects/:id` - Forbidden (403)
- `DELETE /api/projects/:id` - Forbidden (403)

#### Test Cases
- `GET /api/testcases` - Filtered by assignedTo or createdBy
- `GET /api/testcases/:id` - Only if assignedTo or createdBy
- `POST /api/testcases` - Allowed
- `PUT /api/testcases/:id` - Only if createdBy
- `DELETE /api/testcases/:id` - Only if createdBy

#### Test Plans
- `GET /api/testplans` - Filtered by assignedTesters
- `GET /api/testplans/:id` - Only if assignedTester
- `POST /api/testplans` - Forbidden (403)
- `PUT /api/testplans/:id` - Forbidden (403)
- `DELETE /api/testplans/:id` - Forbidden (403)

#### Executions
- `GET /api/executions` - Filtered by executedBy
- `GET /api/executions/:id` - Only if executedBy
- `POST /api/executions` - Allowed
- `PUT /api/executions/:id` - Only if executedBy
- `DELETE /api/executions/:id` - Forbidden (403)

#### Defects
- `GET /api/defects` - Filtered by createdBy or assignedTo
- `GET /api/defects/:id` - Only if createdBy or assignedTo
- `POST /api/defects` - Allowed
- `PUT /api/defects/:id` - Only if createdBy or assignedTo
- `DELETE /api/defects/:id` - Forbidden (403)
- `PUT /api/defects/:id/status` - Allowed for createdBy or assignedTo
- `POST /api/defects/:id/comments` - Allowed for createdBy or assignedTo

---

## 🎯 Complete QA Engineer Workflow

```
Login → Dashboard
    ↓
View Assigned Projects
    ↓
Create Test Case → Assign to Self
    ↓
Create/Join Test Plan → Get Assigned
    ↓
Execute Test Case → Select Status
    ↓
If Fail → Create Defect → Assign to Developer
    ↓
View Defects → Track Progress
    ↓
Update Defect Status → When Fixed
    ↓
Retest Test Case → Update Execution
    ↓
Close Defect → When Verified
```

---

## 📋 Implementation Checklist

### Backend ✅
- [x] User model supports `qa_engineer` role
- [x] Auth middleware validates role
- [x] Project routes filter by team membership
- [x] Test case routes filter by assignedTo/createdBy
- [x] Test plan routes filter by assignedTesters
- [x] Execution routes filter by executedBy
- [x] Defect routes filter by createdBy/assignedTo
- [x] QA Engineer can create test cases
- [x] QA Engineer can execute tests
- [x] QA Engineer can create defects
- [x] QA Engineer cannot create/edit/delete projects
- [x] QA Engineer cannot create/edit/delete test plans

### Frontend ✅
- [x] Dashboard shows role badge (QA Specialist)
- [x] Navigation shows correct menu items
- [x] Projects page shows assigned projects only
- [x] Test Cases page shows assigned/created test cases
- [x] Test Plans page shows assigned test plans
- [x] Executions page shows own executions
- [x] Defects page shows created/assigned defects
- [x] Create Test Case button available
- [x] Execute Test button available
- [x] Create Defect button available
- [x] New Project button hidden
- [x] New Plan button hidden
- [x] Proper color scheme applied

---

# End of QA Engineer Flow Document
