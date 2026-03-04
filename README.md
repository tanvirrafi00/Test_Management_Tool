# 📘 TestFlow - Personal Test Management System

A web-based test management platform designed to help QA engineers create, manage, execute, and track test cases efficiently.

## 🚀 Features

### Core Modules
- **Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
- **Project Management** - Create and manage testing projects
- **Test Case Management** - CRUD operations for test cases with versioning
- **Test Plans** - Group test cases for release cycles
- **Test Execution** - Track execution results with status (Pass/Fail/Blocked/Retest)
- **Defect Management** - Track and manage defects linked to test cases
- **Dashboard & Reporting** - Visual statistics and progress tracking

### User Roles
- **Admin** - Full system access, manage projects and users
- **QA Lead** - Create test plans, assign test cases, monitor execution
- **QA Engineer** - Create test cases, execute tests, log defects
- **Viewer** - View-only access to test cases and results

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts

## 📁 Project Structure

```
Test Management tool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── models/
│   │   │   ├── User.js             # User model
│   │   │   ├── Project.js          # Project model
│   │   │   ├── TestCase.js         # Test case model
│   │   │   ├── TestPlan.js         # Test plan model
│   │   │   ├── Execution.js        # Execution model
│   │   │   └── Defect.js           # Defect model
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Authentication routes
│   │   │   ├── projectRoutes.js    # Project routes
│   │   │   ├── testCaseRoutes.js   # Test case routes
│   │   │   ├── testPlanRoutes.js   # Test plan routes
│   │   │   ├── executionRoutes.js  # Execution routes
│   │   │   ├── defectRoutes.js     # Defect routes
│   │   │   └── dashboardRoutes.js  # Dashboard routes
│   │   ├── middlewares/
│   │   │   └── auth.js             # Authentication middleware
│   │   ├── utils/
│   │   │   ├── jwtUtils.js         # JWT utilities
│   │   │   └── errorHandler.js     # Error handling
│   │   └── server.js               # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── test-cases/
│   │   │   ├── test-plans/
│   │   │   ├── executions/
│   │   │   ├── defects/
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   └── DashboardLayout.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── lib/
│   │   │   ├── api.js              # API service layer
│   │   │   └── utils.js            # Utility functions
│   │   └── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── plan/
│   ├── prd1.md                     # Product Requirements Document
│   ├── structure_plan.md           # Project structure plan
│   └── git_plan.md                 # Git workflow plan
└── README.md
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Test Management tool"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables in .env
```

**Backend Environment Variables:**
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/testflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using mongod (if installed locally)
mongod

# Or using MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### 5. Create Test Users (Optional)

To quickly test the application, you can create test users with different roles:

```bash
cd backend
node create-test-user.js
```

This will create 4 test users with the following credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@testflow.com | admin123 |
| QA Lead | qa.lead@testflow.com | lead123 |
| QA Engineer | qa.engineer@testflow.com | engineer123 |
| Viewer | viewer@testflow.com | viewer123 |

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5001`

### Start Frontend Development Server

Open a new terminal and run:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📝 Usage

### 1. Register a New User

1. Navigate to `http://localhost:3000`
2. Click on "Register"
3. Fill in your details (name, email, password, role)
4. Click "Create Account"

### 2. Login

**Option A: Use Test Users**
- If you've run the test user creation script, use these credentials:
  - Admin: `admin@testflow.com` / `admin123`
  - QA Lead: `qa.lead@testflow.com` / `lead123`
  - QA Engineer: `qa.engineer@testflow.com` / `engineer123`
  - Viewer: `viewer@testflow.com` / `viewer123`

**Option B: Use Your Registered Account**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter your email and password
3. Click "Sign In"

### 3. Dashboard

After logging in, you'll see the dashboard with:
- Total projects, test cases, test plans, and executions
- Pass/fail rates
- Test coverage percentage
- Defect overview
- Execution progress

### 4. Create a Project

1. Navigate to "Projects" from the sidebar
2. Click "+ New Project"
3. Fill in project details
4. Assign team members

### 5. Create Test Cases

1. Navigate to "Test Cases"
2. Click "+ New Test Case"
3. Fill in test case details (title, description, steps, expected result, priority)
4. Assign to a tester

### 6. Create Test Plans

1. Navigate to "Test Plans"
2. Click "+ New Test Plan"
3. Add test cases to the plan
4. Assign testers

### 7. Execute Tests

1. Navigate to "Executions"
2. Select a test plan
3. Execute each test case
4. Update status (Pass/Fail/Blocked/Retest)
5. Add comments and link defects if failed

### 8. Log Defects

1. Navigate to "Defects"
2. Click "+ New Defect"
3. Fill in defect details
4. Link to test case/execution
5. Assign to developer

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update profile
- `PUT /api/auth/changepassword` - Change password

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin, QA Lead)
- `PUT /api/projects/:id` - Update project (Admin, QA Lead)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:userId` - Remove team member

### Test Cases
- `GET /api/testcases` - Get all test cases
- `GET /api/testcases/:id` - Get single test case
- `POST /api/testcases` - Create test case (QA Lead, QA Engineer)
- `PUT /api/testcases/:id` - Update test case (QA Lead, QA Engineer)
- `DELETE /api/testcases/:id` - Delete test case (Admin, QA Lead)
- `POST /api/testcases/:id/clone` - Clone test case

### Test Plans
- `GET /api/testplans` - Get all test plans
- `GET /api/testplans/:id` - Get single test plan
- `POST /api/testplans` - Create test plan (Admin, QA Lead)
- `PUT /api/testplans/:id` - Update test plan (Admin, QA Lead)
- `DELETE /api/testplans/:id` - Delete test plan (Admin)
- `POST /api/testplans/:id/testcases` - Add test cases to plan
- `DELETE /api/testplans/:id/testcases/:testCaseId` - Remove test case from plan

### Executions
- `GET /api/executions` - Get all executions
- `GET /api/executions/:id` - Get single execution
- `POST /api/executions` - Create execution (QA Lead, QA Engineer)
- `PUT /api/executions/:id` - Update execution (QA Lead, QA Engineer)
- `DELETE /api/executions/:id` - Delete execution (Admin, QA Lead)
- `GET /api/executions/testplan/:testPlanId` - Get executions by test plan
- `GET /api/executions/testcase/:testCaseId` - Get execution history

### Defects
- `GET /api/defects` - Get all defects
- `GET /api/defects/:id` - Get single defect
- `POST /api/defects` - Create defect (QA Lead, QA Engineer)
- `PUT /api/defects/:id` - Update defect (QA Lead, QA Engineer)
- `DELETE /api/defects/:id` - Delete defect (Admin, QA Lead)
- `PUT /api/defects/:id/assign` - Assign defect (Admin, QA Lead)
- `PUT /api/defects/:id/status` - Update defect status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/tester-wise` - Get tester-wise statistics
- `GET /api/dashboard/release-wise` - Get release-wise statistics

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📦 Build for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- TestFlow Development Team

## 🙏 Acknowledgments

- Built with Next.js and Express.js
- Styled with Tailwind CSS
- Icons from Lucide React

---

For more details, refer to the [Product Requirements Document](plan/prd1.md) and [Structure Plan](plan/structure_plan.md).
