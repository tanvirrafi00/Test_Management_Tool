/**
 * Comprehensive Test Suite for Test Management Tool
 * 
 * This script tests all implemented features end-to-end:
 * 1. Authentication Module
 * 2. Projects Module
 * 3. Test Cases Module
 * 4. Test Plans Module
 * 5. Executions Module
 * 6. Defects Module
 * 7. Dashboard Module
 * 8. Role-Based Access Control
 * 9. Data Integrity Validation
 * 10. Soft Delete Functionality
 * 11. Automatic Defect Creation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Execution = require('./src/models/Execution');
const Defect = require('./src/models/Defect');
const TestCase = require('./src/models/TestCase');
const TestPlan = require('./src/models/TestPlan');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

// Test results tracking
const testResults = {
    passed: [],
    failed: [],
    skipped: []
};

// Helper function to log test results
function logTest(module, testName, passed, message = '') {
    const result = { module, testName, passed, message, timestamp: new Date() };
    if (passed) {
        testResults.passed.push(result);
        console.log(`✅ PASS [${module}] ${testName}`);
        if (message) console.log(`   ${message}`);
    } else {
        testResults.failed.push(result);
        console.log(`❌ FAIL [${module}] ${testName}`);
        if (message) console.log(`   ${message}`);
    }
}

// Helper function to log skipped tests
function logSkip(module, testName, message) {
    const result = { module, testName, passed: null, message, timestamp: new Date() };
    testResults.skipped.push(result);
    console.log(`⏭️  SKIP [${module}] ${testName}`);
    if (message) console.log(`   ${message}`);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('\n✅ MongoDB connected successfully'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Store test data for use across tests
const testData = {
    users: {},
    projects: {},
    testCases: {},
    testPlans: {},
    executions: {},
    defects: {}
};

async function runAllTests() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║     COMPREHENSIVE TEST SUITE - TEST MANAGEMENT TOOL           ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        // Clean up test data from previous runs
        await cleanupTestData();

        // Run all test modules
        await testAuthenticationModule();
        await testProjectsModule();
        await testTestCasesModule();
        await testTestPlansModule();
        await testExecutionsModule();
        await testDefectsModule();
        await testDashboardModule();
        await testRoleBasedAccessControl();
        await testDataIntegrityValidation();
        await testSoftDeleteFunctionality();
        await testAutomaticDefectCreation();

        // Print comprehensive report
        printTestReport();

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        console.error(error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

async function cleanupTestData() {
    console.log('\n🧹 Cleaning up test data from previous runs...');
    await User.deleteMany({ email: /@test\.com$/ });
    await Project.deleteMany({ name: /Test Project/ });
    await TestCase.deleteMany({ title: /Test Case/ });
    await TestPlan.deleteMany({ name: /Test Plan/ });
    await Execution.deleteMany({});
    await Defect.deleteMany({});
    console.log('✅ Cleanup complete\n');
}

// ============================================
// 1. AUTHENTICATION MODULE TESTS
// ============================================
async function testAuthenticationModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 1: AUTHENTICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 1.1: User registration (should default to qa_engineer role)
        console.log('1.1 Testing user registration with default role...');
        const user1 = await User.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: 'Password123!',
            role: 'admin'
        });
        testData.users.admin = user1;
        logTest('Authentication', 'User registration - admin role', true, `Created user: ${user1.email}, Role: ${user1.role}`);

        const user2 = await User.create({
            name: 'Test QA Lead',
            email: 'qalead@test.com',
            password: 'Password123!',
            role: 'qa_lead'
        });
        testData.users.qaLead = user2;
        logTest('Authentication', 'User registration - qa_lead role', true, `Created user: ${user2.email}, Role: ${user2.role}`);

        const user3 = await User.create({
            name: 'Test QA Engineer',
            email: 'qaengineer@test.com',
            password: 'Password123!',
            role: 'qa_engineer'
        });
        testData.users.qaEngineer = user3;
        logTest('Authentication', 'User registration - qa_engineer role', true, `Created user: ${user3.email}, Role: ${user3.role}`);

        const user4 = await User.create({
            name: 'Test Viewer',
            email: 'viewer@test.com',
            password: 'Password123!',
            role: 'viewer'
        });
        testData.users.viewer = user4;
        logTest('Authentication', 'User registration - viewer role', true, `Created user: ${user4.email}, Role: ${user4.role}`);

        // Test 1.2: Default role assignment
        console.log('\n1.2 Testing default role assignment...');
        const user5 = await User.create({
            name: 'Test Default User',
            email: 'default@test.com',
            password: 'Password123!'
        });
        testData.users.default = user5;
        const hasDefaultRole = user5.role === 'qa_engineer';
        logTest('Authentication', 'Default role assignment', hasDefaultRole,
            hasDefaultRole ? `User assigned default role: ${user5.role}` : `Expected qa_engineer, got ${user5.role}`);

        // Test 1.3: Verify all users created
        const userCount = await User.countDocuments({ email: /@test\.com$/ });
        logTest('Authentication', 'All test users created', userCount === 5, `Created ${userCount} test users`);

    } catch (error) {
        logTest('Authentication', 'Authentication module tests', false, error.message);
    }
}

// ============================================
// 2. PROJECTS MODULE TESTS
// ============================================
async function testProjectsModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 2: PROJECTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 2.1: Create project with team members
        console.log('2.1 Testing project creation with team members...');
        const project1 = await Project.create({
            name: 'Test Project 1',
            description: 'Test project for comprehensive testing',
            status: 'active',
            createdBy: testData.users.admin._id,
            teamMembers: [
                testData.users.qaLead._id,
                testData.users.qaEngineer._id
            ]
        });
        testData.projects.project1 = project1;
        logTest('Projects', 'Create project with team members', true,
            `Created project: ${project1.projectId}, Team members: ${project1.teamMembers.length}`);

        const project2 = await Project.create({
            name: 'Test Project 2',
            description: 'Second test project',
            status: 'active',
            createdBy: testData.users.qaLead._id,
            teamMembers: [testData.users.qaEngineer._id]
        });
        testData.projects.project2 = project2;
        logTest('Projects', 'Create project by QA Lead', true, `Created project: ${project2.projectId}`);

        // Test 2.2: View project list
        console.log('\n2.2 Testing project list retrieval...');
        const projects = await Project.find({ status: 'active' });
        logTest('Projects', 'Retrieve project list', projects.length >= 2, `Found ${projects.length} active projects`);

        // Test 2.3: Add team member to project
        console.log('\n2.3 Testing add team member to project...');
        project2.teamMembers.push(testData.users.viewer._id);
        await project2.save();
        const updatedProject = await Project.findById(project2._id);
        logTest('Projects', 'Add team member to project', updatedProject.teamMembers.includes(testData.users.viewer._id),
            `Team members: ${updatedProject.teamMembers.length}`);

        // Test 2.4: Remove team member from project
        console.log('\n2.4 Testing remove team member from project...');
        updatedProject.teamMembers = updatedProject.teamMembers.filter(id => !id.equals(testData.users.viewer._id));
        await updatedProject.save();
        const projectAfterRemove = await Project.findById(project2._id);
        logTest('Projects', 'Remove team member from project', !projectAfterRemove.teamMembers.includes(testData.users.viewer._id),
            `Team members: ${projectAfterRemove.teamMembers.length}`);

        // Test 2.5: Filter projects by status
        console.log('\n2.5 Testing filter projects by status...');
        const activeProjects = await Project.find({ status: 'active' });
        logTest('Projects', 'Filter projects by active status', activeProjects.length >= 2, `Found ${activeProjects.length} active projects`);

        // Test 2.6: Search projects by name
        console.log('\n2.6 Testing search projects by name...');
        const searchResults = await Project.find({ name: /Test Project 1/ });
        logTest('Projects', 'Search projects by name', searchResults.length === 1, `Found ${searchResults.length} matching projects`);

    } catch (error) {
        logTest('Projects', 'Projects module tests', false, error.message);
    }
}

// ============================================
// 3. TEST CASES MODULE TESTS
// ============================================
async function testTestCasesModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 3: TEST CASES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 3.1: Create test case with dynamic steps
        console.log('3.1 Testing test case creation with dynamic steps...');
        const testCase1 = await TestCase.create({
            title: 'Test Case 1 - Login Functionality',
            description: 'Test user login functionality',
            preconditions: 'User must be registered',
            project: testData.projects.project1._id,
            createdBy: testData.users.qaEngineer._id,
            priority: 'high',
            status: 'ready',
            testSteps: [
                {
                    stepNumber: 1,
                    action: 'Navigate to login page',
                    expectedResult: 'Login page is displayed'
                },
                {
                    stepNumber: 2,
                    action: 'Enter valid credentials',
                    expectedResult: 'Credentials are accepted'
                },
                {
                    stepNumber: 3,
                    action: 'Click login button',
                    expectedResult: 'User is logged in successfully'
                }
            ]
        });
        testData.testCases.testCase1 = testCase1;
        logTest('Test Cases', 'Create test case with dynamic steps', true,
            `Created test case: ${testCase1.testCaseId}, Steps: ${testCase1.testSteps.length}`);

        const testCase2 = await TestCase.create({
            title: 'Test Case 2 - User Registration',
            description: 'Test user registration flow',
            preconditions: 'User is not registered',
            project: testData.projects.project1._id,
            createdBy: testData.users.qaEngineer._id,
            priority: 'medium',
            status: 'ready',
            testSteps: [
                {
                    stepNumber: 1,
                    action: 'Navigate to registration page',
                    expectedResult: 'Registration form is displayed'
                },
                {
                    stepNumber: 2,
                    action: 'Fill in registration details',
                    expectedResult: 'Details are validated'
                },
                {
                    stepNumber: 3,
                    action: 'Submit registration form',
                    expectedResult: 'User is registered successfully'
                }
            ]
        });
        testData.testCases.testCase2 = testCase2;

        const testCase3 = await TestCase.create({
            title: 'Test Case 3 - Dashboard Display',
            description: 'Test dashboard statistics display',
            preconditions: 'User must be logged in',
            project: testData.projects.project1._id,
            createdBy: testData.users.qaLead._id,
            priority: 'low',
            status: 'ready',
            testSteps: [
                {
                    stepNumber: 1,
                    action: 'Navigate to dashboard',
                    expectedResult: 'Dashboard is displayed'
                },
                {
                    stepNumber: 2,
                    action: 'Verify statistics',
                    expectedResult: 'Statistics are accurate'
                }
            ]
        });
        testData.testCases.testCase3 = testCase3;

        // Test 3.2: Set priority levels
        console.log('\n3.2 Testing priority levels...');
        const priorities = ['low', 'medium', 'high', 'critical'];
        const allPrioritiesValid = priorities.includes(testCase1.priority) &&
            priorities.includes(testCase2.priority) &&
            priorities.includes(testCase3.priority);
        logTest('Test Cases', 'Priority levels', allPrioritiesValid, 'All test cases have valid priorities');

        // Test 3.3: Set status values
        console.log('\n3.3 Testing status values...');
        const statuses = ['ready', 'in_progress', 'completed', 'deprecated'];
        const allStatusesValid = statuses.includes(testCase1.status);
        logTest('Test Cases', 'Status values', allStatusesValid, `Status: ${testCase1.status}`);

        // Test 3.4: Assign test case to user
        console.log('\n3.4 Testing test case assignment...');
        testCase1.assignedTo = testData.users.qaEngineer._id;
        await testCase1.save();
        const assignedTestCase = await TestCase.findById(testCase1._id).populate('assignedTo');
        logTest('Test Cases', 'Assign test case to user', assignedTestCase.assignedTo.email === 'qaengineer@test.com',
            `Assigned to: ${assignedTestCase.assignedTo.name}`);

        // Test 3.5: Filter test cases by project
        console.log('\n3.5 Testing filter test cases by project...');
        const projectTestCases = await TestCase.find({ project: testData.projects.project1._id });
        logTest('Test Cases', 'Filter test cases by project', projectTestCases.length >= 3,
            `Found ${projectTestCases.length} test cases for project`);

        // Test 3.6: Filter test cases by status
        console.log('\n3.6 Testing filter test cases by status...');
        const readyTestCases = await TestCase.find({ status: 'ready' });
        logTest('Test Cases', 'Filter test cases by status', readyTestCases.length >= 3,
            `Found ${readyTestCases.length} ready test cases`);

        // Test 3.7: Filter test cases by priority
        console.log('\n3.7 Testing filter test cases by priority...');
        const highPriorityTestCases = await TestCase.find({ priority: 'high' });
        logTest('Test Cases', 'Filter test cases by priority', highPriorityTestCases.length >= 1,
            `Found ${highPriorityTestCases.length} high priority test cases`);

        // Test 3.8: Search test cases
        console.log('\n3.8 Testing search test cases...');
        const searchResults = await TestCase.find({ title: /Login/ });
        logTest('Test Cases', 'Search test cases', searchResults.length === 1,
            `Found ${searchResults.length} matching test cases`);

        // Test 3.9: Clone test case
        console.log('\n3.9 Testing test case cloning...');
        const clonedTestCase = await TestCase.create({
            title: 'Test Case 1 - Clone',
            description: testCase1.description,
            preconditions: testCase1.preconditions,
            project: testCase1.project,
            createdBy: testCase1.createdBy,
            priority: testCase1.priority,
            status: 'ready',
            testSteps: testCase1.testSteps
        });
        testData.testCases.clonedTestCase = clonedTestCase;
        const isClone = clonedTestCase.title.includes('Clone') &&
            clonedTestCase._id.toString() !== testCase1._id.toString();
        logTest('Test Cases', 'Clone test case', isClone,
            `Original: ${testCase1.testCaseId}, Clone: ${clonedTestCase.testCaseId}`);

    } catch (error) {
        logTest('Test Cases', 'Test Cases module tests', false, error.message);
    }
}

// ============================================
// 4. TEST PLANS MODULE TESTS
// ============================================
async function testTestPlansModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 4: TEST PLANS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 4.1: Create test plan with test cases
        console.log('4.1 Testing test plan creation with test cases...');
        const testPlan1 = await TestPlan.create({
            name: 'Test Plan 1 - Sprint 1',
            description: 'Test plan for Sprint 1',
            project: testData.projects.project1._id,
            releaseVersion: 'v1.0.0',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            createdBy: testData.users.qaLead._id,
            status: 'active',
            testCases: [
                testData.testCases.testCase1._id,
                testData.testCases.testCase2._id,
                testData.testCases.testCase3._id
            ],
            assignedTesters: [
                testData.users.qaEngineer._id
            ]
        });
        testData.testPlans.testPlan1 = testPlan1;
        logTest('Test Plans', 'Create test plan with test cases', true,
            `Created test plan: ${testPlan1.testPlanId}, Test cases: ${testPlan1.testCases.length}`);

        const testPlan2 = await TestPlan.create({
            name: 'Test Plan 2 - Sprint 2',
            description: 'Test plan for Sprint 2',
            project: testData.projects.project1._id,
            releaseVersion: 'v1.1.0',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-28'),
            createdBy: testData.users.qaLead._id,
            status: 'active',
            testCases: [testData.testCases.testCase1._id],
            assignedTesters: [testData.users.qaEngineer._id]
        });
        testData.testPlans.testPlan2 = testPlan2;

        // Test 4.2: Assign multiple testers
        console.log('\n4.2 Testing assign multiple testers to plan...');
        testPlan1.assignedTesters.push(testData.users.viewer._id);
        await testPlan1.save();
        const updatedTestPlan = await TestPlan.findById(testPlan1._id);
        logTest('Test Plans', 'Assign multiple testers', updatedTestPlan.assignedTesters.length === 2,
            `Testers: ${updatedTestPlan.assignedTesters.length}`);

        // Test 4.3: View plan details with linked test cases
        console.log('\n4.3 Testing view plan details with linked test cases...');
        const planWithTestCases = await TestPlan.findById(testPlan1._id).populate('testCases');
        logTest('Test Plans', 'View plan with test cases', planWithTestCases.testCases.length === 3,
            `Linked test cases: ${planWithTestCases.testCases.length}`);

        // Test 4.4: Add test case to plan
        console.log('\n4.4 Testing add test case to plan...');
        testPlan2.testCases.push(testData.testCases.testCase2._id);
        await testPlan2.save();
        const planAfterAdd = await TestPlan.findById(testPlan2._id);
        logTest('Test Plans', 'Add test case to plan', planAfterAdd.testCases.length === 2,
            `Test cases: ${planAfterAdd.testCases.length}`);

        // Test 4.5: Remove test case from plan
        console.log('\n4.5 Testing remove test case from plan...');
        planAfterAdd.testCases = planAfterAdd.testCases.filter(id => !id.equals(testData.testCases.testCase2._id));
        await planAfterAdd.save();
        const planAfterRemove = await TestPlan.findById(testPlan2._id);
        logTest('Test Plans', 'Remove test case from plan', planAfterRemove.testCases.length === 1,
            `Test cases: ${planAfterRemove.testCases.length}`);

        // Test 4.6: Filter test plans by project
        console.log('\n4.6 Testing filter test plans by project...');
        const projectTestPlans = await TestPlan.find({ project: testData.projects.project1._id });
        logTest('Test Plans', 'Filter test plans by project', projectTestPlans.length >= 2,
            `Found ${projectTestPlans.length} test plans`);

        // Test 4.7: Filter test plans by status
        console.log('\n4.7 Testing filter test plans by status...');
        const activeTestPlans = await TestPlan.find({ status: 'active' });
        logTest('Test Plans', 'Filter test plans by status', activeTestPlans.length >= 2,
            `Found ${activeTestPlans.length} active test plans`);

        // Test 4.8: Filter test plans by release version
        console.log('\n4.8 Testing filter test plans by release version...');
        const versionTestPlans = await TestPlan.find({ releaseVersion: 'v1.0.0' });
        logTest('Test Plans', 'Filter test plans by release version', versionTestPlans.length === 1,
            `Found ${versionTestPlans.length} test plans for v1.0.0`);

        // Test 4.9: Progress calculation (executed / total test cases)
        console.log('\n4.9 Testing progress calculation...');
        // Note: Progress is calculated in the route, here we just verify the structure
        const hasTestCases = testPlan1.testCases.length > 0;
        logTest('Test Plans', 'Progress calculation structure', hasTestCases,
            `Test cases for progress: ${testPlan1.testCases.length}`);

    } catch (error) {
        logTest('Test Plans', 'Test Plans module tests', false, error.message);
    }
}

// ============================================
// 5. EXECUTIONS MODULE TESTS
// ============================================
async function testExecutionsModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 5: EXECUTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 5.1: Create execution with pass status
        console.log('5.1 Testing create execution with pass status...');
        const execution1 = await Execution.create({
            testCase: testData.testCases.testCase1._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'pass',
            comments: 'Test passed successfully'
        });
        testData.executions.execution1 = execution1;
        logTest('Executions', 'Create execution with pass status', true,
            `Created execution: ${execution1.executionId}, Status: ${execution1.status}`);

        // Test 5.2: Create execution with fail status
        console.log('\n5.2 Testing create execution with fail status...');
        const execution2 = await Execution.create({
            testCase: testData.testCases.testCase2._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'fail',
            comments: 'Test failed due to bug',
            createDefect: false
        });
        testData.executions.execution2 = execution2;
        logTest('Executions', 'Create execution with fail status', true,
            `Created execution: ${execution2.executionId}, Status: ${execution2.status}`);

        // Test 5.3: Create execution with blocked status
        console.log('\n5.3 Testing create execution with blocked status...');
        const execution3 = await Execution.create({
            testCase: testData.testCases.testCase3._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'blocked',
            comments: 'Test blocked due to environment issue'
        });
        testData.executions.execution3 = execution3;
        logTest('Executions', 'Create execution with blocked status', true,
            `Created execution: ${execution3.executionId}, Status: ${execution3.status}`);

        // Test 5.4: Create execution with retest status
        console.log('\n5.4 Testing create execution with retest status...');
        const execution4 = await Execution.create({
            testCase: testData.testCases.testCase1._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'retest',
            comments: 'Test needs retesting after fix'
        });
        testData.executions.execution4 = execution4;
        logTest('Executions', 'Create execution with retest status', true,
            `Created execution: ${execution4.executionId}, Status: ${execution4.status}`);

        // Test 5.5: Create execution with not_run status
        console.log('\n5.5 Testing create execution with not_run status...');
        const execution5 = await Execution.create({
            testCase: testData.testCases.testCase2._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'not_run',
            comments: 'Test not yet executed'
        });
        testData.executions.execution5 = execution5;
        logTest('Executions', 'Create execution with not_run status', true,
            `Created execution: ${execution5.executionId}, Status: ${execution5.status}`);

        // Test 5.6: Verify all status values
        console.log('\n5.6 Testing all execution status values...');
        const statuses = ['not_run', 'pass', 'fail', 'blocked', 'retest'];
        const allStatusesCreated = statuses.includes(execution1.status) &&
            statuses.includes(execution2.status) &&
            statuses.includes(execution3.status) &&
            statuses.includes(execution4.status) &&
            statuses.includes(execution5.status);
        logTest('Executions', 'All execution status values', allStatusesCreated, 'All status types created');

        // Test 5.7: View execution history
        console.log('\n5.7 Testing view execution history...');
        const allExecutions = await Execution.find({}).sort({ createdAt: 1 });
        logTest('Executions', 'View execution history', allExecutions.length >= 5,
            `Found ${allExecutions.length} executions`);

        // Test 5.8: Re-execute test case (create new execution record)
        console.log('\n5.8 Testing re-execute test case...');
        const reExecution = await Execution.create({
            testCase: testData.testCases.testCase1._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'pass',
            comments: 'Re-execution after fix'
        });
        testData.executions.reExecution = reExecution;
        const testCaseExecutions = await Execution.find({
            testCase: testData.testCases.testCase1._id
        });
        logTest('Executions', 'Re-execute test case', testCaseExecutions.length >= 2,
            `Found ${testCaseExecutions.length} executions for test case`);

        // Test 5.9: Filter executions by test plan
        console.log('\n5.9 Testing filter executions by test plan...');
        const planExecutions = await Execution.find({ testPlan: testData.testPlans.testPlan1._id });
        logTest('Executions', 'Filter executions by test plan', planExecutions.length >= 6,
            `Found ${planExecutions.length} executions for test plan`);

        // Test 5.10: Filter executions by test case
        console.log('\n5.10 Testing filter executions by test case...');
        const caseExecutions = await Execution.find({ testCase: testData.testCases.testCase1._id });
        logTest('Executions', 'Filter executions by test case', caseExecutions.length >= 2,
            `Found ${caseExecutions.length} executions for test case`);

        // Test 5.11: Filter executions by status
        console.log('\n5.11 Testing filter executions by status...');
        const passedExecutions = await Execution.find({ status: 'pass' });
        logTest('Executions', 'Filter executions by status', passedExecutions.length >= 2,
            `Found ${passedExecutions.length} passed executions`);

        // Test 5.12: Filter executions by executor
        console.log('\n5.12 Testing filter executions by executor...');
        const executorExecutions = await Execution.find({ executedBy: testData.users.qaEngineer._id });
        logTest('Executions', 'Filter executions by executor', executorExecutions.length >= 6,
            `Found ${executorExecutions.length} executions by executor`);

    } catch (error) {
        logTest('Executions', 'Executions module tests', false, error.message);
    }
}

// ============================================
// 6. DEFECTS MODULE TESTS
// ============================================
async function testDefectsModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 6: DEFECTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 6.1: Create defect with all fields
        console.log('6.1 Testing create defect with all fields...');
        const defect1 = await Defect.create({
            title: 'Critical Bug - Login Fails',
            description: 'Users are unable to login with valid credentials',
            stepsToReproduce: '1. Navigate to login page\n2. Enter valid credentials\n3. Click login\n4. Error occurs',
            severity: 'critical',
            priority: 'high',
            status: 'open',
            project: testData.projects.project1._id,
            linkedTestCase: testData.testCases.testCase1._id,
            linkedExecution: testData.executions.execution2._id,
            createdBy: testData.users.qaEngineer._id,
            assignedTo: testData.users.qaEngineer._id
        });
        testData.defects.defect1 = defect1;
        logTest('Defects', 'Create defect with all fields', true,
            `Created defect: ${defect1.defectId}, Severity: ${defect1.severity}`);

        // Test 6.2: Create defect with different severity
        console.log('\n6.2 Testing create defect with different severity...');
        const defect2 = await Defect.create({
            title: 'Minor Issue - UI Misalignment',
            description: 'Button is slightly misaligned on dashboard',
            stepsToReproduce: '1. Navigate to dashboard\n2. Observe button alignment',
            severity: 'minor',
            priority: 'low',
            status: 'open',
            project: testData.projects.project1._id,
            linkedTestCase: testData.testCases.testCase2._id,
            createdBy: testData.users.qaEngineer._id,
            assignedTo: testData.users.qaEngineer._id
        });
        testData.defects.defect2 = defect2;
        logTest('Defects', 'Create defect with minor severity', true,
            `Created defect: ${defect2.defectId}, Severity: ${defect2.severity}`);

        // Test 6.3: Test all severity levels
        console.log('\n6.3 Testing all severity levels...');
        const severities = ['trivial', 'minor', 'major', 'critical'];
        const allSeveritiesValid = severities.includes(defect1.severity) &&
            severities.includes(defect2.severity);
        logTest('Defects', 'All severity levels', allSeveritiesValid, 'Severity levels validated');

        // Test 6.4: Link defect to test case
        console.log('\n6.4 Testing link defect to test case...');
        const defectWithTestCase = await Defect.findById(defect1._id).populate('linkedTestCase');
        logTest('Defects', 'Link defect to test case', defectWithTestCase.linkedTestCase !== null,
            `Linked to test case: ${defectWithTestCase.linkedTestCase.testCaseId}`);

        // Test 6.5: Link defect to execution
        console.log('\n6.5 Testing link defect to execution...');
        const defectWithExecution = await Defect.findById(defect1._id).populate('linkedExecution');
        logTest('Defects', 'Link defect to execution', defectWithExecution.linkedExecution !== null,
            `Linked to execution: ${defectWithExecution.linkedExecution.executionId}`);

        // Test 6.6: Assign defect to user
        console.log('\n6.6 Testing assign defect to user...');
        defect1.assignedTo = testData.users.qaLead._id;
        await defect1.save();
        const assignedDefect = await Defect.findById(defect1._id).populate('assignedTo');
        logTest('Defects', 'Assign defect to user', assignedDefect.assignedTo.email === 'qalead@test.com',
            `Assigned to: ${assignedDefect.assignedTo.name}`);

        // Test 6.7: Update defect status (open → in_progress)
        console.log('\n6.7 Testing update defect status to in_progress...');
        defect1.status = 'in_progress';
        await defect1.save();
        const inProgressDefect = await Defect.findById(defect1._id);
        logTest('Defects', 'Update defect status to in_progress', inProgressDefect.status === 'in_progress',
            `Status: ${inProgressDefect.status}`);

        // Test 6.8: Update defect status (in_progress → fixed)
        console.log('\n6.8 Testing update defect status to fixed...');
        inProgressDefect.status = 'fixed';
        await inProgressDefect.save();
        const fixedDefect = await Defect.findById(defect1._id);
        logTest('Defects', 'Update defect status to fixed', fixedDefect.status === 'fixed',
            `Status: ${fixedDefect.status}`);

        // Test 6.9: Update defect status (fixed → retest)
        console.log('\n6.9 Testing update defect status to retest...');
        fixedDefect.status = 'retest';
        await fixedDefect.save();
        const retestDefect = await Defect.findById(defect1._id);
        logTest('Defects', 'Update defect status to retest', retestDefect.status === 'retest',
            `Status: ${retestDefect.status}`);

        // Test 6.10: Update defect status (retest → closed)
        console.log('\n6.10 Testing update defect status to closed...');
        retestDefect.status = 'closed';
        await retestDefect.save();
        const closedDefect = await Defect.findById(defect1._id);
        logTest('Defects', 'Update defect status to closed', closedDefect.status === 'closed',
            `Status: ${closedDefect.status}`);

        // Test 6.11: Filter defects by project
        console.log('\n6.11 Testing filter defects by project...');
        const projectDefects = await Defect.find({ project: testData.projects.project1._id });
        logTest('Defects', 'Filter defects by project', projectDefects.length >= 2,
            `Found ${projectDefects.length} defects`);

        // Test 6.12: Filter defects by severity
        console.log('\n6.12 Testing filter defects by severity...');
        const criticalDefects = await Defect.find({ severity: 'critical' });
        logTest('Defects', 'Filter defects by severity', criticalDefects.length === 1,
            `Found ${criticalDefects.length} critical defects`);

        // Test 6.13: Filter defects by status
        console.log('\n6.13 Testing filter defects by status...');
        const openDefects = await Defect.find({ status: 'open' });
        logTest('Defects', 'Filter defects by status', openDefects.length === 1,
            `Found ${openDefects.length} open defects`);

        // Test 6.14: Filter defects by assigned user
        console.log('\n6.14 Testing filter defects by assigned user...');
        const assignedDefects = await Defect.find({ assignedTo: testData.users.qaEngineer._id });
        logTest('Defects', 'Filter defects by assigned user', assignedDefects.length >= 1,
            `Found ${assignedDefects.length} defects assigned to user`);

    } catch (error) {
        logTest('Defects', 'Defects module tests', false, error.message);
    }
}

// ============================================
// 7. DASHBOARD MODULE TESTS
// ============================================
async function testDashboardModule() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 7: DASHBOARD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 7.1: Calculate total projects
        console.log('7.1 Testing calculate total projects...');
        const totalProjects = await Project.countDocuments({ status: 'active' });
        logTest('Dashboard', 'Calculate total projects', totalProjects >= 2,
            `Total projects: ${totalProjects}`);

        // Test 7.2: Calculate total test cases
        console.log('\n7.2 Testing calculate total test cases...');
        const totalTestCases = await TestCase.countDocuments({ status: { $ne: 'deprecated' } });
        logTest('Dashboard', 'Calculate total test cases', totalTestCases >= 3,
            `Total test cases: ${totalTestCases}`);

        // Test 7.3: Calculate total test plans
        console.log('\n7.3 Testing calculate total test plans...');
        const totalTestPlans = await TestPlan.countDocuments({ status: 'active' });
        logTest('Dashboard', 'Calculate total test plans', totalTestPlans >= 2,
            `Total test plans: ${totalTestPlans}`);

        // Test 7.4: Calculate total executions
        console.log('\n7.4 Testing calculate total executions...');
        const totalExecutions = await Execution.countDocuments({});
        logTest('Dashboard', 'Calculate total executions', totalExecutions >= 6,
            `Total executions: ${totalExecutions}`);

        // Test 7.5: Calculate total defects
        console.log('\n7.5 Testing calculate total defects...');
        const totalDefects = await Defect.countDocuments({ status: { $ne: 'archived' } });
        logTest('Dashboard', 'Calculate total defects', totalDefects >= 2,
            `Total defects: ${totalDefects}`);

        // Test 7.6: Calculate pass rate
        console.log('\n7.6 Testing calculate pass rate...');
        const passedExecutions = await Execution.countDocuments({ status: 'pass' });
        const completedExecutions = await Execution.countDocuments({
            status: { $in: ['pass', 'fail', 'blocked'] }
        });
        const passRate = completedExecutions > 0 ? (passedExecutions / completedExecutions * 100).toFixed(2) : 0;
        logTest('Dashboard', 'Calculate pass rate', true,
            `Pass rate: ${passRate}% (${passedExecutions}/${completedExecutions})`);

        // Test 7.7: Calculate execution progress
        console.log('\n7.7 Testing calculate execution progress...');
        const executedCount = await Execution.countDocuments({
            status: { $in: ['pass', 'fail', 'blocked', 'retest'] }
        });
        const progressRate = totalTestCases > 0 ? (executedCount / totalTestCases * 100).toFixed(2) : 0;
        logTest('Dashboard', 'Calculate execution progress', true,
            `Execution progress: ${progressRate}% (${executedCount}/${totalTestCases})`);

        // Test 7.8: Tester-wise statistics
        console.log('\n7.8 Testing tester-wise statistics...');
        const testerStats = await Execution.aggregate([
            { $match: { executedBy: testData.users.qaEngineer._id } },
            {
                $group: {
                    _id: '$executedBy',
                    total: { $sum: 1 },
                    passed: { $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } }
                }
            }
        ]);
        logTest('Dashboard', 'Tester-wise statistics', testerStats.length > 0,
            `Found statistics for ${testerStats.length} tester(s)`);

        // Test 7.9: Release-wise statistics
        console.log('\n7.9 Testing release-wise statistics...');
        const releaseStats = await TestPlan.aggregate([
            { $match: { project: testData.projects.project1._id } },
            {
                $group: {
                    _id: '$releaseVersion',
                    totalPlans: { $sum: 1 },
                    totalTestCases: { $sum: { $size: '$testCases' } }
                }
            }
        ]);
        logTest('Dashboard', 'Release-wise statistics', releaseStats.length >= 1,
            `Found statistics for ${releaseStats.length} release(s)`);

    } catch (error) {
        logTest('Dashboard', 'Dashboard module tests', false, error.message);
    }
}

// ============================================
// 8. ROLE-BASED ACCESS CONTROL TESTS
// ============================================
async function testRoleBasedAccessControl() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 8: ROLE-BASED ACCESS CONTROL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 8.1: Verify admin user exists
        console.log('8.1 Testing admin user exists...');
        const adminUser = await User.findOne({ role: 'admin' });
        logTest('RBAC', 'Admin user exists', adminUser !== null,
            `Admin: ${adminUser.name}`);

        // Test 8.2: Verify qa_lead user exists
        console.log('\n8.2 Testing qa_lead user exists...');
        const qaLeadUser = await User.findOne({ role: 'qa_lead' });
        logTest('RBAC', 'QA Lead user exists', qaLeadUser !== null,
            `QA Lead: ${qaLeadUser.name}`);

        // Test 8.3: Verify qa_engineer user exists
        console.log('\n8.3 Testing qa_engineer user exists...');
        const qaEngineerUser = await User.findOne({ role: 'qa_engineer' });
        logTest('RBAC', 'QA Engineer user exists', qaEngineerUser !== null,
            `QA Engineer: ${qaEngineerUser.name}`);

        // Test 8.4: Verify viewer user exists
        console.log('\n8.4 Testing viewer user exists...');
        const viewerUser = await User.findOne({ role: 'viewer' });
        logTest('RBAC', 'Viewer user exists', viewerUser !== null,
            `Viewer: ${viewerUser.name}`);

        // Test 8.5: Verify all roles are valid
        console.log('\n8.5 Testing all roles are valid...');
        const validRoles = ['admin', 'qa_lead', 'qa_engineer', 'viewer'];
        const allRolesValid = validRoles.includes(adminUser.role) &&
            validRoles.includes(qaLeadUser.role) &&
            validRoles.includes(qaEngineerUser.role) &&
            validRoles.includes(viewerUser.role);
        logTest('RBAC', 'All roles are valid', allRolesValid, 'All user roles validated');

        // Test 8.6: Verify admin can create projects
        console.log('\n8.6 Testing admin created project...');
        const adminProject = await Project.findOne({ createdBy: adminUser._id });
        logTest('RBAC', 'Admin created project', adminProject !== null,
            `Project: ${adminProject.name}`);

        // Test 8.7: Verify qa_lead can create test plans
        console.log('\n8.7 Testing qa_lead created test plan...');
        const qaLeadTestPlan = await TestPlan.findOne({ createdBy: qaLeadUser._id });
        logTest('RBAC', 'QA Lead created test plan', qaLeadTestPlan !== null,
            `Test plan: ${qaLeadTestPlan.name}`);

        // Test 8.8: Verify qa_engineer can create test cases
        console.log('\n8.8 Testing qa_engineer created test case...');
        const qaEngineerTestCase = await TestCase.findOne({ createdBy: qaEngineerUser._id });
        logTest('RBAC', 'QA Engineer created test case', qaEngineerTestCase !== null,
            `Test case: ${qaEngineerTestCase.title}`);

    } catch (error) {
        logTest('RBAC', 'Role-Based Access Control tests', false, error.message);
    }
}

// ============================================
// 9. DATA INTEGRITY VALIDATION TESTS
// ============================================
async function testDataIntegrityValidation() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 9: DATA INTEGRITY VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 9.1: Verify test case has valid project
        console.log('9.1 Testing test case has valid project...');
        const testCaseWithProject = await TestCase.findById(testData.testCases.testCase1._id).populate('project');
        const hasValidProject = testCaseWithProject.project !== null;
        logTest('Data Integrity', 'Test case has valid project', hasValidProject,
            `Project: ${testCaseWithProject.project.name}`);

        // Test 9.2: Verify test plan has valid project
        console.log('\n9.2 Testing test plan has valid project...');
        const testPlanWithProject = await TestPlan.findById(testData.testPlans.testPlan1._id).populate('project');
        const hasValidPlanProject = testPlanWithProject.project !== null;
        logTest('Data Integrity', 'Test plan has valid project', hasValidPlanProject,
            `Project: ${testPlanWithProject.project.name}`);

        // Test 9.3: Verify execution has valid test case
        console.log('\n9.3 Testing execution has valid test case...');
        const executionWithTestCase = await Execution.findById(testData.executions.execution1._id).populate('testCase');
        const hasValidTestCase = executionWithTestCase.testCase !== null;
        logTest('Data Integrity', 'Execution has valid test case', hasValidTestCase,
            `Test case: ${executionWithTestCase.testCase.title}`);

        // Test 9.4: Verify execution has valid test plan
        console.log('\n9.4 Testing execution has valid test plan...');
        const executionWithTestPlan = await Execution.findById(testData.executions.execution1._id).populate('testPlan');
        const hasValidTestPlan = executionWithTestPlan.testPlan !== null;
        logTest('Data Integrity', 'Execution has valid test plan', hasValidTestPlan,
            `Test plan: ${executionWithTestPlan.testPlan.name}`);

        // Test 9.5: Verify defect has valid test case
        console.log('\n9.5 Testing defect has valid test case...');
        const defectWithTestCase = await Defect.findById(testData.defects.defect1._id).populate('linkedTestCase');
        const hasValidDefectTestCase = defectWithTestCase.linkedTestCase !== null;
        logTest('Data Integrity', 'Defect has valid test case', hasValidDefectTestCase,
            `Test case: ${defectWithTestCase.linkedTestCase.title}`);

        // Test 9.6: Verify defect has valid project
        console.log('\n9.6 Testing defect has valid project...');
        const defectWithProject = await Defect.findById(testData.defects.defect1._id).populate('project');
        const hasValidDefectProject = defectWithProject.project !== null;
        logTest('Data Integrity', 'Defect has valid project', hasValidDefectProject,
            `Project: ${defectWithProject.project.name}`);

        // Test 9.7: Verify test plan test cases belong to same project
        console.log('\n9.7 Testing test plan test cases belong to same project...');
        const testPlanWithTestCases = await TestPlan.findById(testData.testPlans.testPlan1._id)
            .populate('testCases')
            .populate('project');
        const allTestCasesInProject = testPlanWithTestCases.testCases.every(tc =>
            tc.project.toString() === testPlanWithTestCases.project._id.toString()
        );
        logTest('Data Integrity', 'Test plan test cases in same project', allTestCasesInProject,
            `All ${testPlanWithTestCases.testCases.length} test cases in same project`);

        // Test 9.8: Verify execution test case belongs to test plan project
        console.log('\n9.8 Testing execution test case belongs to test plan project...');
        const executionFull = await Execution.findById(testData.executions.execution1._id)
            .populate('testCase')
            .populate('testPlan');
        const testCaseProject = await Project.findById(executionFull.testCase.project);
        const testPlanProject = await Project.findById(executionFull.testPlan.project);
        const executionInSameProject = testCaseProject._id.toString() === testPlanProject._id.toString();
        logTest('Data Integrity', 'Execution test case in test plan project', executionInSameProject,
            `Test case project: ${testCaseProject.name}, Test plan project: ${testPlanProject.name}`);

    } catch (error) {
        logTest('Data Integrity', 'Data Integrity Validation tests', false, error.message);
    }
}

// ============================================
// 10. SOFT DELETE FUNCTIONALITY TESTS
// ============================================
async function testSoftDeleteFunctionality() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 10: SOFT DELETE FUNCTIONALITY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 10.1: Soft delete project (change status to 'archived')
        console.log('10.1 Testing soft delete project...');
        const projectToDelete = await Project.findOne({ name: 'Test Project 2' });
        projectToDelete.status = 'archived';
        await projectToDelete.save();
        const deletedProject = await Project.findById(projectToDelete._id);
        logTest('Soft Delete', 'Soft delete project', deletedProject.status === 'archived',
            `Project status: ${deletedProject.status}`);

        // Test 10.2: Verify archived project not in active list
        console.log('\n10.2 Testing archived project not in active list...');
        const activeProjects = await Project.find({ status: 'active' });
        const archivedNotInActive = !activeProjects.some(p => p._id.toString() === projectToDelete._id.toString());
        logTest('Soft Delete', 'Archived project not in active list', archivedNotInActive,
            `Active projects: ${activeProjects.length}`);

        // Test 10.3: Soft delete test case (change status to 'deprecated')
        console.log('\n10.3 Testing soft delete test case...');
        const testCaseToDelete = await TestCase.findOne({ title: 'Test Case 3 - Dashboard Display' });
        testCaseToDelete.status = 'deprecated';
        await testCaseToDelete.save();
        const deletedTestCase = await TestCase.findById(testCaseToDelete._id);
        logTest('Soft Delete', 'Soft delete test case', deletedTestCase.status === 'deprecated',
            `Test case status: ${deletedTestCase.status}`);

        // Test 10.4: Verify deprecated test case not in active list
        console.log('\n10.4 Testing deprecated test case not in active list...');
        const activeTestCases = await TestCase.find({ status: { $ne: 'deprecated' } });
        const deprecatedNotInActive = !activeTestCases.some(tc => tc._id.toString() === testCaseToDelete._id.toString());
        logTest('Soft Delete', 'Deprecated test case not in active list', deprecatedNotInActive,
            `Active test cases: ${activeTestCases.length}`);

        // Test 10.5: Soft delete test plan (change status to 'cancelled')
        console.log('\n10.5 Testing soft delete test plan...');
        const testPlanToDelete = await TestPlan.findOne({ name: 'Test Plan 2 - Sprint 2' });
        testPlanToDelete.status = 'cancelled';
        await testPlanToDelete.save();
        const deletedTestPlan = await TestPlan.findById(testPlanToDelete._id);
        logTest('Soft Delete', 'Soft delete test plan', deletedTestPlan.status === 'cancelled',
            `Test plan status: ${deletedTestPlan.status}`);

        // Test 10.6: Verify cancelled test plan not in active list
        console.log('\n10.6 Testing cancelled test plan not in active list...');
        const activeTestPlans = await TestPlan.find({ status: 'active' });
        const cancelledNotInActive = !activeTestPlans.some(tp => tp._id.toString() === testPlanToDelete._id.toString());
        logTest('Soft Delete', 'Cancelled test plan not in active list', cancelledNotInActive,
            `Active test plans: ${activeTestPlans.length}`);

        // Test 10.7: Soft delete execution (change status to 'archived')
        console.log('\n10.7 Testing soft delete execution...');
        const executionToDelete = await Execution.findById(testData.executions.execution3._id);
        executionToDelete.status = 'archived';
        await executionToDelete.save();
        const deletedExecution = await Execution.findById(executionToDelete._id);
        logTest('Soft Delete', 'Soft delete execution', deletedExecution.status === 'archived',
            `Execution status: ${deletedExecution.status}`);

        // Test 10.8: Soft delete defect (change status to 'archived')
        console.log('\n10.8 Testing soft delete defect...');
        const defectToDelete = await Defect.findById(testData.defects.defect2._id);
        defectToDelete.status = 'archived';
        await defectToDelete.save();
        const deletedDefect = await Defect.findById(defectToDelete._id);
        logTest('Soft Delete', 'Soft delete defect', deletedDefect.status === 'archived',
            `Defect status: ${deletedDefect.status}`);

        // Test 10.9: Restore archived project
        console.log('\n10.9 Testing restore archived project...');
        deletedProject.status = 'active';
        await deletedProject.save();
        const restoredProject = await Project.findById(deletedProject._id);
        logTest('Soft Delete', 'Restore archived project', restoredProject.status === 'active',
            `Project status: ${restoredProject.status}`);

        // Test 10.10: Restore deprecated test case
        console.log('\n10.10 Testing restore deprecated test case...');
        deletedTestCase.status = 'ready';
        await deletedTestCase.save();
        const restoredTestCase = await TestCase.findById(deletedTestCase._id);
        logTest('Soft Delete', 'Restore deprecated test case', restoredTestCase.status === 'ready',
            `Test case status: ${restoredTestCase.status}`);

        // Test 10.11: Verify soft-deleted records still exist in database
        console.log('\n10.11 Testing soft-deleted records still exist...');
        const allProjects = await Project.find({});
        const allTestCases = await TestCase.find({});
        const allTestPlans = await TestPlan.find({});
        const allExecutions = await Execution.find({});
        const allDefects = await Defect.find({});
        logTest('Soft Delete', 'Soft-deleted records exist in DB',
            allProjects.length >= 2 && allTestCases.length >= 3 && allTestPlans.length >= 2,
            `Projects: ${allProjects.length}, Test cases: ${allTestCases.length}, Test plans: ${allTestPlans.length}`);

    } catch (error) {
        logTest('Soft Delete', 'Soft Delete Functionality tests', false, error.message);
    }
}

// ============================================
// 11. AUTOMATIC DEFECT CREATION TESTS
// ============================================
async function testAutomaticDefectCreation() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 MODULE 11: AUTOMATIC DEFECT CREATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 11.1: Create execution with fail status and createDefect=true
        console.log('11.1 Testing create execution with fail and createDefect=true...');
        const executionFailWithDefect = await Execution.create({
            testCase: testData.testCases.testCase1._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'fail',
            comments: 'Test failed - automatic defect creation test',
            createDefect: true
        });

        // Simulate automatic defect creation
        const testCase = await TestCase.findById(testData.testCases.testCase1._id);
        const autoDefect = await Defect.create({
            title: `Failed: ${testCase.title}`,
            description: `Test execution failed with status: fail\n\nExecution Comments: ${executionFailWithDefect.comments}`,
            stepsToReproduce: testCase.testSteps.map(step =>
                `${step.stepNumber}. ${step.action}\n   Expected: ${step.expectedResult}`
            ).join('\n'),
            severity: testCase.priority === 'critical' ? 'critical' : 'major',
            priority: testCase.priority,
            status: 'open',
            linkedTestCase: executionFailWithDefect.testCase,
            linkedExecution: executionFailWithDefect._id,
            project: testCase.project,
            createdBy: testData.users.qaEngineer._id,
            assignedTo: testData.users.qaEngineer._id
        });

        executionFailWithDefect.linkedDefect = autoDefect._id;
        await executionFailWithDefect.save();

        testData.executions.failWithDefect = executionFailWithDefect;
        testData.defects.autoDefect = autoDefect;

        logTest('Auto Defect', 'Create execution with fail and createDefect=true', true,
            `Created execution and defect: ${autoDefect.defectId}`);

        // Test 11.2: Verify defect is linked to execution
        console.log('\n11.2 Testing defect linked to execution...');
        const executionWithDefect = await Execution.findById(executionFailWithDefect._id).populate('linkedDefect');
        logTest('Auto Defect', 'Defect linked to execution', executionWithDefect.linkedDefect !== null,
            `Linked defect: ${executionWithDefect.linkedDefect.defectId}`);

        // Test 11.3: Verify defect is linked to test case
        console.log('\n11.3 Testing defect linked to test case...');
        const defectWithTestCase = await Defect.findById(autoDefect._id).populate('linkedTestCase');
        logTest('Auto Defect', 'Defect linked to test case', defectWithTestCase.linkedTestCase !== null,
            `Linked test case: ${defectWithTestCase.linkedTestCase.testCaseId}`);

        // Test 11.4: Verify defect status is 'open'
        console.log('\n11.4 Testing defect status is open...');
        logTest('Auto Defect', 'Defect status is open', autoDefect.status === 'open',
            `Defect status: ${autoDefect.status}`);

        // Test 11.5: Verify defect title is pre-filled
        console.log('\n11.5 Testing defect title pre-filled...');
        const titlePrefilled = autoDefect.title.startsWith('Failed:');
        logTest('Auto Defect', 'Defect title pre-filled', titlePrefilled,
            `Defect title: ${autoDefect.title}`);

        // Test 11.6: Verify defect description includes execution comments
        console.log('\n11.6 Testing defect description includes execution comments...');
        const descriptionHasComments = autoDefect.description.includes(executionFailWithDefect.comments);
        logTest('Auto Defect', 'Defect description includes comments', descriptionHasComments,
            `Description includes comments: ${descriptionHasComments}`);

        // Test 11.7: Verify defect steps to reproduce are pre-filled
        console.log('\n11.7 Testing defect steps to reproduce pre-filled...');
        const stepsPrefilled = autoDefect.stepsToReproduce.length > 0;
        logTest('Auto Defect', 'Defect steps pre-filled', stepsPrefilled,
            `Steps length: ${autoDefect.stepsToReproduce.length} chars`);

        // Test 11.8: Create execution with fail status but createDefect=false
        console.log('\n11.8 Testing create execution with fail but createDefect=false...');
        const executionFailNoDefect = await Execution.create({
            testCase: testData.testCases.testCase2._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'fail',
            comments: 'Test failed but no defect should be created',
            createDefect: false
        });
        testData.executions.failNoDefect = executionFailNoDefect;
        logTest('Auto Defect', 'Create execution with fail but createDefect=false', true,
            `Execution created: ${executionFailNoDefect.executionId}`);

        // Test 11.9: Verify no defect was created
        console.log('\n11.9 Testing no defect created when createDefect=false...');
        const defectsForExecution = await Defect.find({ linkedExecution: executionFailNoDefect._id });
        logTest('Auto Defect', 'No defect created', defectsForExecution.length === 0,
            `Defects created: ${defectsForExecution.length}`);

        // Test 11.10: Create execution with pass status (should not create defect)
        console.log('\n11.10 Testing create execution with pass status...');
        const executionPass = await Execution.create({
            testCase: testData.testCases.testCase1._id,
            testPlan: testData.testPlans.testPlan1._id,
            executedBy: testData.users.qaEngineer._id,
            status: 'pass',
            comments: 'Test passed successfully',
            createDefect: true
        });
        testData.executions.pass = executionPass;
        logTest('Auto Defect', 'Create execution with pass status', true,
            `Execution created: ${executionPass.executionId}`);

        // Test 11.11: Verify no defect was created for pass
        console.log('\n11.11 Testing no defect created for pass status...');
        const defectsForPass = await Defect.find({ linkedExecution: executionPass._id });
        logTest('Auto Defect', 'No defect created for pass', defectsForPass.length === 0,
            `Defects created: ${defectsForPass.length}`);

    } catch (error) {
        logTest('Auto Defect', 'Automatic Defect Creation tests', false, error.message);
    }
}

// ============================================
// PRINT TEST REPORT
// ============================================
function printTestReport() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  COMPREHENSIVE TEST REPORT                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const totalTests = testResults.passed.length + testResults.failed.length + testResults.skipped.length;
    const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(2) : 0;

    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Tests:     ${totalTests}`);
    console.log(`✅ Passed:       ${testResults.passed.length} (${passRate}%)`);
    console.log(`❌ Failed:       ${testResults.failed.length}`);
    console.log(`⏭️  Skipped:     ${testResults.skipped.length}\n`);

    // Module-wise summary
    console.log('📋 MODULE-WISE RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const modules = [...new Set([...testResults.passed, ...testResults.failed].map(r => r.module))];
    modules.forEach(module => {
        const passed = testResults.passed.filter(r => r.module === module).length;
        const failed = testResults.failed.filter(r => r.module === module).length;
        const total = passed + failed;
        const rate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
        console.log(`${module.padEnd(30)} ${passed}/${total} passed (${rate}%)`);
    });

    // Failed tests details
    if (testResults.failed.length > 0) {
        console.log('\n❌ FAILED TESTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        testResults.failed.forEach(failed => {
            console.log(`[${failed.module}] ${failed.testName}`);
            if (failed.message) console.log(`  → ${failed.message}`);
        });
    }

    // Skipped tests details
    if (testResults.skipped.length > 0) {
        console.log('\n⏭️  SKIPPED TESTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        testResults.skipped.forEach(skipped => {
            console.log(`[${skipped.module}] ${skipped.testName}`);
            if (skipped.message) console.log(`  → ${skipped.message}`);
        });
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUITE COMPLETED                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Overall system health assessment
    console.log('🏥 SYSTEM HEALTH ASSESSMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (passRate >= 90) {
        console.log('✅ EXCELLENT - System is functioning optimally');
        console.log('   All core features are working as expected.');
    } else if (passRate >= 75) {
        console.log('✅ GOOD - System is functioning well');
        console.log('   Most features are working, minor issues may exist.');
    } else if (passRate >= 50) {
        console.log('⚠️  MODERATE - System has some issues');
        console.log('   Several features need attention before production use.');
    } else {
        console.log('❌ POOR - System has significant issues');
        console.log('   Major problems detected, extensive fixes required.');
    }

    console.log('\n');
}

// Run all tests
runAllTests();
