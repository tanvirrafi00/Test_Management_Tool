# 📘 TestFlow – Detailed Test Plan Module Design

---

# 🎯 What is a Test Plan?

A Test Plan defines:

- What to test
- When to test
- Who will test
- Which test cases are included
- What release/version it belongs to

It groups test cases into a structured execution cycle.

---

# 🏗 Position in Hierarchy

Project
└── Release (optional)
  └── Feature
    └── Test Cases

Test Plan sits at Project or Release level.

Recommended:

Project
└── Release
  └── Test Plan
    └── Selected Test Cases

---

# 🧱 Test Plan Core Fields

## Basic Information

- id
- project_id
- release_id (optional but recommended)
- name
- description
- start_date
- end_date
- status
- created_by
- created_at

---

## Status Lifecycle

Draft → Active → Completed → Archived

### Draft
- Can add/remove test cases
- Can assign testers
- Editable

### Active
- Execution allowed
- Cannot remove test cases
- Limited editing

### Completed
- No new execution allowed
- Report locked

### Archived
- Historical reference only

---

# 🧩 Test Plan Components

A Test Plan contains:

- Test Cases
- Assigned QA Engineers
- Execution Records
- Summary Metrics
- Linked Defects

---

# 🧪 Test Case Selection Logic

When creating Test Plan:

1. Select Project
2. Select Release (if applicable)
3. Filter test cases by:
   - Feature
   - Priority
   - Tags
   - Status
4. Select test cases
5. Assign each test case to a QA Engineer
6. Save as Draft

---

# 🧑‍💻 Execution Flow

When status = Active:

QA Engineer can:

- Open Test Plan
- View assigned test cases
- Execute test cases
- Mark PASS / FAIL / BLOCKED
- Log defect

Each execution creates:

Execution Record:
- test_plan_id
- test_case_id
- executed_by
- status
- execution_date
- comment

---

# 📊 Test Plan Metrics

Auto-calculated:

- Total Test Cases
- Passed
- Failed
- Blocked
- Not Run
- Execution %
- Defect Count
- Reopened Defects

---

# 👥 Role-Based Access for Test Plan

---

# 🔐 ADMIN

Can:

✔ Create Test Plan  
✔ Edit Test Plan  
✔ Delete Test Plan  
✔ Change status  
✔ View all test plans  
✔ Archive test plan  
✔ Export reports  

Cannot:

✖ Execute test cases (best practice restriction)

---

# 🧑‍💼 QA LEAD

Primary owner of Test Plans.

Can:

✔ Create Test Plan  
✔ Add/remove test cases (Draft only)  
✔ Assign test cases to QA Engineers  
✔ Activate Test Plan  
✔ Monitor execution progress  
✔ View execution details  
✔ Reassign test cases  
✔ Mark Completed  

Cannot:

✖ Delete after Active (optional restriction)

---

# 👩‍💻 QA ENGINEER

Execution role.

Can:

✔ View assigned Test Plans  
✔ View assigned test cases  
✔ Execute test cases  
✔ Log defects  
✔ Add execution comments  

Cannot:

✖ Add/remove test cases  
✖ Activate plan  
✖ Assign others  
✖ Modify plan details  

---

# 🤖 QA AUTOMATION ENGINEER

Can:

✔ View assigned Test Plans  
✔ Execute automated test cases  
✔ Upload execution results  
✔ Log defects  
✔ View execution history  

Cannot:

✖ Modify plan structure  
✖ Assign users  

---

# 👨‍💻 DEVELOPER

Can:

✔ View test plan summary (read-only)  
✔ View failed test cases related to their defects  

Cannot:

✖ Execute test cases  
✖ Modify test plan  
✖ Assign test cases  

---

# 📊 PRODUCT MANAGER

Read-only access.

Can:

✔ View test plan summary  
✔ View execution %  
✔ View defect summary  
✔ Download report  

Cannot:

✖ Modify  
✖ Execute  
✖ Assign  

---

# 🧭 Complete Test Plan Workflow

QA Lead creates Draft  
↓  
Select Test Cases  
↓  
Assign QA Engineers  
↓  
Activate Test Plan  
↓  
QA Engineers Execute  
↓  
Defects Logged  
↓  
Retesting  
↓  
QA Lead Reviews Metrics  
↓  
Mark Completed  
↓  
Admin Archives  

---

# 📌 Advanced Professional Enhancements (Optional)

- Allow cloning test plan from previous release
- Risk-based test selection
- Environment selection (QA / Staging / UAT)
- Attach documents
- Lock plan after completion
- Execution trend graph
- Retest tracking count

---

# 📋 UI Structure

Inside Project:

Tabs:

[ Dashboard ]  
[ Features ]  
[ Test Cases ]  
[ Test Plans ]  
[ Defects ]  

---

Inside Test Plan:

Sections:

1. Overview
2. Test Cases
3. Execution Results
4. Defects
5. Reports

---

# 📎 Reporting Capabilities

Test Plan Report includes:

- Summary statistics
- Feature-wise breakdown
- Tester performance
- Defect distribution
- Execution timeline

Export formats:

- PDF
- Excel

---

# 🏁 Final Professional Recommendation

Test Plan must:

✔ Be owned by QA Lead  
✔ Be structured by Release  
✔ Have clear status lifecycle  
✔ Restrict editing after activation  
✔ Track execution separately from test case definition  
✔ Provide summary analytics  

Without structured Test Plan module → tool feels basic  
With this design → tool becomes production-ready  

---

End of Test Plan Module Design