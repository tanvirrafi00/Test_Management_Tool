const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const TestPlan = require('../models/TestPlan');
const Execution = require('../models/Execution');
const Defect = require('../models/Defect');
const { protect } = require('../middlewares/auth');
const csv = require('csv-writer').createObjectCsvStringifier;
const PDFDocument = require('pdfkit');

// Helper to get project filter based on user role
const getProjectFilter = async (user, projectId = null) => {
    let filter = {};
    if (projectId) {
        filter.project = projectId;
    }

    // Role-based filtering logic
    if (user.role === 'admin' || user.role === 'product_manager') {
        // Full visibility (PM is read-only in UI, but API allows full read)
        return filter;
    }

    if (user.role === 'developer') {
        // Developers only see defects assigned to them
        const assignedDefects = await Defect.find({ assignedTo: user._id }).select('project');
        const projectIds = [...new Set(assignedDefects.map(d => d.project))];

        if (projectId) {
            if (!projectIds.some(id => id.toString() === projectId.toString())) {
                throw new Error('Access denied to this project');
            }
        } else {
            filter.project = { $in: projectIds };
        }
        return filter;
    }

    // QA Roles (Lead, Engineer, Automation)
    const userProjects = await Project.find({ teamMembers: user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    if (projectId) {
        if (!projectIds.some(id => id.toString() === projectId.toString())) {
            throw new Error('Access denied to this project');
        }
    } else {
        filter.project = { $in: projectIds };
    }

    return filter;
};

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const { project } = req.query;
        let projectFilter = {};

        try {
            projectFilter = await getProjectFilter(req.user, project);
        } catch (err) {
            return res.status(403).json({ success: false, message: err.message });
        }

        // Get total counts
        const totalProjectsCount = (req.user.role === 'admin' || req.user.role === 'product_manager') && !project
            ? await Project.countDocuments()
            : (projectFilter.project?.$in?.length || (project ? 1 : 0));

        // Developers don't see Test Cases, Plans, or Executions
        const isDeveloper = req.user.role === 'developer';
        const totalTestCases = isDeveloper ? 0 : await TestCase.countDocuments(projectFilter);
        const totalTestPlans = isDeveloper ? 0 : await TestPlan.countDocuments(projectFilter);
        const totalExecutions = isDeveloper ? 0 : await Execution.countDocuments(projectFilter);

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

        // Populate matrices if project is specified
        let testPlanMatrix = [];
        let defectSeverityMatrix = [];

        if (project) {
            // Test Plan Matrix
            const testPlans = await TestPlan.find({ project });
            testPlanMatrix = await Promise.all(testPlans.map(async (plan) => {
                const planFilter = { testPlan: plan._id };
                const total = plan.testCases?.length || 0;

                // Get execution stats for this plan
                const executed = await Execution.countDocuments(planFilter);
                const pass = await Execution.countDocuments({ ...planFilter, status: 'pass' });
                const fail = await Execution.countDocuments({ ...planFilter, status: 'fail' });
                const progress = total > 0 ? ((executed / total) * 100).toFixed(0) : 0;

                return {
                    id: plan._id,
                    name: plan.name,
                    total,
                    executed,
                    pass,
                    fail,
                    progress: parseInt(progress)
                };
            }));

            // Defect Severity Matrix
            const severities = ['critical', 'major', 'minor', 'trivial'];
            defectSeverityMatrix = await Promise.all(severities.map(async (sev) => {
                const sevFilter = { project, severity: sev };
                return {
                    severity: sev,
                    open: await Defect.countDocuments({ ...sevFilter, status: 'open' }),
                    inProgress: await Defect.countDocuments({ ...sevFilter, status: 'in_progress' }),
                    fixed: await Defect.countDocuments({ ...sevFilter, status: 'fixed' }),
                    closed: await Defect.countDocuments({ ...sevFilter, status: 'closed' })
                };
            }));
        }

        // Execution Trend (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendExecutions = await Execution.aggregate([
            {
                $match: {
                    ...projectFilter,
                    executionDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$executionDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const trendData = trendExecutions.map(item => ({
            date: item._id,
            count: item.count
        }));

        res.status(200).json({
            success: true,
            data: {
                totalProjects: totalProjectsCount,
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
                executionProgress: parseFloat(executionProgress),
                testPlanMatrix,
                defectSeverityMatrix,
                trendData
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

// @route   GET /api/dashboard/projects
// @desc    Get projects with dashboard metrics
// @access  Private
router.get('/projects', protect, async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'admin' || req.user.role === 'product_manager') {
            projects = await Project.find();
        } else if (req.user.role === 'developer') {
            const assignedDefects = await Defect.find({ assignedTo: req.user._id }).select('project');
            const projectIds = [...new Set(assignedDefects.map(d => d.project))];
            projects = await Project.find({ _id: { $in: projectIds } });
        } else {
            projects = await Project.find({ teamMembers: req.user._id });
        }

        const projectStats = await Promise.all(projects.map(async (project) => {
            const filter = { project: project._id };
            const totalTestCases = await TestCase.countDocuments(filter);
            const totalTestPlans = await TestPlan.countDocuments(filter);

            const passCount = await Execution.countDocuments({ ...filter, status: 'pass' });
            const failCount = await Execution.countDocuments({ ...filter, status: 'fail' });
            const blockedCount = await Execution.countDocuments({ ...filter, status: 'blocked' });
            const retestCount = await Execution.countDocuments({ ...filter, status: 'retest' });
            const totalExecuted = passCount + failCount + blockedCount + retestCount;

            const openDefects = await Defect.countDocuments({
                project: project._id,
                status: { $in: ['open', 'in_progress'] }
            });

            return {
                _id: project._id,
                name: project.name,
                totalTestCases,
                executedTestCases: totalExecuted,
                totalTestPlans,
                openDefects,
                progress: totalTestCases > 0 ? ((totalExecuted / totalTestCases) * 100).toFixed(2) : 0
            };
        }));

        res.status(200).json({
            success: true,
            data: projectStats
        });
    } catch (error) {
        console.error('Get dashboard projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard projects',
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
        if (req.user.role === 'product_manager') {
            return res.status(200).json({ success: true, data: { recentTestCases: [], recentExecutions: [], recentDefects: [] } });
        }

        let tcFilter = {};
        let exeFilter = {};
        let defectFilter = {};

        if (req.user.role === 'admin') {
            // Full visibility
        } else if (req.user.role === 'qa_lead') {
            // Leads see activity for their projects
            const userProjects = await Project.find({ teamMembers: req.user._id }).select('_id');
            const projectIds = userProjects.map(p => p._id);
            tcFilter = { project: { $in: projectIds } };
            exeFilter = { project: { $in: projectIds } };
            defectFilter = { project: { $in: projectIds } };
        } else if (req.user.role === 'developer') {
            // Developers see activity for their assigned defects
            tcFilter = { _id: null }; // No test case activity
            exeFilter = { _id: null }; // No execution activity
            defectFilter = { assignedTo: req.user._id };
        } else {
            // QA Engineer/Automation see their own items
            tcFilter = { createdBy: req.user._id };
            exeFilter = { executedBy: req.user._id };
            defectFilter = { createdBy: req.user._id };
        }

        // Get recent test cases
        const recentTestCases = await TestCase.find(tcFilter)
            .populate('project', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get recent executions
        const recentExecutions = await Execution.find(exeFilter)
            .populate('project', 'name')
            .populate('testCase', 'title')
            .populate('executedBy', 'name')
            .sort({ executionDate: -1 })
            .limit(parseInt(limit));

        // Get recent defects
        const recentDefects = await Defect.find(defectFilter)
            .populate('project', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

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

// @route   GET /api/dashboard/reports/:reportType/:format
// @desc    Export reports in CSV or PDF format
// @access  Private
router.get('/reports/:reportType/:format', protect, async (req, res) => {
    try {
        const { reportType, format } = req.params;
        const { project } = req.query;

        let projectFilter = {};
        if (project) {
            projectFilter = { project };
        }

        let data = [];
        let filename = `${reportType}-report`;

        switch (reportType) {
            case 'execution-summary':
                const executions = await Execution.find(projectFilter)
                    .populate('testCase', 'title')
                    .populate('testPlan', 'name')
                    .populate('executedBy', 'name')
                    .sort({ executionDate: -1 });

                data = executions.map(ex => ({
                    'Execution ID': ex.executionId,
                    'Test Case': ex.testCase?.title || 'N/A',
                    'Test Plan': ex.testPlan?.name || 'N/A',
                    'Status': ex.status,
                    'Executed By': ex.executedBy?.name || 'N/A',
                    'Date': new Date(ex.executionDate).toLocaleDateString(),
                    'Comments': ex.comments || ''
                }));
                filename = 'execution-summary';
                break;

            case 'tester-wise':
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

                data = testerStats.map(stat => ({
                    'Tester Name': stat.userName,
                    'Email': stat.userEmail,
                    'Total Executions': stat.totalExecutions,
                    'Passed': stat.passCount,
                    'Failed': stat.failCount,
                    'Blocked': stat.blockedCount,
                    'Pass Rate (%)': stat.passRate.toFixed(2)
                }));
                filename = 'tester-wise-report';
                break;

            case 'release-wise':
                const testPlans = await TestPlan.find(projectFilter)
                    .populate('project', 'name')
                    .sort({ createdAt: -1 });

                const releaseData = await Promise.all(
                    testPlans.map(async (testPlan) => {
                        const planExecutions = await Execution.find({ testPlan: testPlan._id });
                        const passCount = planExecutions.filter(e => e.status === 'pass').length;
                        const failCount = planExecutions.filter(e => e.status === 'fail').length;
                        const total = planExecutions.length;

                        return {
                            planId: testPlan.planId,
                            name: testPlan.name,
                            releaseVersion: testPlan.releaseVersion || 'N/A',
                            totalExecutions: total,
                            passCount,
                            failCount,
                            passRate: total > 0 ? ((passCount / total) * 100).toFixed(2) : '0.00',
                            status: testPlan.status
                        };
                    })
                );

                data = releaseData.map(item => ({
                    'Plan ID': item.planId,
                    'Plan Name': item.name,
                    'Release Version': item.releaseVersion,
                    'Total Executions': item.totalExecutions,
                    'Passed': item.passCount,
                    'Failed': item.failCount,
                    'Pass Rate (%)': item.passRate,
                    'Status': item.status
                }));
                filename = 'release-wise-report';
                break;

            case 'defect-summary':
                const defects = await Defect.find(projectFilter)
                    .populate('project', 'name')
                    .populate('createdBy', 'name')
                    .populate('assignedTo', 'name')
                    .sort({ createdAt: -1 });

                data = defects.map(defect => ({
                    'Defect ID': defect.defectId,
                    'Title': defect.title,
                    'Severity': defect.severity,
                    'Priority': defect.priority,
                    'Status': defect.status,
                    'Created By': defect.createdBy?.name || 'N/A',
                    'Assigned To': defect.assignedTo?.name || 'N/A',
                    'Created Date': new Date(defect.createdAt).toLocaleDateString()
                }));
                filename = 'defect-summary';
                break;

            case 'test-coverage':
                const coverageData = await TestCase.find(projectFilter)
                    .populate('project', 'name');

                const coverageExecutions = await Execution.find(projectFilter);
                const executedTestCaseIds = new Set(coverageExecutions.map(e => e.testCase.toString()));

                data = coverageData.map(tc => ({
                    'Test Case ID': tc.testCaseId,
                    'Title': tc.title,
                    'Project': tc.project?.name || 'N/A',
                    'Priority': tc.priority,
                    'Status': tc.status,
                    'Executed': executedTestCaseIds.has(tc._id.toString()) ? 'Yes' : 'No'
                }));
                filename = 'test-coverage';
                break;

            case 'activity':
                const recentTestCases = await TestCase.find(projectFilter)
                    .populate('project', 'name')
                    .populate('createdBy', 'name')
                    .sort({ createdAt: -1 })
                    .limit(20);

                const recentDefects = await Defect.find(projectFilter)
                    .populate('project', 'name')
                    .populate('createdBy', 'name')
                    .sort({ createdAt: -1 })
                    .limit(20);

                const activityData = [
                    ...recentTestCases.map(tc => ({
                        'Type': 'Test Case',
                        'ID': tc.testCaseId,
                        'Title': tc.title,
                        'Action': 'Created',
                        'User': tc.createdBy?.name || 'N/A',
                        'Date': new Date(tc.createdAt).toLocaleString()
                    })),
                    ...recentDefects.map(d => ({
                        'Type': 'Defect',
                        'ID': d.defectId,
                        'Title': d.title,
                        'Action': 'Created',
                        'User': d.createdBy?.name || 'N/A',
                        'Date': new Date(d.createdAt).toLocaleString()
                    }))
                ].sort((a, b) => new Date(b.Date) - new Date(a.Date));

                data = activityData;
                filename = 'activity-report';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        if (format === 'csv') {
            // Generate CSV
            const csvWriter = require('csv-writer').createObjectCsvStringifier({
                header: Object.keys(data[0] || {}).map(key => ({ id: key, title: key }))
            });

            const csvString = csvWriter.stringifyRecords(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            res.send(csvString);
        } else if (format === 'pdf') {
            // Generate PDF
            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
                res.send(pdfBuffer);
            });

            // Add content to PDF
            doc.fontSize(20).text(`${reportType.replace(/-/g, ' ').toUpperCase()} Report`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Simple table representation
            const headers = Object.keys(data[0] || {});
            const tableWidth = 500;
            const cellWidth = tableWidth / headers.length;
            const startX = 50;
            let y = 150;

            // Draw headers
            headers.forEach((header, index) => {
                doc.fontSize(8).text(header, startX + (index * cellWidth), y, { width: cellWidth - 5 });
            });
            y += 20;

            // Draw data rows
            data.forEach(row => {
                headers.forEach((header, index) => {
                    doc.fontSize(8).text(String(row[header] || ''), startX + (index * cellWidth), y, { width: cellWidth - 5 });
                });
                y += 15;
            });

            doc.end();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid format. Use csv or pdf'
            });
        }
    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting report',
            error: error.message
        });
    }
});

module.exports = router;
