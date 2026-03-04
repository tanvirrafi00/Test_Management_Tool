const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const TestPlan = require('../models/TestPlan');
const Execution = require('../models/Execution');
const Defect = require('../models/Defect');
const { protect } = require('../middlewares/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const { project } = req.query;
        let projectFilter = {};

        if (project) {
            projectFilter = { project };
        }

        // Get total counts
        const totalProjects = await Project.countDocuments();
        const totalTestCases = await TestCase.countDocuments(projectFilter);
        const totalTestPlans = await TestPlan.countDocuments(projectFilter);
        const totalExecutions = await Execution.countDocuments(projectFilter);

        // Get execution statistics
        const passCount = await Execution.countDocuments({ ...projectFilter, status: 'pass' });
        const failCount = await Execution.countDocuments({ ...projectFilter, status: 'fail' });
        const blockedCount = await Execution.countDocuments({ ...projectFilter, status: 'blocked' });
        const notRunCount = await Execution.countDocuments({ ...projectFilter, status: 'not_run' });
        const retestCount = await Execution.countDocuments({ ...projectFilter, status: 'retest' });

        // Calculate pass/fail rate
        const totalExecuted = passCount + failCount + blockedCount + retestCount;
        const passRate = totalExecuted > 0 ? ((passCount / totalExecuted) * 100).toFixed(2) : 0;
        const failRate = totalExecuted > 0 ? ((failCount / totalExecuted) * 100).toFixed(2) : 0;

        // Get defect statistics
        const openDefects = await Defect.countDocuments({ ...projectFilter, status: 'open' });
        const inProgressDefects = await Defect.countDocuments({ ...projectFilter, status: 'in_progress' });
        const fixedDefects = await Defect.countDocuments({ ...projectFilter, status: 'fixed' });
        const closedDefects = await Defect.countDocuments({ ...projectFilter, status: 'closed' });
        const retestDefects = await Defect.countDocuments({ ...projectFilter, status: 'retest' });

        // Calculate test coverage (test cases executed / total test cases)
        const testCoverage = totalTestCases > 0 ? ((totalExecuted / totalTestCases) * 100).toFixed(2) : 0;

        // Calculate execution progress
        const executionProgress = totalTestCases > 0 ? ((totalExecuted / totalTestCases) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalProjects,
                totalTestCases,
                totalTestPlans,
                totalExecutions,
                executionStats: {
                    pass: passCount,
                    fail: failCount,
                    blocked: blockedCount,
                    notRun: notRunCount,
                    retest: retestCount,
                    passRate: parseFloat(passRate),
                    failRate: parseFloat(failRate)
                },
                defectStats: {
                    open: openDefects,
                    inProgress: inProgressDefects,
                    fixed: fixedDefects,
                    retest: retestDefects,
                    closed: closedDefects
                },
                testCoverage: parseFloat(testCoverage),
                executionProgress: parseFloat(executionProgress)
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity
// @access  Private
router.get('/recent-activity', protect, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent test cases
        const recentTestCases = await TestCase.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get recent executions
        const recentExecutions = await Execution.find()
            .populate('testCase', 'title')
            .populate('executedBy', 'name')
            .sort({ executionDate: -1 })
            .limit(limit);

        // Get recent defects
        const recentDefects = await Defect.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            data: {
                recentTestCases,
                recentExecutions,
                recentDefects
            }
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/tester-wise
// @desc    Get tester-wise execution statistics
// @access  Private
router.get('/tester-wise', protect, async (req, res) => {
    try {
        const { project } = req.query;
        let projectFilter = {};

        if (project) {
            projectFilter = { project };
        }

        // Aggregate executions by tester
        const testerStats = await Execution.aggregate([
            { $match: projectFilter },
            {
                $group: {
                    _id: '$executedBy',
                    totalExecutions: { $sum: 1 },
                    passCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] }
                    },
                    failCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] }
                    },
                    blockedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    userName: '$user.name',
                    userEmail: '$user.email',
                    totalExecutions: 1,
                    passCount: 1,
                    failCount: 1,
                    blockedCount: 1,
                    passRate: {
                        $multiply: [
                            { $divide: ['$passCount', '$totalExecutions'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { totalExecutions: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: testerStats
        });
    } catch (error) {
        console.error('Get tester-wise stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tester-wise statistics',
            error: error.message
        });
    }
});

// @route   GET /api/dashboard/release-wise
// @desc    Get release-wise statistics
// @access  Private
router.get('/release-wise', protect, async (req, res) => {
    try {
        const { project } = req.query;
        let projectFilter = {};

        if (project) {
            projectFilter = { project };
        }

        // Get test plans with execution statistics
        const testPlans = await TestPlan.find(projectFilter)
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        const releaseStats = await Promise.all(
            testPlans.map(async (testPlan) => {
                const executions = await Execution.find({ testPlan: testPlan._id });
                const passCount = executions.filter(e => e.status === 'pass').length;
                const failCount = executions.filter(e => e.status === 'fail').length;
                const total = executions.length;

                return {
                    planId: testPlan.planId,
                    name: testPlan.name,
                    releaseVersion: testPlan.releaseVersion,
                    totalExecutions: total,
                    passCount,
                    failCount,
                    passRate: total > 0 ? ((passCount / total) * 100).toFixed(2) : 0,
                    status: testPlan.status
                };
            })
        );

        res.status(200).json({
            success: true,
            data: releaseStats
        });
    } catch (error) {
        console.error('Get release-wise stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching release-wise statistics',
            error: error.message
        });
    }
});

module.exports = router;
