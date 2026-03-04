const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const TestPlan = require('../models/TestPlan');
const Execution = require('../models/Execution');
const Defect = require('../models/Defect');

/**
 * Data Integrity Validation Middleware
 * 
 * This middleware ensures data integrity by validating:
 * - Project membership for users performing operations
 * - Entity relationships (test cases, test plans, executions, defects)
 * - Creator/Admin permissions for sensitive operations
 */

/**
 * Check if user is Admin
 * @param {Object} user - User object from request
 * @returns {boolean}
 */
const isAdmin = (user) => user.role === 'admin';

/**
 * Check if user is creator of an entity
 * @param {Object} entity - Entity with createdBy field
 * @param {string} userId - User ID to check
 * @returns {boolean}
 */
const isCreator = (entity, userId) => {
    return entity.createdBy && entity.createdBy.toString() === userId.toString();
};

/**
 * Validate Project Membership
 * 
 * Checks if the authenticated user is a member of the specified project.
 * Admin users and project creators bypass this check.
 * 
 * @param {string} projectId - Project ID to validate
 * @returns {Function} Middleware function
 */
const validateProjectMembership = (projectId) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const targetProjectId = projectId || req.params.id || req.body.project;

            if (!targetProjectId) {
                return res.status(400).json({
                    success: false,
                    message: 'Project ID is required'
                });
            }

            const project = await Project.findById(targetProjectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Admin users bypass membership check
            if (isAdmin(req.user)) {
                req.project = project;
                return next();
            }

            // Project creator bypass membership check
            if (isCreator(project, userId)) {
                req.project = project;
                return next();
            }

            // Check if user is a team member
            const isMember = project.teamMembers.some(
                member => member.toString() === userId.toString()
            );

            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not a member of this project'
                });
            }

            req.project = project;
            next();
        } catch (error) {
            console.error('Project membership validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error validating project membership',
                error: error.message
            });
        }
    };
};

/**
 * Validate Creator or Admin
 * 
 * Checks if the user is the creator of the entity or an Admin.
 * Used for update/delete operations.
 * 
 * @param {string} entityIdParam - Parameter name containing entity ID
 * @param {string} model - Mongoose model to query
 * @returns {Function} Middleware function
 */
const validateCreatorOrAdmin = (entityIdParam, model) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const entityId = req.params[entityIdParam];

            if (!entityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Entity ID is required'
                });
            }

            const entity = await model.findById(entityId);

            if (!entity) {
                return res.status(404).json({
                    success: false,
                    message: 'Entity not found'
                });
            }

            // Admin users bypass creator check
            if (isAdmin(req.user)) {
                req.entity = entity;
                return next();
            }

            // Check if user is the creator
            if (!isCreator(entity, userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            req.entity = entity;
            next();
        } catch (error) {
            console.error('Creator/Admin validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error validating permissions',
                error: error.message
            });
        }
    };
};

/**
 * Validate Test Case Belongs to Project
 * 
 * Ensures that a test case belongs to the specified project.
 * Also validates that the user is a member of the project.
 * 
 * @returns {Function} Middleware function
 */
const validateTestCaseBelongsToProject = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const testCaseId = req.params.id || req.body.testCase;
        const projectId = req.body.project;

        // For POST operations, validate project membership
        if (req.method === 'POST' && projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Admin users bypass membership check
            if (!isAdmin(req.user) && !isCreator(project, userId)) {
                const isMember = project.teamMembers.some(
                    member => member.toString() === userId.toString()
                );

                if (!isMember) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not a member of this project'
                    });
                }
            }
        }

        // For PUT/DELETE operations, validate test case ownership
        if (req.method !== 'POST' && testCaseId) {
            const testCase = await TestCase.findById(testCaseId);

            if (!testCase) {
                return res.status(404).json({
                    success: false,
                    message: 'Test case not found'
                });
            }

            // Admin users bypass creator check
            if (!isAdmin(req.user) && !isCreator(testCase, userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to modify this test case'
                });
            }

            req.testCase = testCase;
        }

        next();
    } catch (error) {
        console.error('Test case validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating test case',
            error: error.message
        });
    }
};

/**
 * Validate Test Plan Belongs to Project
 * 
 * Ensures that a test plan belongs to the specified project.
 * Also validates that the user is a member of the project.
 * 
 * @returns {Function} Middleware function
 */
const validateTestPlanBelongsToProject = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const testPlanId = req.params.id;
        const projectId = req.body.project;

        // For POST operations, validate project membership
        if (req.method === 'POST' && projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Admin users bypass membership check
            if (!isAdmin(req.user) && !isCreator(project, userId)) {
                const isMember = project.teamMembers.some(
                    member => member.toString() === userId.toString()
                );

                if (!isMember) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not a member of this project'
                    });
                }
            }
        }

        // For PUT/DELETE operations, validate test plan ownership
        if (req.method !== 'POST' && testPlanId) {
            const testPlan = await TestPlan.findById(testPlanId);

            if (!testPlan) {
                return res.status(404).json({
                    success: false,
                    message: 'Test plan not found'
                });
            }

            // Admin users bypass creator check
            if (!isAdmin(req.user) && !isCreator(testPlan, userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to modify this test plan'
                });
            }

            req.testPlan = testPlan;
        }

        // For adding test cases to test plan, validate test cases belong to same project
        if (req.body.testCases && Array.isArray(req.body.testCases)) {
            const testPlan = req.testPlan || await TestPlan.findById(testPlanId);
            
            if (testPlan) {
                const testCases = await TestCase.find({
                    _id: { $in: req.body.testCases }
                });

                const invalidTestCases = testCases.filter(
                    tc => tc.project.toString() !== testPlan.project.toString()
                );

                if (invalidTestCases.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'One or more test cases do not belong to this project'
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error('Test plan validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating test plan',
            error: error.message
        });
    }
};

