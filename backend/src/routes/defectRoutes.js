const express = require('express');
const router = express.Router();
const Defect = require('../models/Defect');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/defects
// @desc    Get all defects
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { project, status, severity, priority, assignedTo } = req.query;

        let query = {};

        if (project) query.project = project;
        if (status) query.status = status;
        if (severity) query.severity = severity;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        const defects = await Defect.find(query)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: defects.length,
            data: defects
        });
    } catch (error) {
        console.error('Get defects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching defects',
            error: error.message
        });
    }
});

// @route   GET /api/defects/:id
// @desc    Get single defect
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status');

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        res.status(200).json({
            success: true,
            data: defect
        });
    } catch (error) {
        console.error('Get defect error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching defect',
            error: error.message
        });
    }
});

// @route   POST /api/defects
// @desc    Create new defect
// @access  Private (QA Lead, QA Engineer)
router.post('/', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
    try {
        const {
            title,
            description,
            stepsToReproduce,
            expectedResult,
            actualResult,
            severity,
            priority,
            assignedTo,
            linkedTestCase,
            linkedExecution,
            project
        } = req.body;

        const defect = await Defect.create({
            title,
            description,
            stepsToReproduce,
            expectedResult,
            actualResult,
            severity,
            priority,
            assignedTo,
            linkedTestCase,
            linkedExecution,
            project,
            createdBy: req.user.id
        });

        const populatedDefect = await Defect.findById(defect._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status');

        res.status(201).json({
            success: true,
            message: 'Defect created successfully',
            data: populatedDefect
        });
    } catch (error) {
        console.error('Create defect error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating defect',
            error: error.message
        });
    }
});

// @route   PUT /api/defects/:id
// @desc    Update defect
// @access  Private (QA Lead, QA Engineer)
router.put('/:id', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
    try {
        let defect = await Defect.findById(req.params.id);

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        const {
            title,
            description,
            stepsToReproduce,
            expectedResult,
            actualResult,
            severity,
            priority,
            status,
            assignedTo
        } = req.body;

        if (title) defect.title = title;
        if (description !== undefined) defect.description = description;
        if (stepsToReproduce !== undefined) defect.stepsToReproduce = stepsToReproduce;
        if (expectedResult !== undefined) defect.expectedResult = expectedResult;
        if (actualResult !== undefined) defect.actualResult = actualResult;
        if (severity) defect.severity = severity;
        if (priority) defect.priority = priority;
        if (status) defect.status = status;
        if (assignedTo !== undefined) defect.assignedTo = assignedTo;

        await defect.save();

        const updatedDefect = await Defect.findById(defect._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status');

        res.status(200).json({
            success: true,
            message: 'Defect updated successfully',
            data: updatedDefect
        });
    } catch (error) {
        console.error('Update defect error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating defect',
            error: error.message
        });
    }
});

// @route   DELETE /api/defects/:id
// @desc    Delete defect
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.id);

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        await defect.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Defect deleted successfully'
        });
    } catch (error) {
        console.error('Delete defect error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting defect',
            error: error.message
        });
    }
});

// @route   PUT /api/defects/:id/assign
// @desc    Assign defect to user
// @access  Private (Admin, QA Lead)
router.put('/:id/assign', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.id);

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        const { assignedTo } = req.body;

        defect.assignedTo = assignedTo;
        await defect.save();

        const updatedDefect = await Defect.findById(defect._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status');

        res.status(200).json({
            success: true,
            message: 'Defect assigned successfully',
            data: updatedDefect
        });
    } catch (error) {
        console.error('Assign defect error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning defect',
            error: error.message
        });
    }
});

// @route   PUT /api/defects/:id/status
// @desc    Update defect status
// @access  Private (QA Lead, QA Engineer)
router.put('/:id/status', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
    try {
        const defect = await Defect.findById(req.params.id);

        if (!defect) {
            return res.status(404).json({
                success: false,
                message: 'Defect not found'
            });
        }

        const { status } = req.body;

        defect.status = status;
        await defect.save();

        const updatedDefect = await Defect.findById(defect._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status');

        res.status(200).json({
            success: true,
            message: 'Defect status updated successfully',
            data: updatedDefect
        });
    } catch (error) {
        console.error('Update defect status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating defect status',
            error: error.message
        });
    }
});

module.exports = router;
