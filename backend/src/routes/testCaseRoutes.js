const express = require('express');
const router = express.Router();
const TestCase = require('../models/TestCase');
const { protect, authorize, restrictViewer } = require('../middlewares/auth');
const { validateTestCaseBelongsToProject } = require('../middlewares/validateDataIntegrity');
const { getTestCaseFilter } = require('../utils/roleBasedFilter');

// @route   GET /api/testcases
// @desc    Get all test cases
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { project, feature, priority, status, search, includeDeprecated } = req.query;

    let query = {};

    // Apply role-based filtering
    try {
      query = await getTestCaseFilter(req.user, {});
    } catch (err) {
      return res.status(403).json({ success: false, message: err.message });
    }

    if (project) query.project = project;
    if (feature) query.feature = feature;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    // Filter out deprecated test cases unless explicitly requested
    if (!status && includeDeprecated !== 'true') {
      query.status = { $ne: 'deprecated' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const testCases = await TestCase.find(query)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test cases',
      error: error.message
    });
  }
});

// @route   GET /api/testcases/:id
// @desc    Get single test case
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Check if user has access to this test case based on role
    try {
      const filter = await getTestCaseFilter(req.user, {});
      if (filter._id === null) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to test cases'
        });
      }

      // For QA roles, check if they have access to this specific test case
      if (req.user.role !== 'admin' && req.user.role !== 'product_manager') {
        if (req.user.role === 'qa_lead') {
          // QA Lead can access test cases in their projects
          const Project = require('../models/Project');
          const userProjects = await Project.find({ teamMembers: req.user._id }).select('_id');
          const projectIds = userProjects.map(p => p._id);
          if (!projectIds.some(id => id.toString() === testCase.project.toString())) {
            return res.status(403).json({
              success: false,
              message: 'Access denied to this test case'
            });
          }
        } else if (req.user.role === 'qa_engineer' || req.user.role === 'qa_automation') {
          // QA Engineers can only access test cases assigned to them or created by them
          if (testCase.assignedTo?.toString() !== req.user.id && testCase.createdBy?.toString() !== req.user.id) {
            return res.status(403).json({
              success: false,
              message: 'Access denied to this test case'
            });
          }
        } else if (req.user.role === 'developer') {
          return res.status(403).json({
            success: false,
            message: 'Developers cannot access test cases'
          });
        }
      }
    } catch (err) {
      return res.status(403).json({ success: false, message: err.message });
    }

    res.status(200).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test case',
      error: error.message
    });
  }
});

// @route   POST /api/testcases
// @desc    Create new test case
// @access  Private (QA Lead, QA Engineer)
router.post('/', protect, restrictViewer, authorize('admin', 'qa_lead', 'qa_engineer'), validateTestCaseBelongsToProject, async (req, res) => {
  try {
    const {
      title,
      description,
      preconditions,
      testSteps,
      priority,
      severity,
      status,
      tags,
      project,
      feature,
      assignedTo
    } = req.body;

    // Feature is now required
    if (!feature) {
      return res.status(400).json({
        success: false,
        message: 'Feature is required'
      });
    }

    const testCase = await TestCase.create({
      title,
      description,
      preconditions,
      testSteps,
      priority,
      severity,
      status,
      tags,
      project,
      feature,
      createdBy: req.user.id,
      assignedTo
    });

    const populatedTestCase = await TestCase.findById(testCase._id)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Test case created successfully',
      data: populatedTestCase
    });
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test case',
      error: error.message
    });
  }
});

// @route   PUT /api/testcases/:id
// @desc    Update test case
// @access  Private (QA Lead, QA Engineer)
router.put('/:id', protect, restrictViewer, authorize('admin', 'qa_lead', 'qa_engineer'), validateTestCaseBelongsToProject, async (req, res) => {
  try {
    const testCase = req.testCase || await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    const {
      title,
      description,
      preconditions,
      testSteps,
      priority,
      severity,
      status,
      tags,
      assignedTo
    } = req.body;

    if (title) testCase.title = title;
    if (description !== undefined) testCase.description = description;
    if (preconditions !== undefined) testCase.preconditions = preconditions;
    if (testSteps) testCase.testSteps = testSteps;
    if (priority) testCase.priority = priority;
    if (severity) testCase.severity = severity;
    if (status) testCase.status = status;
    if (tags) testCase.tags = tags;
    if (assignedTo !== undefined) testCase.assignedTo = assignedTo;

    // Increment version
    testCase.version += 1;

    await testCase.save();

    const updatedTestCase = await TestCase.findById(testCase._id)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Test case updated successfully',
      data: updatedTestCase
    });
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating test case',
      error: error.message
    });
  }
});

// @route   DELETE /api/testcases/:id
// @desc    Soft delete test case (mark as deprecated)
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, restrictViewer, authorize('admin', 'qa_lead'), validateTestCaseBelongsToProject, async (req, res) => {
  try {
    const testCase = req.testCase || await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Soft delete: change status to 'deprecated' instead of deleting
    testCase.status = 'deprecated';
    await testCase.save();

    res.status(200).json({
      success: true,
      message: 'Test case deprecated successfully'
    });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deprecating test case',
      error: error.message
    });
  }
});

// @route   PUT /api/testcases/:id/restore
// @desc    Restore deprecated test case
// @access  Private (Admin, QA Lead)
router.put('/:id/restore', protect, restrictViewer, authorize('admin', 'qa_lead'), validateTestCaseBelongsToProject, async (req, res) => {
  try {
    const testCase = req.testCase || await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Restore: change status back to 'ready'
    testCase.status = 'ready';
    await testCase.save();

    const restoredTestCase = await TestCase.findById(testCase._id)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Test case restored successfully',
      data: restoredTestCase
    });
  } catch (error) {
    console.error('Restore test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring test case',
      error: error.message
    });
  }
});

// @route   POST /api/testcases/:id/clone
// @desc    Clone test case
// @access  Private (QA Lead, QA Engineer)
router.post('/:id/clone', protect, restrictViewer, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
  try {
    const originalTestCase = await TestCase.findById(req.params.id);

    if (!originalTestCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    const clonedTestCase = await TestCase.create({
      title: `${originalTestCase.title} (Copy)`,
      description: originalTestCase.description,
      preconditions: originalTestCase.preconditions,
      testSteps: originalTestCase.testSteps,
      priority: originalTestCase.priority,
      severity: originalTestCase.severity,
      status: 'draft',
      tags: originalTestCase.tags,
      project: originalTestCase.project,
      createdBy: req.user.id,
      assignedTo: null
    });

    const populatedTestCase = await TestCase.findById(clonedTestCase._id)
      .populate('project', 'name')
      .populate('feature', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Test case cloned successfully',
      data: populatedTestCase
    });
  } catch (error) {
    console.error('Clone test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cloning test case',
      error: error.message
    });
  }
});

module.exports = router;