/**
 * Validate Execution Belongs to Test Plan
 * 
 * Ensures that an execution belongs to the specified test plan.
 * Also validates that the user is assigned as a tester or is an Admin.
 * 
 * @returns {Function} Middleware function
 */
const validateExecutionBelongsToTestPlan = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const executionId = req.params.id;
        const testPlanId = req.body.testPlan;

        // For POST operations, validate test plan and user assignment
        if (req.method === 'POST' && testPlanId) {
            const testPlan = await TestPlan.findById(testPlanId);

            if (!testPlan) {
                return res.status(404).json({
                    success: false,
                    message: 'Test plan not found'
                });
            }

            // Admin users bypass assignment check
            if (!isAdmin(req.user)) {
                const isAssignedTester = testPlan.assignedTesters.some(
                    tester => tester.toString() === userId.toString()
                );

                if (!isAssignedTester) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not assigned as a tester for this test plan'
                    });
                }
            }

            // Validate test case belongs to test plan
            if (req.body.testCase) {
                const testCase = await TestCase.findById(req.body.testCase);

                if (!testCase) {
                    return res.status(404).json({
                        success: false,
                        message: 'Test case not found'
                    });
                }

                const isTestCaseInPlan = testPlan.testCases.some(
                    tc => tc.toString() === req.body.testCase.toString()
                );

                if (!isTestCaseInPlan) {
                    return res.status(400).json({
                        success: false,
                        message: 'Test case does not belong to this test plan'
                    });
                }
            }
        }

        // For PUT/DELETE operations, validate execution ownership
        if (req.method !== 'POST' && executionId) {
            const execution = await Execution.findById(executionId);

            if (!execution) {
                return res.status(404).json({
                    success: false,
                    message: 'Execution not found'
                });
            }

            // Admin users bypass executor check
            if (!isAdmin(req.user)) {
                const isExecutor = execution.executedBy.toString() === userId.toString();

                if (!isExecutor) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to modify this execution'
                    });
                }
            }

            req.execution = execution;
        }

        next();
    } catch (error) {
        console.error('Execution validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating execution',
            error: error.message
        });
    }
};

/**
 * Validate Defect Belongs to Test Case
 * 
 * Ensures that a defect is linked to a valid test case.
 * Also validates that the test case belongs to the same project.
 * 
 * @returns {Function} Middleware function
 */
const validateDefectBelongsToTestCase = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const defectId = req.params.id;
        const linkedTestCaseId = req.body.linkedTestCase;
        const projectId = req.body.project;

        // For POST operations, validate project membership and test case linkage
        if (req.method === 'POST' && projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Admin users bypass membership check
            if (!isAdmin(req.user) && !isCreator(project, userId)) {
                const isMember = project.teamMembers.some(
                    member => member.toString() === userId.toString()
                );

                if (!isMember) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not a member of this project'
                    });
                }
            }

            // Validate test case belongs to project
            if (linkedTestCaseId) {
                const testCase = await TestCase.findById(linkedTestCaseId);

                if (!testCase) {
                    return res.status(404).json({
                        success: false,
                        message: 'Test case not found'
                    });
                }

                if (testCase.project.toString() !== projectId.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Test case does not belong to this project'
                    });
                }
            }
        }

        // For PUT/DELETE operations, validate defect ownership
        if (req.method !== 'POST' && defectId) {
            const defect = await Defect.findById(defectId);

            if (!defect) {
                return res.status(404).json({
                    success: false,
                    message: 'Defect not found'
                });
            }

            // Admin users bypass creator check
            if (!isAdmin(req.user) && !isCreator(defect, userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to modify this defect'
                });
            }

            req.defect = defect;
        }

        next();
    } catch (error) {
        console.error('Defect validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating defect',
            error: error.message
        });
    }
};

/**
 * Validate Test Cases Belong to Same Project
 * 
 * Used when adding test cases to a test plan to ensure
 * all test cases belong to the same project.
 * 
 * @returns {Function} Middleware function
 */
const validateTestCasesBelongToProject = async (req, res, next) => {
    try {
        const testPlanId = req.params.id;
        const testCases = req.body.testCases;

        if (!testCases || !Array.isArray(testCases)) {
            return res.status(400).json({
                success: false,
                message: 'Test cases array is required'
            });
        }

        const testPlan = await TestPlan.findById(testPlanId);

        if (!testPlan) {
            return res.status(404).json({
                success: false,
                message: 'Test plan not found'
            });
        }

        const foundTestCases = await TestCase.find({
            _id: { $in: testCases }
        });

        if (foundTestCases.length !== testCases.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more test cases not found'
            });
        }

        const invalidTestCases = foundTestCases.filter(
            tc => tc.project.toString() !== testPlan.project.toString()
        );

        if (invalidTestCases.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'One or more test cases do not belong to this project'
            });
        }

        next();
    } catch (error) {
        console.error('Test cases project validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating test cases',
            error: error.message
        });
    }
};

module.exports = {
    validateProjectMembership,
    validateCreatorOrAdmin,
    validateTestCaseBelongsToProject,
    validateTestPlanBelongsToProject,
    validateExecutionBelongsToTestPlan,
    validateDefectBelongsToTestCase,
    validateTestCasesBelongToProject,
    isAdmin,
    isCreator
};
