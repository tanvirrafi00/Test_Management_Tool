const express = require('express');
const router = express.Router();
const TestPlan = require('../models/TestPlan');
const { protect, authorize, restrictViewer } = require('../middlewares/auth');
const { validateTestPlanBelongsToProject, validateTestCasesBelongToProject } = require('../middlewares/validateDataIntegrity');

// @route   GET /api/testplans
// @desc    Get all test plans
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { project, status, includeCancelled } = req.query;

        let query = {};

        if (project) query.project = project;
        if (status) query.status = status;
        // Filter out cancelled test plans unless explicitly requested
        if (!status && includeCancelled !== 'true') {
            query.status = { $ne: 'cancelled' };
        }

        const testPlans = await TestPlan.find(query)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: testPlans.length,
            data: testPlans
        });
    } catch (error) {
        console.error('Get test plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test plans',
            error: error.message
        });
    }
});

// @route   GET /api/testplans/:id
// @desc    Get single test plan
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const testPlan = await TestPlan.findById(req.params.id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: testPlan
        });
    } catch (error) {
        console.error('Get test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test plan',
            error: error.message
        });
    }
});

// @route   POST /api/testplans
// @desc    Create new test plan
// @access  Private (Admin, QA Lead)
router.post('/', protect, restrictViewer, authorize('admin', 'qa_lead'), validateTestPlanBelongsToProject, async (req, res) => {
    try {
        const {
            name,
            description,
            releaseVersion,
            startDate,
            endDate,
            project,
            assignedTesters,
            testCases
        } = req.body;

        const testPlan = await TestPlan.create({
            name,
            description,
            releaseVersion,
            startDate,
            endDate,
            project,
            assignedTesters: assignedTesters || [],
            testCases: testCases || [],
            createdBy: req.user.id
        });

        const populatedTestPlan = await TestPlan.findById(testPlan._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        res.status(201).json({
            success: true,
            message: 'Test plan created successfully',
            data: populatedTestPlan
        });
    } catch (error) {
        console.error('Create test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test plan',
            error: error.message
        });
    }
});

// @route   PUT /api/testplans/:id
// @desc    Update test plan
// @access  Private (Admin, QA Lead)
router.put('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateTestPlanBelongsToProject, async (req, res) => {
    try {
        const testPlan = req.testPlan || await TestPlan.findById(req.params.id);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        const {
            name,
            description,
            releaseVersion,
            startDate,
            endDate,
            status,
            assignedTesters
        } = req.body;

        if (name) testPlan.name = name;
        if (description !== undefined) testPlan.description = description;
        if (releaseVersion !== undefined) testPlan.releaseVersion = releaseVersion;
        if (startDate) testPlan.startDate = startDate;
        if (endDate) testPlan.endDate = endDate;
        if (status) testPlan.status = status;
        if (assignedTesters) testPlan.assignedTesters = assignedTesters;

        await testPlan.save();

        const updatedTestPlan = await TestPlan.findById(testPlan._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        res.status(200).json({
            success: true,
            message: 'Test plan updated successfully',
            data: updatedTestPlan
        });
    } catch (error) {
        console.error('Update test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating test plan',
            error: error.message
        });
    }
});

// @route   DELETE /api/testplans/:id
// @desc    Soft delete test plan (mark as cancelled)
// @access  Private (Admin)
router.delete('/:id', protect, restrictViewer, authorize('admin'), validateTestPlanBelongsToProject, async (req, res) => {
    try {
        const testPlan = req.testPlan || await TestPlan.findById(req.params.id);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        // Soft delete: change status to 'cancelled' instead of deleting
        testPlan.status = 'cancelled';
        await testPlan.save();

        res.status(200).json({
            success: true,
            message: 'Test plan cancelled successfully'
        });
    } catch (error) {
        console.error('Delete test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling test plan',
            error: error.message
        });
    }
});

// @route   PUT /api/testplans/:id/restore
// @desc    Restore cancelled test plan
// @access  Private (Admin)
router.put('/:id/restore', protect, restrictViewer, authorize('admin'), validateTestPlanBelongsToProject, async (req, res) => {
    try {
        const testPlan = req.testPlan || await TestPlan.findById(req.params.id);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        // Restore: change status back to 'active'
        testPlan.status = 'active';
        await testPlan.save();

        const restoredTestPlan = await TestPlan.findById(testPlan._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        res.status(200).json({
            success: true,
            message: 'Test plan restored successfully',
            data: restoredTestPlan
        });
    } catch (error) {
        console.error('Restore test plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring test plan',
            error: error.message
        });
    }
});

// @route   POST /api/testplans/:id/testcases
// @desc    Add test cases to test plan
// @access  Private (Admin, QA Lead)
router.post('/:id/testcases', protect, restrictViewer, authorize('admin', 'qa_lead'), validateTestCasesBelongToProject, async (req, res) => {
    try {
        const testPlan = await TestPlan.findById(req.params.id);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        const { testCases } = req.body;

        testCases.forEach(testCaseId => {
            if (!testPlan.testCases.includes(testCaseId)) {
                testPlan.testCases.push(testCaseId);
            }
        });

        await testPlan.save();

        const updatedTestPlan = await TestPlan.findById(testPlan._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        res.status(200).json({
            success: true,
            message: 'Test cases added successfully',
            data: updatedTestPlan
        });
    } catch (error) {
        console.error('Add test cases error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding test cases',
            error: error.message
        });
    }
});

// @route   DELETE /api/testplans/:id/testcases/:testCaseId
// @desc    Remove test case from test plan
// @access  Private (Admin, QA Lead)
router.delete('/:id/testcases/:testCaseId', protect, restrictViewer, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const testPlan = await TestPlan.findById(req.params.id);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        testPlan.testCases = testPlan.testCases.filter(
            tc => tc.toString() !== req.params.testCaseId
        );
        await testPlan.save();

        const updatedTestPlan = await TestPlan.findById(testPlan._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .populate('testCases', 'title priority status');

        res.status(200).json({
            success: true,
            message: 'Test case removed successfully',
            data: updatedTestPlan
        });
    } catch (error) {
        console.error('Remove test case error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing test case',
            error: error.message
        });
    }
});

module.exports = router;
