const express = require('express');
const router = express.Router();
const Feature = require('../models/Feature');
const { protect, authorize, restrictViewer } = require('../middlewares/auth');
const { validateCreatorOrAdmin } = require('../middlewares/validateDataIntegrity');
const { getProjectFilter } = require('../utils/roleBasedFilter');

// @route   GET /api/features
// @desc    Get all features
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { project, includeDeprecated } = req.query;

        let query = {};

        // Apply role-based filtering
        try {
            const projectIds = await getProjectFilter(req.user);
            if (projectIds) {
                query.project = { $in: projectIds };
            }
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        // Filter by project if specified
        if (project) {
            query.project = project;
        }

        // Filter out deprecated features unless explicitly requested
        if (includeDeprecated !== 'true') {
            query.status = { $ne: 'deprecated' };
        }

        const features = await Feature.find(query)
            .populate('project', 'name')
            .populate('owner', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: features.length,
            data: features
        });
    } catch (error) {
        console.error('Get features error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching features',
            error: error.message
        });
    }
});

// @route   GET /api/features/:id
// @desc    Get single feature
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const feature = await Feature.findById(req.params.id)
            .populate('project', 'name')
            .populate('owner', 'name email')
            .populate('createdBy', 'name email');

        if (!feature) {
            return res.status(404).json({
                success: false,
                message: 'Feature not found'
            });
        }

        // Check if user has access to this feature's project
        try {
            await getProjectFilter(req.user, feature.project._id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        res.status(200).json({
            success: true,
            data: feature
        });
    } catch (error) {
        console.error('Get feature error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feature',
            error: error.message
        });
    }
});

// @route   POST /api/features
// @desc    Create new feature
// @access  Private (Admin, QA Lead)
router.post('/', protect, restrictViewer, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const {
            name,
            description,
            status,
            priority,
            owner,
            requirementLink,
            designDocument,
            storyReference,
            project
        } = req.body;

        if (!project) {
            return res.status(400).json({
                success: false,
                message: 'Project is required'
            });
        }

        // Check if user has access to the project
        try {
            await getProjectFilter(req.user, project);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const feature = await Feature.create({
            name,
            description,
            status: status || 'In Development',
            priority: priority || 'Medium',
            owner,
            requirementLink,
            designDocument,
            storyReference,
            project,
            createdBy: req.user.id
        });

        const populatedFeature = await Feature.findById(feature._id)
            .populate('project', 'name')
            .populate('owner', 'name email')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Feature created successfully',
            data: populatedFeature
        });
    } catch (error) {
        console.error('Create feature error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating feature',
            error: error.message
        });
    }
});

// @route   PUT /api/features/:id
// @desc    Update feature
// @access  Private (Admin, QA Lead)
router.put('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Feature), async (req, res) => {
    try {
        const feature = req.entity;

        const {
            name,
            description,
            status,
            priority,
            owner,
            requirementLink,
            designDocument,
            storyReference
        } = req.body;

        if (name) feature.name = name;
        if (description !== undefined) feature.description = description;
        if (status) feature.status = status;
        if (priority) feature.priority = priority;
        if (owner !== undefined) feature.owner = owner;
        if (requirementLink !== undefined) feature.requirementLink = requirementLink;
        if (designDocument !== undefined) feature.designDocument = designDocument;
        if (storyReference !== undefined) feature.storyReference = storyReference;

        await feature.save();

        const updatedFeature = await Feature.findById(feature._id)
            .populate('project', 'name')
            .populate('owner', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Feature updated successfully',
            data: updatedFeature
        });
    } catch (error) {
        console.error('Update feature error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating feature',
            error: error.message
        });
    }
});

// @route   DELETE /api/features/:id
// @desc    Soft delete feature (deprecate)
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Feature), async (req, res) => {
    try {
        const feature = req.entity;

        // Soft delete: change status to 'deprecated' instead of deleting
        feature.status = 'deprecated';
        await feature.save();

        res.status(200).json({
            success: true,
            message: 'Feature deprecated successfully'
        });
    } catch (error) {
        console.error('Delete feature error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deprecating feature',
            error: error.message
        });
    }
});

// @route   PUT /api/features/:id/restore
// @desc    Restore deprecated feature
// @access  Private (Admin, QA Lead)
router.put('/:id/restore', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Feature), async (req, res) => {
    try {
        const feature = req.entity;

        // Restore: change status back to 'active'
        feature.status = 'active';
        await feature.save();

        const restoredFeature = await Feature.findById(feature._id)
            .populate('project', 'name')
            .populate('owner', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Feature restored successfully',
            data: restoredFeature
        });
    } catch (error) {
        console.error('Restore feature error:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring feature',
            error: error.message
        });
    }
});

module.exports = router;

