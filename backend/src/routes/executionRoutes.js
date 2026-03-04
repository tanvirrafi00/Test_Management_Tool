const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const Defect = require('../models/Defect');
const TestCase = require('../models/TestCase');
const { protect, authorize, restrictViewer } = require('../middlewares/auth');
const { validateExecutionBelongsToTestPlan } = require('../middlewares/validateDataIntegrity');

/**
 * Helper function to create a defect from a failed execution
 * @param {Object} execution - The execution object
 * @param {Object} user - The user object creating the defect
 * @returns {Object} - The created defect
 */
async function createDefectFromExecution(execution, user) {
    try {
        // Fetch the test case to get project and test case details
        const testCase = await TestCase.findById(execution.testCase);
        if (!testCase) {
            throw new Error('Test case not found');
        }

        // Create defect with pre-filled data from execution
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
            assignedTo: user.id // Assign to the user who executed the test
        });

        // Update execution to link the created defect
        execution.linkedDefect = defect._id;
        await execution.save();

        return defect;
    } catch (error) {
        console.error('Error creating defect from execution:', error);
        throw error;
    }
}

// @route   GET /api/executions
// @desc    Get all executions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { testPlan, testCase, status, executedBy, includeArchived } = req.query;

        let query = {};

        if (testPlan) query.testPlan = testPlan;
        if (testCase) query.testCase = testCase;
        if (status) query.status = status;
        if (executedBy) query.executedBy = executedBy;
        // Filter out archived executions unless explicitly requested
        if (!status && includeArchived !== 'true') {
            query.status = { $ne: 'archived' };
        }

        const executions = await Execution.find(query)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status')
            .sort({ executionDate: -1 });

        res.status(200).json({
            success: true,
            count: executions.length,
            data: executions
        });
    } catch (error) {
        console.error('Get executions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching executions',
            error: error.message
        });
    }
});

// @route   GET /api/executions/:id
// @desc    Get single execution
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id)
            .populate('testCase', 'title priority testSteps')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        res.status(200).json({
            success: true,
            data: execution
        });
    } catch (error) {
        console.error('Get execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching execution',
            error: error.message
        });
    }
});

// @route   POST /api/executions
// @desc    Create new execution (allows multiple executions for same test case/plan for history tracking)
// @access  Private (QA Lead, QA Engineer)
router.post('/', protect, restrictViewer, authorize('admin', 'qa_lead', 'qa_engineer'), validateExecutionBelongsToTestPlan, async (req, res) => {
    try {
        const { testCase, testPlan, status, comments, linkedDefect, createDefect } = req.body;

        // Create new execution record - allows multiple executions for same test case/plan
        // This enables re-execution and history tracking as per spec requirements
        const execution = await Execution.create({
            testCase,
            testPlan,
            executedBy: req.user.id,
            status: status || 'not_run',
            comments,
            linkedDefect
        });

        // Automatic defect creation on fail status if createDefect flag is true
        let createdDefect = null;
        if (status === 'fail' && createDefect === true) {
            try {
                createdDefect = await createDefectFromExecution(execution, req.user);
                console.log(`Defect created automatically for execution ${execution.executionId}: ${createdDefect.defectId}`);
            } catch (defectError) {
                console.error('Automatic defect creation failed:', defectError);
                // Continue with execution creation even if defect creation fails
                // Log the error but don't fail the entire operation
            }
        }

        const populatedExecution = await Execution.findById(execution._id)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        const response = {
            success: true,
            message: 'Execution created successfully',
            data: populatedExecution
        };

        // Include defect creation info in response
        if (createdDefect) {
            response.defectCreated = true;
            response.defectId = createdDefect._id;
            response.defectDefectId = createdDefect.defectId;
        }

        res.status(201).json(response);
    } catch (error) {
        console.error('Create execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating execution',
            error: error.message
        });
    }
});

