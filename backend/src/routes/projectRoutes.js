const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: error.message
        });
    }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin, QA Lead)
router.post('/', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const { name, description, teamMembers } = req.body;

        const project = await Project.create({
            name,
            description,
            createdBy: req.user.id,
            teamMembers: teamMembers || []
        });

        const populatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: populatedProject
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating project',
            error: error.message
        });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, QA Lead)
router.put('/:id', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const { name, description, status, teamMembers } = req.body;

        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status) project.status = status;
        if (teamMembers) project.teamMembers = teamMembers;

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: updatedProject
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating project',
            error: error.message
        });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: error.message
        });
    }
});

// @route   POST /api/projects/:id/members
// @desc    Add team member to project
// @access  Private (Admin, QA Lead)
router.post('/:id/members', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const { userId } = req.body;

        if (!project.teamMembers.includes(userId)) {
            project.teamMembers.push(userId);
            await project.save();
        }

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Team member added successfully',
            data: updatedProject
        });
    } catch (error) {
        console.error('Add team member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding team member',
            error: error.message
        });
    }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove team member from project
// @access  Private (Admin, QA Lead)
router.delete('/:id/members/:userId', protect, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.teamMembers = project.teamMembers.filter(
            member => member.toString() !== req.params.userId
        );
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Team member removed successfully',
            data: updatedProject
        });
    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing team member',
            error: error.message
        });
    }
});

module.exports = router;
