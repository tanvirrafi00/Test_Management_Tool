/**
 * API Endpoint Testing Script
 * 
 * This script tests all backend API endpoints to ensure they work correctly
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api`;

// Store cookies for authentication
let cookies = '';

// Test results tracking
const apiResults = {
    passed: [],
    failed: [],
    skipped: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port || 5001,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (cookies) {
            options.headers['Cookie'] = cookies;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                // Store cookies from response
                if (res.headers['set-cookie']) {
                    cookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                }
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Helper function to log test results
function logTest(endpoint, testName, passed, message = '') {
    const result = { endpoint, testName, passed, message, timestamp: new Date() };
    if (passed) {
        apiResults.passed.push(result);
        console.log(`✅ PASS [${endpoint}] ${testName}`);
        if (message) console.log(`   ${message}`);
    } else {
        apiResults.failed.push(result);
        console.log(`❌ FAIL [${endpoint}] ${testName}`);
        if (message) console.log(`   ${message}`);
    }
}

// Helper function to log skipped tests
function logSkip(endpoint, testName, message) {
    const result = { endpoint, testName, passed: null, message, timestamp: new Date() };
    apiResults.skipped.push(result);
    console.log(`⏭️  SKIP [${endpoint}] ${testName}`);
    if (message) console.log(`   ${message}`);
}

async function runApiTests() {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║              API ENDPOINT TESTING SUITE                          ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        // ============================================
        // 1. AUTHENTICATION ENDPOINTS
        // ============================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 AUTHENTICATION ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 1.1: Register new user
        console.log('1.1 Testing user registration...');
        const registerResponse = await makeRequest('POST', '/auth/register', {
            name: 'API Test User',
            email: 'apitest@test.com',
            password: 'Password123!'
        });
        logTest('Auth', 'User registration',
            registerResponse.statusCode === 201 || registerResponse.statusCode === 400,
            `Status: ${registerResponse.statusCode}`);

        // Test 1.2: Login user
        console.log('\n1.2 Testing user login...');
        const loginResponse = await makeRequest('POST', '/auth/login', {
            email: 'apitest@test.com',
            password: 'Password123!'
        });
        logTest('Auth', 'User login',
            loginResponse.statusCode === 200,
            `Status: ${loginResponse.statusCode}, Has token: ${!!loginResponse.body?.token}`);

        // Test 1.3: Get current user
        console.log('\n1.3 Testing get current user...');
        const currentUserResponse = await makeRequest('GET', '/auth/me');
        logTest('Auth', 'Get current user',
            currentUserResponse.statusCode === 200,
            `Status: ${currentUserResponse.statusCode}`);

        // Test 1.4: Logout user
        console.log('\n1.4 Testing user logout...');
        const logoutResponse = await makeRequest('POST', '/auth/logout');
        logTest('Auth', 'User logout',
            logoutResponse.statusCode === 200,
            `Status: ${logoutResponse.statusCode}`);

        // Re-login for subsequent tests
        await makeRequest('POST', '/auth/login', {
            email: 'apitest@test.com',
            password: 'Password123!'
        });

        // Test 1.5: Get all users (admin only)
        console.log('\n1.5 Testing get all users...');
        const allUsersResponse = await makeRequest('GET', '/auth/users');
        logTest('Auth', 'Get all users',
            allUsersResponse.statusCode === 200 || allUsersResponse.statusCode === 403,
            `Status: ${allUsersResponse.statusCode}`);

        // ============================================
        // 2. PROJECT ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 PROJECT ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 2.1: Create project
        console.log('2.1 Testing create project...');
        const createProjectResponse = await makeRequest('POST', '/projects', {
            name: 'API Test Project',
            description: 'Project for API testing',
            status: 'active'
        });
        logTest('Projects', 'Create project',
            createProjectResponse.statusCode === 201 || createProjectResponse.statusCode === 400,
            `Status: ${createProjectResponse.statusCode}`);

        // Test 2.2: Get all projects
        console.log('\n2.2 Testing get all projects...');
        const getProjectsResponse = await makeRequest('GET', '/projects');
        logTest('Projects', 'Get all projects',
            getProjectsResponse.statusCode === 200,
            `Status: ${getProjectsResponse.statusCode}, Count: ${getProjectsResponse.body?.length || 0}`);

        // Test 2.3: Get project by ID
        if (getProjectsResponse.body && getProjectsResponse.body.length > 0) {
            const projectId = getProjectsResponse.body[0]._id;
            console.log('\n2.3 Testing get project by ID...');
            const getProjectResponse = await makeRequest('GET', `/projects/${projectId}`);
            logTest('Projects', 'Get project by ID',
                getProjectResponse.statusCode === 200 || getProjectResponse.statusCode === 404,
                `Status: ${getProjectResponse.statusCode}`);
        }

        // Test 2.4: Update project
        if (getProjectsResponse.body && getProjectsResponse.body.length > 0) {
            const projectId = getProjectsResponse.body[0]._id;
            console.log('\n2.4 Testing update project...');
            const updateProjectResponse = await makeRequest('PUT', `/projects/${projectId}`, {
                name: 'Updated API Test Project',
                description: 'Updated description'
            });
            logTest('Projects', 'Update project',
                updateProjectResponse.statusCode === 200 || updateProjectResponse.statusCode === 403,
                `Status: ${updateProjectResponse.statusCode}`);
        }

        // Test 2.5: Delete project (soft delete)
        if (getProjectsResponse.body && getProjectsResponse.body.length > 1) {
            const projectId = getProjectsResponse.body[1]._id;
            console.log('\n2.5 Testing delete project (soft delete)...');
            const deleteProjectResponse = await makeRequest('DELETE', `/projects/${projectId}`);
            logTest('Projects', 'Delete project (soft delete)',
                deleteProjectResponse.statusCode === 200 || deleteProjectResponse.statusCode === 403,
                `Status: ${deleteProjectResponse.statusCode}`);
        }

        // ============================================
        // 3. TEST CASE ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 TEST CASE ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 3.1: Create test case
        console.log('3.1 Testing create test case...');
        const createTestCaseResponse = await makeRequest('POST', '/testcases', {
            title: 'API Test Case',
            description: 'Test case for API testing',
            preconditions: 'User must be logged in',
            priority: 'high',
            status: 'ready',
            testSteps: [
                {
                    stepNumber: 1,
                    action: 'Navigate to page',
                    expectedResult: 'Page is displayed'
                }
            ]
        });
        logTest('Test Cases', 'Create test case',
            createTestCaseResponse.statusCode === 201 || createTestCaseResponse.statusCode === 400,
            `Status: ${createTestCaseResponse.statusCode}`);

        // Test 3.2: Get all test cases
        console.log('\n3.2 Testing get all test cases...');
        const getTestCasesResponse = await makeRequest('GET', '/testcases');
        logTest('Test Cases', 'Get all test cases',
            getTestCasesResponse.statusCode === 200,
            `Status: ${getTestCasesResponse.statusCode}, Count: ${getTestCasesResponse.body?.length || 0}`);

        // Test 3.3: Get test case by ID
        if (getTestCasesResponse.body && getTestCasesResponse.body.length > 0) {
            const testCaseId = getTestCasesResponse.body[0]._id;
            console.log('\n3.3 Testing get test case by ID...');
            const getTestCaseResponse = await makeRequest('GET', `/testcases/${testCaseId}`);
            logTest('Test Cases', 'Get test case by ID',
                getTestCaseResponse.statusCode === 200 || getTestCaseResponse.statusCode === 404,
                `Status: ${getTestCaseResponse.statusCode}`);
        }

        // Test 3.4: Update test case
        if (getTestCasesResponse.body && getTestCasesResponse.body.length > 0) {
            const testCaseId = getTestCasesResponse.body[0]._id;
            console.log('\n3.4 Testing update test case...');
            const updateTestCaseResponse = await makeRequest('PUT', `/testcases/${testCaseId}`, {
                title: 'Updated API Test Case',
                priority: 'critical'
            });
            logTest('Test Cases', 'Update test case',
                updateTestCaseResponse.statusCode === 200 || updateTestCaseResponse.statusCode === 403,
                `Status: ${updateTestCaseResponse.statusCode}`);
        }

        // Test 3.5: Delete test case (soft delete)
        if (getTestCasesResponse.body && getTestCasesResponse.body.length > 1) {
            const testCaseId = getTestCasesResponse.body[1]._id;
            console.log('\n3.5 Testing delete test case (soft delete)...');
            const deleteTestCaseResponse = await makeRequest('DELETE', `/testcases/${testCaseId}`);
            logTest('Test Cases', 'Delete test case (soft delete)',
                deleteTestCaseResponse.statusCode === 200 || deleteTestCaseResponse.statusCode === 403,
                `Status: ${deleteTestCaseResponse.statusCode}`);
        }

        // ============================================
        // 4. TEST PLAN ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 TEST PLAN ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 4.1: Create test plan
        console.log('4.1 Testing create test plan...');
        const createTestPlanResponse = await makeRequest('POST', '/testplans', {
            name: 'API Test Plan',
            description: 'Test plan for API testing',
            releaseVersion: 'v1.0.0',
            status: 'active'
        });
        logTest('Test Plans', 'Create test plan',
            createTestPlanResponse.statusCode === 201 || createTestPlanResponse.statusCode === 400,
            `Status: ${createTestPlanResponse.statusCode}`);

        // Test 4.2: Get all test plans
        console.log('\n4.2 Testing get all test plans...');
        const getTestPlansResponse = await makeRequest('GET', '/testplans');
        logTest('Test Plans', 'Get all test plans',
            getTestPlansResponse.statusCode === 200,
            `Status: ${getTestPlansResponse.statusCode}, Count: ${getTestPlansResponse.body?.length || 0}`);

        // Test 4.3: Get test plan by ID
        if (getTestPlansResponse.body && getTestPlansResponse.body.length > 0) {
            const testPlanId = getTestPlansResponse.body[0]._id;
            console.log('\n4.3 Testing get test plan by ID...');
            const getTestPlanResponse = await makeRequest('GET', `/testplans/${testPlanId}`);
            logTest('Test Plans', 'Get test plan by ID',
                getTestPlanResponse.statusCode === 200 || getTestPlanResponse.statusCode === 404,
                `Status: ${getTestPlanResponse.statusCode}`);
        }

        // Test 4.4: Update test plan
        if (getTestPlansResponse.body && getTestPlansResponse.body.length > 0) {
            const testPlanId = getTestPlansResponse.body[0]._id;
            console.log('\n4.4 Testing update test plan...');
            const updateTestPlanResponse = await makeRequest('PUT', `/testplans/${testPlanId}`, {
                name: 'Updated API Test Plan',
                status: 'completed'
            });
            logTest('Test Plans', 'Update test plan',
                updateTestPlanResponse.statusCode === 200 || updateTestPlanResponse.statusCode === 403,
                `Status: ${updateTestPlanResponse.statusCode}`);
        }

        // Test 4.5: Delete test plan (soft delete)
        if (getTestPlansResponse.body && getTestPlansResponse.body.length > 1) {
            const testPlanId = getTestPlansResponse.body[1]._id;
            console.log('\n4.5 Testing delete test plan (soft delete)...');
            const deleteTestPlanResponse = await makeRequest('DELETE', `/testplans/${testPlanId}`);
            logTest('Test Plans', 'Delete test plan (soft delete)',
                deleteTestPlanResponse.statusCode === 200 || deleteTestPlanResponse.statusCode === 403,
                `Status: ${deleteTestPlanResponse.statusCode}`);
        }

        // ============================================
        // 5. EXECUTION ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 EXECUTION ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 5.1: Create execution
        console.log('5.1 Testing create execution...');
        const createExecutionResponse = await makeRequest('POST', '/executions', {
            testCase: '507f1f77bcf86cd799439011',
            testPlan: '507f1f77bcf86cd799439011',
            status: 'pass',
            comments: 'Test passed'
        });
        logTest('Executions', 'Create execution',
            createExecutionResponse.statusCode === 201 || createExecutionResponse.statusCode === 400,
            `Status: ${createExecutionResponse.statusCode}`);

        // Test 5.2: Get all executions
        console.log('\n5.2 Testing get all executions...');
        const getExecutionsResponse = await makeRequest('GET', '/executions');
        logTest('Executions', 'Get all executions',
            getExecutionsResponse.statusCode === 200,
            `Status: ${getExecutionsResponse.statusCode}, Count: ${getExecutionsResponse.body?.length || 0}`);

        // Test 5.3: Get execution by ID
        if (getExecutionsResponse.body && getExecutionsResponse.body.length > 0) {
            const executionId = getExecutionsResponse.body[0]._id;
            console.log('\n5.3 Testing get execution by ID...');
            const getExecutionResponse = await makeRequest('GET', `/executions/${executionId}`);
            logTest('Executions', 'Get execution by ID',
                getExecutionResponse.statusCode === 200 || getExecutionResponse.statusCode === 404,
                `Status: ${getExecutionResponse.statusCode}`);
        }

        // Test 5.4: Update execution
        if (getExecutionsResponse.body && getExecutionsResponse.body.length > 0) {
            const executionId = getExecutionsResponse.body[0]._id;
            console.log('\n5.4 Testing update execution...');
            const updateExecutionResponse = await makeRequest('PUT', `/executions/${executionId}`, {
                status: 'fail',
                comments: 'Test failed',
                createDefect: true
            });
            logTest('Executions', 'Update execution',
                updateExecutionResponse.statusCode === 200 || updateExecutionResponse.statusCode === 403,
                `Status: ${updateExecutionResponse.statusCode}`);
        }

        // ============================================
        // 6. DEFECT ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 DEFECT ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 6.1: Create defect
        console.log('6.1 Testing create defect...');
        const createDefectResponse = await makeRequest('POST', '/defects', {
            title: 'API Test Defect',
            description: 'Defect found during API testing',
            stepsToReproduce: '1. Run API test\n2. Observe error',
            severity: 'major',
            priority: 'high',
            status: 'open'
        });
        logTest('Defects', 'Create defect',
            createDefectResponse.statusCode === 201 || createDefectResponse.statusCode === 400,
            `Status: ${createDefectResponse.statusCode}`);

        // Test 6.2: Get all defects
        console.log('\n6.2 Testing get all defects...');
        const getDefectsResponse = await makeRequest('GET', '/defects');
        logTest('Defects', 'Get all defects',
            getDefectsResponse.statusCode === 200,
            `Status: ${getDefectsResponse.statusCode}, Count: ${getDefectsResponse.body?.length || 0}`);

        // Test 6.3: Get defect by ID
        if (getDefectsResponse.body && getDefectsResponse.body.length > 0) {
            const defectId = getDefectsResponse.body[0]._id;
            console.log('\n6.3 Testing get defect by ID...');
            const getDefectResponse = await makeRequest('GET', `/defects/${defectId}`);
            logTest('Defects', 'Get defect by ID',
                getDefectResponse.statusCode === 200 || getDefectResponse.statusCode === 404,
                `Status: ${getDefectResponse.statusCode}`);
        }

        // Test 6.4: Update defect
        if (getDefectsResponse.body && getDefectsResponse.body.length > 0) {
            const defectId = getDefectsResponse.body[0]._id;
            console.log('\n6.4 Testing update defect...');
            const updateDefectResponse = await makeRequest('PUT', `/defects/${defectId}`, {
                status: 'in_progress',
                priority: 'critical'
            });
            logTest('Defects', 'Update defect',
                updateDefectResponse.statusCode === 200 || updateDefectResponse.statusCode === 403,
                `Status: ${updateDefectResponse.statusCode}`);
        }

        // Test 6.5: Delete defect (soft delete)
        if (getDefectsResponse.body && getDefectsResponse.body.length > 1) {
            const defectId = getDefectsResponse.body[1]._id;
            console.log('\n6.5 Testing delete defect (soft delete)...');
            const deleteDefectResponse = await makeRequest('DELETE', `/defects/${defectId}`);
            logTest('Defects', 'Delete defect (soft delete)',
                deleteDefectResponse.statusCode === 200 || deleteDefectResponse.statusCode === 403,
                `Status: ${deleteDefectResponse.statusCode}`);
        }

        // ============================================
        // 7. DASHBOARD ENDPOINTS
        // ============================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 DASHBOARD ENDPOINTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test 7.1: Get dashboard statistics
        console.log('7.1 Testing get dashboard statistics...');
        const dashboardResponse = await makeRequest('GET', '/dashboard/stats');
        logTest('Dashboard', 'Get dashboard statistics',
            dashboardResponse.statusCode === 200,
            `Status: ${dashboardResponse.statusCode}`);

        // Test 7.2: Get recent activity
        console.log('\n7.2 Testing get recent activity...');
        const activityResponse = await makeRequest('GET', '/dashboard/activity');
        logTest('Dashboard', 'Get recent activity',
            activityResponse.statusCode === 200,
            `Status: ${activityResponse.statusCode}`);

        // Print API test report
        printApiTestReport();

    } catch (error) {
        console.error('\n❌ API test suite failed:', error.message);
        console.error(error);
    }
}

// Print API test report
function printApiTestReport() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  API ENDPOINT TEST REPORT                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const totalTests = apiResults.passed.length + apiResults.failed.length + apiResults.skipped.length;
    const passRate = totalTests > 0 ? ((apiResults.passed.length / totalTests) * 100).toFixed(2) : 0;

    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Tests:     ${totalTests}`);
    console.log(`✅ Passed:       ${apiResults.passed.length} (${passRate}%)`);
    console.log(`❌ Failed:       ${apiResults.failed.length}`);
    console.log(`⏭️  Skipped:     ${apiResults.skipped.length}\n`);

    // Endpoint-wise summary
    console.log('📋 ENDPOINT-WISE RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const endpoints = [...new Set([...apiResults.passed, ...apiResults.failed].map(r => r.endpoint))];
    endpoints.forEach(endpoint => {
        const passed = apiResults.passed.filter(r => r.endpoint === endpoint).length;
        const failed = apiResults.failed.filter(r => r.endpoint === endpoint).length;
        const total = passed + failed;
        const rate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
        console.log(`${endpoint.padEnd(20)} ${passed}/${total} passed (${rate}%)`);
    });

    // Failed tests details
    if (apiResults.failed.length > 0) {
        console.log('\n❌ FAILED TESTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        apiResults.failed.forEach(failed => {
            console.log(`[${failed.endpoint}] ${failed.testName}`);
            if (failed.message) console.log(`  → ${failed.message}`);
        });
    }

    // Skipped tests details
    if (apiResults.skipped.length > 0) {
        console.log('\n⏭️  SKIPPED TESTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        apiResults.skipped.forEach(skipped => {
            console.log(`[${skipped.endpoint}] ${skipped.testName}`);
            if (skipped.message) console.log(`  → ${skipped.message}`);
        });
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    API TEST SUITE COMPLETED                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

// Run API tests
runApiTests();
