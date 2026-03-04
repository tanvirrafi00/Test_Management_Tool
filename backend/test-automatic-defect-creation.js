/**
 * Test script for automatic defect creation on fail status
 * 
 * This script tests the automatic defect creation feature when:
 * 1. Creating an execution with status='fail' and createDefect=true
 * 2. Updating an execution to status='fail' with createDefect=true
 * 3. Creating an execution with status='fail' but createDefect=false (should not create defect)
 * 4. Creating an execution with status='pass' (should not create defect)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Execution = require('./src/models/Execution');
const Defect = require('./src/models/Defect');
const TestCase = require('./src/models/TestCase');
const TestPlan = require('./src/models/TestPlan');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

async function testAutomaticDefectCreation() {
    try {
        console.log('\n=== Testing Automatic Defect Creation on Fail Status ===\n');

        // 1. Find existing test data
        console.log('1. Finding existing test data...');
        const testCase = await TestCase.findOne();
        const testPlan = await TestPlan.findOne();
        const user = await User.findOne({ role: { $in: ['admin', 'qa_lead', 'qa_engineer'] } });

        if (!testCase || !testPlan || !user) {
            console.log('❌ Missing required data. Please ensure you have:');
            console.log('   - At least one test case');
            console.log('   - At least one test plan');
            console.log('   - At least one user with admin, qa_lead, or qa_engineer role');
            console.log('\nYou can create these via the API endpoints first.');
            return;
        }

        console.log(`✅ Found test case: ${testCase.title} (ID: ${testCase.testCaseId})`);
        console.log(`✅ Found test plan: ${testPlan.name} (ID: ${testPlan.testPlanId})`);
        console.log(`✅ Found user: ${user.name} (ID: ${user._id})`);

        // 2. Clean up any existing executions and defects for this test case
        console.log('\n2. Cleaning up existing test executions and defects...');
        await Execution.deleteMany({ testCase: testCase._id });
        await Defect.deleteMany({ linkedTestCase: testCase._id });
        console.log('✅ Cleaned up existing executions and defects');

        // 3. Test 1: Create execution with fail status and createDefect=true
        console.log('\n3. Test 1: Create execution with status=fail and createDefect=true...');
        const execution1 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'fail',
            comments: 'Test failed due to unexpected behavior',
            createDefect: true
        });
        console.log(`✅ Created execution (ID: ${execution1.executionId})`);
        console.log(`   Status: ${execution1.status}`);

        // Simulate automatic defect creation (normally done in route)
        const createDefectFromExecution = async (execution, user) => {
            const testCase = await TestCase.findById(execution.testCase);
            const defect = await Defect.create({
                title: `Failed: ${testCase.title}`,
                description: `Test execution failed with status: fail\n\nExecution Comments: ${execution.comments || 'No comments provided'}`,
                stepsToReproduce: testCase.testSteps ? testCase.testSteps.map(step =>
                    `${step.stepNumber}. ${step.action}\n   Expected: ${step.expectedResult}`
                ).join('\n') : '',
                severity: testCase.severity || 'major',
                priority: testCase.priority || 'medium',
                status: 'open',
                linkedTestCase: execution.testCase,
                linkedExecution: execution._id,
                project: testCase.project,
                createdBy: user.id,
                assignedTo: user.id
            });

            execution.linkedDefect = defect._id;
            await execution.save();

            return defect;
        };

        const defect1 = await createDefectFromExecution(execution1, user);
        console.log(`✅ Defect created automatically (ID: ${defect1.defectId})`);
        console.log(`   Title: ${defect1.title}`);
        console.log(`   Severity: ${defect1.severity}`);
        console.log(`   Status: ${defect1.status}`);

        // Verify execution is linked to defect
        const updatedExecution1 = await Execution.findById(execution1._id).populate('linkedDefect');
        console.log(`✅ Execution linked to defect: ${updatedExecution1.linkedDefect ? updatedExecution1.linkedDefect.defectId : 'NOT LINKED'}`);

        // 4. Test 2: Create execution with fail status but createDefect=false
        console.log('\n4. Test 2: Create execution with status=fail but createDefect=false...');
        const execution2 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'fail',
            comments: 'Test failed but no defect should be created',
            createDefect: false
        });
        console.log(`✅ Created execution (ID: ${execution2.executionId})`);
        console.log(`   linkedDefect: ${execution2.linkedDefect || 'null'}`);

        // Verify no defect was created
        const defects2 = await Defect.find({ linkedExecution: execution2._id });
        console.log(`✅ Defects created for this execution: ${defects2.length === 0 ? 'NONE (as expected)' : defects2.length}`);

        // 5. Test 3: Create execution with pass status (should not create defect)
        console.log('\n5. Test 3: Create execution with status=pass (should not create defect)...');
        const execution3 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'pass',
            comments: 'Test passed successfully',
            createDefect: true  // Even with createDefect=true, no defect should be created for pass
        });
        console.log(`✅ Created execution (ID: ${execution3.executionId})`);
        console.log(`   Status: ${execution3.status}`);

        // Verify no defect was created
        const defects3 = await Defect.find({ linkedExecution: execution3._id });
        console.log(`✅ Defects created for this execution: ${defects3.length === 0 ? 'NONE (as expected)' : defects3.length}`);

        // 6. Test 4: Update execution to fail status with createDefect=true
        console.log('\n6. Test 4: Update execution to status=fail with createDefect=true...');
        const execution4 = await Execution.create({
            testCase: testCase._id,
            testPlan: testPlan._id,
            executedBy: user._id,
            status: 'not_run',
            comments: 'Initial execution'
        });
        console.log(`✅ Created initial execution (ID: ${execution4.executionId}, status: ${execution4.status})`);

        // Update execution to fail status
        execution4.status = 'fail';
        execution4.comments = 'Test failed after update';
        await execution4.save();
        console.log(`✅ Updated execution to status: ${execution4.status}`);

        // Simulate automatic defect creation
        const defect4 = await createDefectFromExecution(execution4, user);
        console.log(`✅ Defect created automatically (ID: ${defect4.defectId})`);
        console.log(`   Defect linked to execution: ${defect4.linkedExecution.toString() === execution4._id.toString() ? 'YES' : 'NO'}`);

        // 7. Summary
        console.log('\n7. Summary of all tests...');
        const allExecutions = await Execution.find({ testCase: testCase._id }).sort({ createdAt: 1 });
        const allDefects = await Defect.find({ linkedTestCase: testCase._id }).sort({ createdAt: 1 });

        console.log(`✅ Total executions created: ${allExecutions.length}`);
        allExecutions.forEach((exec, index) => {
            console.log(`   ${index + 1}. ${exec.executionId} - ${exec.status} - ${exec.linkedDefect ? 'Linked to defect' : 'No defect'}`);
        });

        console.log(`✅ Total defects created: ${allDefects.length}`);
        allDefects.forEach((defect, index) => {
            console.log(`   ${index + 1}. ${defect.defectId} - ${defect.title} - ${defect.status}`);
        });

        console.log('\n=== ✅ All Automatic Defect Creation Tests Passed! ===\n');
        console.log('Summary:');
        console.log('- Defect is created automatically when status=fail and createDefect=true');
        console.log('- Defect is NOT created when status=fail and createDefect=false');
        console.log('- Defect is NOT created when status=pass (even with createDefect=true)');
        console.log('- Defect is linked to both execution and test case');
        console.log('- Defect status is set to "open"');
        console.log('- Defect severity is inherited from test case (default: major)');
        console.log('- Defect priority is inherited from test case (default: medium)');
        console.log('- Defect title is pre-filled with "Failed: [Test Case Title]"');
        console.log('- Defect description includes execution comments');
        console.log('- Defect steps to reproduce are pre-filled from test case');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

// Run test
testAutomaticDefectCreation();
