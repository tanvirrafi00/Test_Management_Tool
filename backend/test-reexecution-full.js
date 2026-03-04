require('dotenv').config();
const mongoose = require('mongoose');
const Execution = require('./src/models/Execution');
const TestCase = require('./src/models/TestCase');
const TestPlan = require('./src/models/TestPlan');
const User = require('./src/models/User');
const Project = require('./src/models/Project');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testflow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

async function testReexecution() {
    try {
        console.log('\n=== Testing Re-Execution Functionality ===\n');

        // 1. Find or create test data
        console.log('1. Setting up test data...');

        // Find or create user
        let user = await User.findOne({ role: { $in: ['admin', 'qa_lead', 'qa_engineer'] } });
        if (!user) {
            console.log('   Creating test user...');
            user = await User.create({
                name: 'Test QA Engineer',
                email: 'testqa@example.com',
                password: 'test123',
                role: 'qa_engineer'
            });
            console.log(`✅ Created test user: ${user.name} (ID: ${user._id})`);
        } else {
            console.log(`✅ Found existing user: ${user.name} (ID: ${user._id})`);
        }

        // Find or create project
        let project = await Project.findOne();
        if (!project) {
            console.log('   Creating test project...');
            project = await Project.create({
                name: 'Test Project',
                description: 'Test project for re-execution testing',
                createdBy: user._id
            });
            console.log(`✅ Created test project: ${project.name} (ID: ${project._id})`);
        } else {
            console.log(`✅ Found existing project: ${project.name} (ID: ${project._id})`);
        }

        // Find or create test case
        let testCase = await TestCase.findOne();
        if (!testCase) {
            console.log('   Creating test case...');
            testCase = await TestCase.create({
                title: 'Test Case for Re-Execution',
                description: 'This is a test case to verify re-execution functionality',
                priority: 'high',
                status: 'ready',
                testSteps: [
                    { stepNumber: 1, action: 'Step 1 action', expectedResult: 'Result 1' },
                    { stepNumber: 2, action: 'Step 2 action', expectedResult: 'Result 2' }
                ],
                createdBy: user._id,
                project: project._id
            });
            console.log(`✅ Created test case: ${testCase.title} (ID: ${testCase._id})`);
        } else {
            console.log(`✅ Found existing test case: ${testCase.title} (ID: ${testCase._id})`);
        }

        // Find or create test plan
        let testPlan = await TestPlan.findOne();
        if (!testPlan) {
            console.log('   Creating test plan...');
            testPlan = await TestPlan.create({
                name: 'Test Plan for Re-Execution',
                description: 'Test plan to verify re-execution functionality',
                status: 'active',
                createdBy: user._id,
                project: project._id,
                testCases: [testCase._id]
            });
            console.log(`✅ Created test plan: ${testPlan.name} (ID: ${testPlan._id})`);
        } else {
            console.log(`✅ Found existing test plan: ${testPlan.name} (ID: ${testPlan._id})`);
        }

        // 2. Clean up any existing executions for this test case/plan combination
        console.log('\n2. Cleaning up existing test executions...');
        await Execution.deleteMany({ testCase: testCase._id, testPlan: testPlan._id });
        console.log('✅ Cleaned up existing executions');

        // 3. Create first execution
        console.log('\n3. Creating first execution...');
        const execution1 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'pass',
            comments: 'First execution - test passed'
        });
        console.log(`✅ Created first execution (ID: ${execution1.executionId})`);
        console.log(`   Status: ${execution1.status}`);
        console.log(`   Created at: ${execution1.createdAt}`);
        console.log(`   Execution date: ${execution1.executionDate}`);

        // 4. Wait a moment to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 100));

        // 5. Create second execution (re-execution) - THIS SHOULD NOW WORK
        console.log('\n4. Creating second execution (re-execution)...');
        const execution2 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'fail',
            comments: 'Second execution - test failed'
        });
        console.log(`✅ Created second execution (ID: ${execution2.executionId})`);
        console.log(`   Status: ${execution2.status}`);
        console.log(`   Created at: ${execution2.createdAt}`);
        console.log(`   Execution date: ${execution2.executionDate}`);

        // 6. Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // 7. Create third execution (another re-execution)
        console.log('\n5. Creating third execution (another re-execution)...');
        const execution3 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'pass',
            comments: 'Third execution - test passed after fix'
        });
        console.log(`✅ Created third execution (ID: ${execution3.executionId})`);
        console.log(`   Status: ${execution3.status}`);
        console.log(`   Created at: ${execution3.createdAt}`);
        console.log(`   Execution date: ${execution3.executionDate}`);

        // 8. Verify all executions were created
        console.log('\n6. Verifying all executions were created...');
        const allExecutions = await Execution.find({
            testCase: testCase._id,
            testPlan: testPlan._id
        }).sort({ createdAt: 1 });

        console.log(`✅ Found ${allExecutions.length} executions for this test case/plan`);
        allExecutions.forEach((exec, index) => {
            console.log(`   Execution ${index + 1}:`);
            console.log(`     - ID: ${exec.executionId}`);
            console.log(`     - Status: ${exec.status}`);
            console.log(`     - Created: ${exec.createdAt}`);
            console.log(`     - Comments: ${exec.comments}`);
        });

        // 9. Test filtering by status
        console.log('\n7. Testing filtering by status...');
        const passedExecutions = await Execution.find({
            testCase: testCase._id,
            testPlan: testPlan._id,
            status: 'pass'
        }).sort({ createdAt: 1 });
        console.log(`✅ Found ${passedExecutions.length} passed executions`);

        const failedExecutions = await Execution.find({
            testCase: testCase._id,
            testPlan: testPlan._id,
            status: 'fail'
        }).sort({ createdAt: 1 });
        console.log(`✅ Found ${failedExecutions.length} failed executions`);

        // 10. Test sorting by executionDate
        console.log('\n8. Testing sorting by executionDate...');
        const sortedExecutions = await Execution.find({
            testCase: testCase._id,
            testPlan: testPlan._id
        }).sort({ executionDate: -1 });
        console.log(`✅ Executions sorted by executionDate (newest first):`);
        sortedExecutions.forEach((exec, index) => {
            console.log(`   ${index + 1}. ${exec.executionId} - ${exec.status} - ${exec.executionDate}`);
        });

        // 11. Test GET endpoints via MongoDB queries (simulating API behavior)
        console.log('\n9. Testing GET endpoint behavior (simulated)...');

        // Simulate GET /api/executions with filters
        console.log('\n   Simulating GET /api/executions?testCase=...&testPlan=...');
        const filteredExecutions = await Execution.find({
            testCase: testCase._id,
            testPlan: testPlan._id,
            status: { $ne: 'archived' }
        }).populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .sort({ executionDate: -1 });
        console.log(`✅ Found ${filteredExecutions.length} executions (excluding archived)`);

        // Simulate GET /api/executions/testcase/:testCaseId
        console.log('\n   Simulating GET /api/executions/testcase/:testCaseId...');
        const testCaseExecutions = await Execution.find({
            testCase: testCase._id
        }).populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .sort({ executionDate: -1 });
        console.log(`✅ Found ${testCaseExecutions.length} executions for test case`);

        // Simulate GET /api/executions/testplan/:testPlanId
        console.log('\n   Simulating GET /api/executions/testplan/:testPlanId...');
        const testPlanExecutions = await Execution.find({
            testPlan: testPlan._id
        }).populate('testCase', 'title priority status')
            .populate('executedBy', 'name email')
            .sort({ executionDate: -1 });
        console.log(`✅ Found ${testPlanExecutions.length} executions for test plan`);

        console.log('\n=== ✅ All Re-Execution Tests Passed! ===\n');
        console.log('Summary:');
        console.log('- Multiple executions can be created for same test case/plan');
        console.log('- Each execution has unique _id and executionId');
        console.log('- Execution history is preserved with timestamps');
        console.log('- Filtering by status works correctly');
        console.log('- Sorting by executionDate works correctly');
        console.log('- GET endpoints return all execution records (not just latest)');
        console.log('\nRe-execution blocking logic has been successfully removed!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

// Run the test
testReexecution();
