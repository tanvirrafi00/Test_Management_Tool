const Project = require('../models/Project');
const Defect = require('../models/Defect');
const TestCase = require('../models/TestCase');
const TestPlan = require('../models/TestPlan');
const Execution = require('../models/Execution');

/**
 * Get project filter based on user role
 * @param {Object} user - User object
 * @param {String} projectId - Optional project ID
 * @returns {Object} - Filter object for MongoDB queries
 */
const getProjectFilter = async (user, projectId = null) => {
    let filter = {};
    if (projectId) {
        filter.project = projectId;
    }

    // Admin and Product Manager have full visibility
    if (user.role === 'admin' || user.role === 'product_manager') {
        return filter;
    }

    // Developers only see defects assigned to them
    if (user.role === 'developer') {
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

    // QA Roles (Lead, Engineer, Automation) see projects they're assigned to
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

/**
 * Get test case filter based on user role
 * @param {Object} user - User object
 * @param {Object} baseFilter - Base filter object
 * @returns {Object} - Filter object for MongoDB queries
 */
const getTestCaseFilter = async (user, baseFilter = {}) => {
    const filter = { ...baseFilter };

    // Admin and Product Manager have full visibility
    if (user.role === 'admin' || user.role === 'product_manager') {
        return filter;
    }

    // Developers don't see test cases
    if (user.role === 'developer') {
        return { _id: null }; // Empty filter to return no results
    }

    // QA Lead sees all test cases in their projects
    if (user.role === 'qa_lead') {
        const userProjects = await Project.find({ teamMembers: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        if (filter.project) {
            if (!projectIds.some(id => id.toString() === filter.project.toString())) {
                throw new Error('Access denied to this project');
            }
        } else {
            filter.project = { $in: projectIds };
        }
        return filter;
    }

    // QA Engineer sees test cases assigned to them or created by them
    if (user.role === 'qa_engineer') {
        filter.$or = [
            { assignedTo: user._id },
            { createdBy: user._id }
        ];
        return filter;
    }

    // QA Automation Engineer sees automated test cases assigned to them or created by them
    if (user.role === 'qa_automation') {
        filter.$or = [
            { assignedTo: user._id },
            { createdBy: user._id }
        ];
        return filter;
    }

    return filter;
};

/**
 * Get test plan filter based on user role
 * @param {Object} user - User object
 * @param {Object} baseFilter - Base filter object
 * @returns {Object} - Filter object for MongoDB queries
 */
const getTestPlanFilter = async (user, baseFilter = {}) => {
    const filter = { ...baseFilter };

    // Admin and Product Manager have full visibility
    if (user.role === 'admin' || user.role === 'product_manager') {
        return filter;
    }

    // Developers don't see test plans
    if (user.role === 'developer') {
        return { _id: null };
    }

    // QA Lead sees all test plans in their projects
    if (user.role === 'qa_lead') {
        const userProjects = await Project.find({ teamMembers: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        if (filter.project) {
            if (!projectIds.some(id => id.toString() === filter.project.toString())) {
                throw new Error('Access denied to this project');
            }
        } else {
            filter.project = { $in: projectIds };
        }
        return filter;
    }

    // QA Engineer sees test plans they're assigned to
    if (user.role === 'qa_engineer') {
        filter.assignedTesters = user._id;
        return filter;
    }

    // QA Automation Engineer sees test plans they're assigned to
    if (user.role === 'qa_automation') {
        filter.assignedTesters = user._id;
        return filter;
    }

    return filter;
};

/**
 * Get execution filter based on user role
 * @param {Object} user - User object
 * @param {Object} baseFilter - Base filter object
 * @returns {Object} - Filter object for MongoDB queries
 */
const getExecutionFilter = async (user, baseFilter = {}) => {
    const filter = { ...baseFilter };

    // Admin and Product Manager have full visibility
    if (user.role === 'admin' || user.role === 'product_manager') {
        return filter;
    }

    // Developers don't see executions
    if (user.role === 'developer') {
        return { _id: null };
    }

    // QA Lead sees all executions in their projects
    if (user.role === 'qa_lead') {
        const userProjects = await Project.find({ teamMembers: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        // Get test cases from user's projects
        const testCases = await TestCase.find({ project: { $in: projectIds } }).select('_id');
        const testCaseIds = testCases.map(tc => tc._id);

        // Get test plans from user's projects
        const testPlans = await TestPlan.find({ project: { $in: projectIds } }).select('_id');
        const testPlanIds = testPlans.map(tp => tp._id);

        filter.$or = [
            { testCase: { $in: testCaseIds } },
            { testPlan: { $in: testPlanIds } }
        ];
        return filter;
    }

    // QA Engineer sees executions they performed or test cases assigned to them
    if (user.role === 'qa_engineer') {
        filter.$or = [
            { executedBy: user._id }
        ];
        return filter;
    }

    // QA Automation Engineer sees executions they performed or automated test cases
    if (user.role === 'qa_automation') {
        filter.$or = [
            { executedBy: user._id }
        ];
        return filter;
    }

    return filter;
};

/**
 * Get defect filter based on user role
 * @param {Object} user - User object
 * @param {Object} baseFilter - Base filter object
 * @returns {Object} - Filter object for MongoDB queries
 */
const getDefectFilter = async (user, baseFilter = {}) => {
    const filter = { ...baseFilter };

    // Admin and Product Manager have full visibility
    if (user.role === 'admin' || user.role === 'product_manager') {
        return filter;
    }

    // Developer sees defects assigned to them
    if (user.role === 'developer') {
        filter.assignedTo = user._id;
        return filter;
    }

    // QA Lead sees all defects in their projects
    if (user.role === 'qa_lead') {
        const userProjects = await Project.find({ teamMembers: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        if (filter.project) {
            if (!projectIds.some(id => id.toString() === filter.project.toString())) {
                throw new Error('Access denied to this project');
            }
        } else {
            filter.project = { $in: projectIds };
        }
        return filter;
    }

    // QA Engineer sees defects they created or assigned to them
    if (user.role === 'qa_engineer') {
        filter.$or = [
            { createdBy: user._id },
            { assignedTo: user._id }
        ];
        return filter;
    }

    // QA Automation Engineer sees defects they created or assigned to them
    if (user.role === 'qa_automation') {
        filter.$or = [
            { createdBy: user._id },
            { assignedTo: user._id }
        ];
        return filter;
    }

    return filter;
};

module.exports = {
    getProjectFilter,
    getTestCaseFilter,
    getTestPlanFilter,
    getExecutionFilter,
    getDefectFilter
};
