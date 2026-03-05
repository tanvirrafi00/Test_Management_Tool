const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Feature = require('../models/Feature');
const TestCase = require('../models/TestCase');
const TestPlan = require('../models/TestPlan');
const Defect = require('../models/Defect');
const Execution = require('../models/Execution');
const User = require('../models/User');
const { protect, authorize, restrictViewer } = require('../middlewares/auth');
const { validateCreatorOrAdmin } = require('../middlewares/validateDataIntegrity');
const { getProjectFilter } = require('../utils/roleBasedFilter');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { includeArchived } = req.query;

        let query = {};

        // Debug logging
        console.log('GET /api/projects - User:', {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        });

        // Apply role-based filtering
        try {
            const projectIds = await getProjectFilter(req.user);
            if (projectIds) {
                query._id = { $in: projectIds };
            }
            console.log('Project filter query:', query);
        } catch (err) {
            console.error('Filter error:', err);
            return res.status(403).json({ success: false, message: err.message });
        }

        // Filter out archived projects unless explicitly requested
        if (includeArchived !== 'true') {
            query.status = { $ne: 'archived' };
        }

        const projects = await Project.find(query)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
            .populate('teamMembers', 'name email role')
            .sort({ createdAt: -1 });

        console.log('Found projects:', projects.length);

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
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
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
router.post('/', protect, restrictViewer, authorize('admin', 'qa_lead'), async (req, res) => {
    try {
        const {
            name,
            description,
            status,
            productOwner,
            qaLead,
            startDate,
            expectedEndDate,
            repositoryUrl,
            documentationLink,
            jiraReference,
            environmentDetails,
            teamMembers
        } = req.body;

        const project = await Project.create({
            name,
            description,
            status: status || 'Draft',
            productOwner,
            qaLead,
            startDate,
            expectedEndDate,
            repositoryUrl,
            documentationLink,
            jiraReference,
            environmentDetails,
            createdBy: req.user._id,
            teamMembers: teamMembers || []
        });

        const populatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
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
router.put('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Project), async (req, res) => {
    try {
        const project = req.entity;

        const {
            name,
            description,
            status,
            productOwner,
            qaLead,
            startDate,
            expectedEndDate,
            repositoryUrl,
            documentationLink,
            jiraReference,
            environmentDetails,
            teamMembers
        } = req.body;

        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status) project.status = status;
        if (productOwner !== undefined) project.productOwner = productOwner;
        if (qaLead !== undefined) project.qaLead = qaLead;
        if (startDate !== undefined) project.startDate = startDate;
        if (expectedEndDate !== undefined) project.expectedEndDate = expectedEndDate;
        if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl;
        if (documentationLink !== undefined) project.documentationLink = documentationLink;
        if (jiraReference !== undefined) project.jiraReference = jiraReference;
        if (environmentDetails !== undefined) project.environmentDetails = environmentDetails;
        if (teamMembers) project.teamMembers = teamMembers;

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
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
// @desc    Soft delete project (archive)
// @access  Private (Admin)
router.delete('/:id', protect, restrictViewer, authorize('admin'), validateCreatorOrAdmin('id', Project), async (req, res) => {
    try {
        const project = req.entity;

        // Soft delete: change status to 'archived' instead of deleting
        project.status = 'archived';
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project archived successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error archiving project',
            error: error.message
        });
    }
});

// @route   PUT /api/projects/:id/restore
// @desc    Restore archived project
// @access  Private (Admin)
router.put('/:id/restore', protect, restrictViewer, authorize('admin'), validateCreatorOrAdmin('id', Project), async (req, res) => {
    try {
        const project = req.entity;

        // Restore: change status back to 'active'
        project.status = 'active';
        await project.save();

        const restoredProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
            .populate('teamMembers', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Project restored successfully',
            data: restoredProject
        });
    } catch (error) {
        console.error('Restore project error:', error);
        res.status(500).json({
            success: false,
            message: 'Error restoring project',
            error: error.message
        });
    }
});

// @route   POST /api/projects/:id/members
// @desc    Add team member to project
// @access  Private (Admin, QA Lead)
router.post('/:id/members', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Project), async (req, res) => {
    try {
        const project = req.entity;

        const { userId } = req.body;

        if (!project.teamMembers.includes(userId)) {
            project.teamMembers.push(userId);
            await project.save();
        }

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
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
router.delete('/:id/members/:userId', protect, restrictViewer, authorize('admin', 'qa_lead'), validateCreatorOrAdmin('id', Project), async (req, res) => {
    try {
        const project = req.entity;

        project.teamMembers = project.teamMembers.filter(
            member => member.toString() !== req.params.userId
        );
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('createdBy', 'name email')
            .populate('productOwner', 'name email')
            .populate('qaLead', 'name email')
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

// @route   GET /api/projects/:id/dashboard
// @desc    Get project dashboard data with widgets
// @access  Private
router.get('/:id/dashboard', protect, async (req, res) => {
    try {
        console.log('Dashboard request - User:', {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        });
        console.log('Dashboard request - Project ID:', req.params.id);

        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            console.error('Access denied for dashboard:', err.message);
            return res.status(403).json({ success: false, message: err.message });
        }

        const project = await Project.findById(req.params.id)
            .populate('qaLead', 'name email')
            .populate('teamMembers', 'name email role');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Get total features
        const totalFeatures = await Feature.countDocuments({ project: req.params.id });

        // Get total test cases
        const totalTestCases = await TestCase.countDocuments({ project: req.params.id });

        // Get execution statistics
        const executions = await Execution.find({ project: req.params.id });
        const passed = executions.filter(e => e.status === 'passed').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        const notRun = totalTestCases - executions.length;
        const executionProgress = totalTestCases > 0 ? Math.round((executions.length / totalTestCases) * 100) : 0;

        // Get defect summary
        const defects = await Defect.find({ project: req.params.id });
        const openDefects = defects.filter(d => d.status === 'open').length;
        const inProgressDefects = defects.filter(d => d.status === 'in_progress').length;
        const closedDefects = defects.filter(d => d.status === 'closed').length;

        // Get user's assigned tasks
        const userId = req.user._id;
        const myAssignedTestCases = await TestCase.countDocuments({
            project: req.params.id,
            assignedTo: userId
        });
        const myActiveTestPlans = await TestPlan.countDocuments({
            project: req.params.id,
            assignedTesters: userId,
            status: 'active'
        });
        const myAssignedDefects = await Defect.countDocuments({
            project: req.params.id,
            assignedTo: userId
        });

        res.status(200).json({
            success: true,
            data: {
                project: {
                    name: project.name,
                    status: project.status,
                    description: project.description,
                    startDate: project.startDate,
                    expectedEndDate: project.expectedEndDate,
                    qaLead: project.qaLead,
                    teamMembers: project.teamMembers
                },
                widgets: {
                    totalFeatures,
                    totalTestCases,
                    execution: {
                        passed,
                        failed,
                        notRun,
                        progress: executionProgress
                    },
                    defects: {
                        open: openDefects,
                        inProgress: inProgressDefects,
                        closed: closedDefects,
                        total: defects.length
                    },
                    myAssignedTasks: {
                        testCases: myAssignedTestCases,
                        testPlans: myActiveTestPlans,
                        defects: myAssignedDefects
                    }
                }
            }
        });
    } catch (error) {
        console.error('Get project dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project dashboard',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/features
// @desc    Get features for the project
// @access  Private
router.get('/:id/features', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const features = await Feature.find({ project: req.params.id })
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        // Get additional data for each feature
        const featuresWithStats = await Promise.all(features.map(async (feature) => {
            const testCases = await TestCase.countDocuments({ feature: feature._id });
            const defects = await Defect.countDocuments({ feature: feature._id });

            // Calculate execution progress
            const featureTestCases = await TestCase.find({ feature: feature._id });
            const testCaseIds = featureTestCases.map(tc => tc._id);
            const executions = await Execution.find({ testCase: { $in: testCaseIds } });
            const progress = testCases > 0 ? Math.round((executions.length / testCases) * 100) : 0;

            return {
                ...feature.toObject(),
                totalTestCases: testCases,
                executionProgress: progress,
                defectCount: defects
            };
        }));

        res.status(200).json({
            success: true,
            count: featuresWithStats.length,
            data: featuresWithStats
        });
    } catch (error) {
        console.error('Get project features error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project features',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/test-cases
// @desc    Get test cases for the project with filtering
// @access  Private
router.get('/:id/test-cases', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const { feature, priority, status, assignedTo } = req.query;
        let query = { project: req.params.id };

        // Apply filters
        if (feature) query.feature = feature;
        if (priority) query.priority = priority;
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;

        const testCases = await TestCase.find(query)
            .populate('feature', 'name featureId')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        // Highlight assigned test cases for the current user
        const testCasesWithHighlight = testCases.map(tc => ({
            ...tc.toObject(),
            isAssignedToMe: tc.assignedTo && tc.assignedTo._id.toString() === req.user._id.toString()
        }));

        res.status(200).json({
            success: true,
            count: testCasesWithHighlight.length,
            data: testCasesWithHighlight
        });
    } catch (error) {
        console.error('Get project test cases error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project test cases',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/test-plans
// @desc    Get test plans for the project with execution progress
// @access  Private
router.get('/:id/test-plans', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const testPlans = await TestPlan.find({ project: req.params.id })
            .populate('feature', 'name featureId')
            .populate('createdBy', 'name email')
            .populate('assignedTesters', 'name email')
            .sort({ createdAt: -1 });

        // Calculate execution progress for each test plan
        const testPlansWithProgress = await Promise.all(testPlans.map(async (plan) => {
            const totalTestCases = plan.testCases.length;

            // Get executions for all test cases in this plan
            const executions = await Execution.find({
                testCase: { $in: plan.testCases }
            });

            const passed = executions.filter(e => e.status === 'passed').length;
            const failed = executions.filter(e => e.status === 'failed').length;
            const progress = totalTestCases > 0 ? Math.round((executions.length / totalTestCases) * 100) : 0;

            return {
                ...plan.toObject(),
                executionProgress: progress,
                executionStats: {
                    total: totalTestCases,
                    passed,
                    failed,
                    notRun: totalTestCases - executions.length
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: testPlansWithProgress.length,
            data: testPlansWithProgress
        });
    } catch (error) {
        console.error('Get project test plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project test plans',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/defects
// @desc    Get defects for the project
// @access  Private
router.get('/:id/defects', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const { severity, status, assignedTo } = req.query;
        let query = { project: req.params.id };

        // Apply filters
        if (severity) query.severity = severity;
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;

        const defects = await Defect.find(query)
            .populate('feature', 'name featureId')
            .populate('linkedTestCase', 'testCaseId title')
            .populate('linkedExecution', 'executionId status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: defects.length,
            data: defects
        });
    } catch (error) {
        console.error('Get project defects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project defects',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/reports
// @desc    Get reports data for the project
// @access  Private
router.get('/:id/reports', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        // Test execution progress
        const totalTestCases = await TestCase.countDocuments({ project: req.params.id });
        const executions = await Execution.find({ project: req.params.id });
        const passed = executions.filter(e => e.status === 'passed').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        const skipped = executions.filter(e => e.status === 'skipped').length;
        const notRun = totalTestCases - executions.length;

        // Defect distribution
        const defects = await Defect.find({ project: req.params.id });
        const defectBySeverity = {
            critical: defects.filter(d => d.severity === 'critical').length,
            major: defects.filter(d => d.severity === 'major').length,
            minor: defects.filter(d => d.severity === 'minor').length,
            trivial: defects.filter(d => d.severity === 'trivial').length
        };
        const defectByStatus = {
            open: defects.filter(d => d.status === 'open').length,
            inProgress: defects.filter(d => d.status === 'in_progress').length,
            fixed: defects.filter(d => d.status === 'fixed').length,
            retest: defects.filter(d => d.status === 'retest').length,
            closed: defects.filter(d => d.status === 'closed').length
        };

        // Feature coverage
        const features = await Feature.find({ project: req.params.id });
        const featureCoverage = await Promise.all(features.map(async (feature) => {
            const testCases = await TestCase.countDocuments({ feature: feature._id });
            const featureExecutions = await Execution.find({
                testCase: {
                    $in: (await TestCase.find({ feature: feature._id })).map(tc => tc._id)
                }
            });
            const progress = testCases > 0 ? Math.round((featureExecutions.length / testCases) * 100) : 0;
            const featureDefects = await Defect.countDocuments({ feature: feature._id });

            return {
                name: feature.name,
                featureId: feature.featureId,
                testCases,
                executed: featureExecutions.length,
                progress,
                defects: featureDefects
            };
        }));

        // Tester performance
        const teamMembers = await Project.findById(req.params.id).populate('teamMembers');
        const testerPerformance = await Promise.all(teamMembers.teamMembers.map(async (member) => {
            const assignedTestCases = await TestCase.countDocuments({
                project: req.params.id,
                assignedTo: member._id
            });
            const memberExecutions = await Execution.find({
                project: req.params.id,
                executedBy: member._id
            });
            const reportedDefects = await Defect.countDocuments({
                project: req.params.id,
                createdBy: member._id
            });

            return {
                name: member.name,
                role: member.role,
                assignedTestCases,
                executedTestCases: memberExecutions.length,
                reportedDefects
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                testExecution: {
                    total: totalTestCases,
                    passed,
                    failed,
                    skipped,
                    notRun,
                    progress: totalTestCases > 0 ? Math.round((executions.length / totalTestCases) * 100) : 0
                },
                defectDistribution: {
                    bySeverity: defectBySeverity,
                    byStatus: defectByStatus
                },
                featureCoverage,
                testerPerformance
            }
        });
    } catch (error) {
        console.error('Get project reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project reports',
            error: error.message
        });
    }
});

// @route   GET /api/projects/:id/team
// @desc    Get team information for the project
// @access  Private
router.get('/:id/team', protect, async (req, res) => {
    try {
        // Check if user has access to this project
        try {
            await getProjectFilter(req.user, req.params.id);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        const project = await Project.findById(req.params.id)
            .populate('qaLead', 'name email role')
            .populate('teamMembers', 'name email role');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Get task counts for each team member
        const teamWithTasks = await Promise.all(project.teamMembers.map(async (member) => {
            const assignedTestCases = await TestCase.countDocuments({
                project: req.params.id,
                assignedTo: member._id
            });
            const assignedDefects = await Defect.countDocuments({
                project: req.params.id,
                assignedTo: member._id
            });
            const activeTestPlans = await TestPlan.countDocuments({
                project: req.params.id,
                assignedTesters: member._id,
                status: 'active'
            });

            return {
                ...member.toObject(),
                assignedTasks: {
                    testCases: assignedTestCases,
                    defects: assignedDefects,
                    testPlans: activeTestPlans
                },
                status: 'active' // Could be determined by recent activity
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                qaLead: project.qaLead,
                teamMembers: teamWithTasks
            }
        });
    } catch (error) {
        console.error('Get project team error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching project team',
            error: error.message
        });
    }
});

module.exports = router;

