const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/executions
// @desc    Get all executions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { testPlan, testCase, status, executedBy } = req.query;

        let query = {};

        if (testPlan) query.testPlan = testPlan;
        if (testCase) query.testCase = testCase;
        if (status) query.status = status;
        if (executedBy) query.executedBy = executedBy;

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
// @desc    Create new execution
// @access  Private (QA Lead, QA Engineer)
router.post('/', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
    try {
        const { testCase, testPlan, status, comments, linkedDefect } = req.body;

        // Check if execution already exists for this test case and test plan
        const existingExecution = await Execution.findOne({ testCase, testPlan });

        if (existingExecution) {
            return res.status(400).json({
                success: false,
                message: 'Execution already exists for this test case in the test plan'
            });
        }

        const execution = await Execution.create({
            testCase,
            testPlan,
            executedBy: req.user.id,
            status: status || 'not_run',
            comments,
            linkedDefect
        });

        const populatedExecution = await Execution.findById(execution._id)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        res.status(201).json({
            success: true,
            message: 'Execution created successfully',
            data: populatedExecution
        });
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
router.put('/:id', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
    try {
        let execution = await Execution.findById(req.params.id);

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        const { status, comments, linkedDefect } = req.body;

        if (status) execution.status = status;
        if (comments !== undefined) execution.comments = comments;
        if (linkedDefect !== undefined) execution.linkedDefect = linkedDefect;

        // Update execution date if status changed
        if (status && status !== 'not_run') {
            execution.executionDate = Date.now();
        }

        await execution.save();

        const updatedExecution = await Execution.findById(execution._id)
            .populate('testCase', 'title priority')
            .populate('testPlan', 'name')
            .populate('executedBy', 'name email')
            .populate('linkedDefect', 'defectId title status');

        res.status(200).json({
            success: true,
            message: 'Execution updated successfully',
            data: updatedExecution
        });
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
// @desc    Delete execution
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);

        if (!execution) {
            return res.status(404).json({
                success: false,
                message: 'Execution not found'
            });
        }

        await execution.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Execution deleted successfully'
        });
    } catch (error) {
        console.error('Delete execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting execution',
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
