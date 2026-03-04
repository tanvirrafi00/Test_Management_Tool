const express = require('express');
const router = express.Router();
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/testcases
// @desc    Get all test cases
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { project, priority, status, search } = req.query;
    
    let query = {};
    
    if (project) query.project = project;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const testCases = await TestCase.find(query)
      .populate('project', 'name')
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
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
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
router.post('/', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
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
      assignedTo
    } = req.body;

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
      createdBy: req.user.id,
      assignedTo
    });

    const populatedTestCase = await TestCase.findById(testCase._id)
      .populate('project', 'name')
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
router.put('/:id', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
  try {
    let testCase = await TestCase.findById(req.params.id);

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
// @desc    Delete test case
// @access  Private (Admin, QA Lead)
router.delete('/:id', protect, authorize('admin', 'qa_lead'), async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    await testCase.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Test case deleted successfully'
    });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting test case',
      error: error.message
    });
  }
});

// @route   POST /api/testcases/:id/clone
// @desc    Clone test case
// @access  Private (QA Lead, QA Engineer)
router.post('/:id/clone', protect, authorize('admin', 'qa_lead', 'qa_engineer'), async (req, res) => {
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