// @route   PUT /api/executions/:id
// @desc    Update execution
// @access  Private (QA Lead, QA Engineer)
router.put('/:id', protect, restrictViewer, authorize('admin', 'qa_lead', 'qa_engineer'), validateExecutionBelongsToTestPlan, async (req, res) => {
    try {
        const execution = req.execution || await Execution.findById(req.params.id);

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        const { status, comments, linkedDefect, createDefect } = req.body;

        if (status) execution.status = status;
        if (comments !== undefined) execution.comments = comments;
        if (linkedDefect !== undefined) execution.linkedDefect = linkedDefect;

        // Update execution date if status changed
        if (status && status !== 'not_run') {
            execution.executionDate = Date.now();
        }

        await execution.save();

        // Automatic defect creation on fail status if createDefect flag is true
        let createdDefect = null;
        if (status === 'fail' && createDefect === true && !execution.linkedDefect) {
            try {
                createdDefect = await createDefectFromExecution(execution, req.user);
                console.log(`Defect created automatically for execution ${execution.executionId}: ${createdDefect.defectId}`);
            } catch (defectError) {
                console.error('Automatic defect creation failed:', defectError);
                // Continue with execution update even if defect creation fails
                // Log the error but don't fail the entire operation
            }
        }

        const updatedExecution = await Execution.findById(execution._id)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        const response = {
            success: true,
            message: 'Execution updated successfully',
            data: updatedExecution
        };

        // Include defect creation info in response
        if (createdDefect) {
            response.defectCreated = true;
            response.defectId = createdDefect._id;
            response.defectDefectId = createdDefect.defectId;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Update execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating execution',
            error: error.message
        });
    }
});

// @route   DELETE /api/executions/:id
// @desc    Soft delete execution (archive)
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateExecutionBelongsToTestPlan, async (req, res) => {
    try {
        const execution = req.execution || await Execution.findById(req.params.id);

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        // Soft delete: change status to 'archived' instead of deleting
        execution.status = 'archived';
        await execution.save();

        res.status(200).json({
            success: true,
            message: 'Execution archived successfully'
        });
    } catch (error) {
        console.error('Delete execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving execution',
            error: error.message
        });
    }
});

// @route   PUT /api/executions/:id/restore
// @desc    Restore archived execution
// @access  Private (Admin, QA Lead)
router.put('/:id/restore', protect, restrictViewer, authorize('admin', 'qa_lead'), validateExecutionBelongsToTestPlan, async (req, res) => {
    try {
        const execution = req.execution || await Execution.findById(req.params.id);

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        // Restore: change status back to 'not_run'
        execution.status = 'not_run';
        await execution.save();

        const restoredExecution = await Execution.findById(execution._id)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        res.status(200).json({
            success: true,
            message: 'Execution restored successfully',
            data: restoredExecution
        });
    } catch (error) {
        console.error('Restore execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring execution',
            error: error.message
        });
    }
});

// @route   GET /api/executions/testplan/:testPlanId
// @desc    Get all executions for a test plan
// @access  Private
router.get('/testplan/:testPlanId', protect, async (req, res) => {
    try {
        const executions = await Execution.find({ testPlan: req.params.testPlanId })
            .populate('testCase', 'title priority status')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status')
            .sort({ executionDate: -1 });

        res.status(200).json({
            success: true,
            count: executions.length,
            data: executions
        });
    } catch (error) {
        console.error('Get executions by test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching executions',
            error: error.message
        });
    }
});

// @route   GET /api/executions/testcase/:testCaseId
// @desc    Get execution history for a test case
// @access  Private
router.get('/testcase/:testCaseId', protect, async (req, res) => {
    try {
        const executions = await Execution.find({ testCase: req.params.testCaseId })
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status')
            .sort({ executionDate: -1 });

        res.status(200).json({
            success: true,
            count: executions.length,
            data: executions
        });
    } catch (error) {
        console.error('Get executions by test case error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching executions',
            error: error.message
        });
    }
});

module.exports = router;
