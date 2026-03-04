'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { testCasesAPI, projectsAPI, authAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    X,
    Copy,
    FileText,
    User,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function TestCases() {
    const [testCases, setTestCases] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assignedFilter, setAssignedFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        preconditions: '',
        projectId: '',
        priority: 'medium',
        status: 'ready',
        assignedTo: '',
        steps: [{ stepNumber: 1, action: '', expectedResult: '' }],
    });

    const [formErrors, setFormErrors] = useState({});
    const [expandedTestCases, setExpandedTestCases] = useState({});

    // Fetch current user
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI.getMe();
            setCurrentUser(response.data.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    // Fetch data
    useEffect(() => {
        fetchTestCases();
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchTestCases = async () => {
        try {
            setLoading(true);
            const response = await testCasesAPI.getAll();
            setTestCases(response.data.data || []);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch test cases');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Filter test cases
    const filteredTestCases = testCases.filter(testCase => {
        const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testCase.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter === 'all' || testCase.projectId === projectFilter;
        const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || testCase.priority === priorityFilter;
        const matchesAssigned = assignedFilter === 'all' || testCase.assignedTo === assignedFilter;
        return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssigned;
    });

    // Check if user can edit/delete test case
    const canEditTestCase = (testCase) => {
        if (!currentUser) return false;
        return currentUser.role === 'Admin' || testCase.createdBy === currentUser._id;
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Handle step input
    const handleStepChange = (index, field, value) => {
        const newSteps = [...formData.steps];
        newSteps[index][field] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    // Add step
    const addStep = () => {
        const newStep = {
            stepNumber: formData.steps.length + 1,
            action: '',
            expectedResult: ''
        };
        setFormData(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    // Remove step
    const removeStep = (index) => {
        if (formData.steps.length === 1) return;
        const newSteps = formData.steps.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (!formData.projectId) {
            errors.projectId = 'Project is required';
        }
        formData.steps.forEach((step, index) => {
            if (!step.action.trim()) {
                errors[`step-${index}-action`] = 'Step action is required';
            }
            if (!step.expectedResult.trim()) {
                errors[`step-${index}-expected`] = 'Expected result is required';
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create test case
    const handleCreateTestCase = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await testCasesAPI.create(formData);
            setShowCreateModal(false);
            resetForm();
            fetchTestCases();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create test case' });
        }
    };

    // Edit test case
    const handleEditTestCase = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await testCasesAPI.update(selectedTestCase._id, formData);
            setShowEditModal(false);
            resetForm();
            setSelectedTestCase(null);
            fetchTestCases();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to update test case' });
        }
    };

    // Delete test case
    const handleDeleteTestCase = async () => {
        try {
            await testCasesAPI.delete(selectedTestCase._id);
            setShowDeleteModal(false);
            setSelectedTestCase(null);
            fetchTestCases();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete test case');
        }
    };

    // Clone test case
    const handleCloneTestCase = async (testCase) => {
        try {
            await testCasesAPI.clone(testCase._id);
            fetchTestCases();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to clone test case');
        }
    };

    // Open edit modal
    const openEditModal = (testCase) => {
        setSelectedTestCase(testCase);
        setFormData({
            title: testCase.title,
            description: testCase.description || '',
            preconditions: testCase.preconditions || '',
            projectId: testCase.projectId,
            priority: testCase.priority || 'medium',
            status: testCase.status || 'ready',
            assignedTo: testCase.assignedTo || '',
            steps: testCase.steps || [{ stepNumber: 1, action: '', expectedResult: '' }],
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (testCase) => {
        setSelectedTestCase(testCase);
        setShowDeleteModal(true);
    };

    // Open details modal
    const openDetailsModal = (testCase) => {
        setSelectedTestCase(testCase);
        setShowDetailsModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            preconditions: '',
            projectId: '',
            priority: 'medium',
            status: 'ready',
            assignedTo: '',
            steps: [{ stepNumber: 1, action: '', expectedResult: '' }],
        });
        setFormErrors({});
    };

    // Toggle expanded state
    const toggleExpanded = (testCaseId) => {
        setExpandedTestCases(prev => ({
            ...prev,
            [testCaseId]: !prev[testCaseId]
        }));
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p._id === projectId);
        return project?.name || 'Unknown';
    };

    // Get assigned user name
    const getAssignedUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user?.name || 'Unassigned';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
                        <p className="text-gray-600 mt-1">Manage your test cases</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Test Case
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search test cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Projects</option>
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>{project.name}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="ready">Ready</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="deprecated">Deprecated</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                        <select
                            value={assignedFilter}
                            onChange={(e) => setAssignedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Assignees</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Test Cases List */}
                {filteredTestCases.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || assignedFilter !== 'all'
                                ? 'No test cases match your search criteria'
                                : 'No test cases yet. Create your first test case to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredTestCases.map((testCase) => (
                            <Card key={testCase._id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {testCase.title}
                                            </h3>
                                            <Badge variant={testCase.priority}>{testCase.priority}</Badge>
                                            <Badge variant={testCase.status}>{testCase.status}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {testCase.description || 'No description'}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <FileText className="h-4 w-4 mr-1" />
                                                {getProjectName(testCase.projectId)}
                                            </span>
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                {getAssignedUserName(testCase.assignedTo)}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(testCase.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleExpanded(testCase._id)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            {expandedTestCases[testCase._id] ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedTestCases[testCase._id] && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {testCase.preconditions && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Preconditions</h4>
                                                <p className="text-sm text-gray-600">{testCase.preconditions}</p>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Steps</h4>
                                            <div className="space-y-2">
                                                {testCase.steps?.map((step, index) => (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                                {step.stepNumber}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-700">{step.action}</p>
                                                                <p className="text-sm text-gray-500 mt-1">Expected: {step.expectedResult}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openDetailsModal(testCase)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCloneTestCase(testCase)}
                                            >
                                                <Copy className="h-4 w-4 mr-1" />
                                                Clone
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                    {canEditTestCase(testCase) && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(testCase)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(testCase)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    {!expandedTestCases[testCase._id] && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => toggleExpanded(testCase._id)}
                                        >
                                            View Steps
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Test Case Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Test Case</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTestCase} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                error={formErrors.title}
                                placeholder="Enter test case title"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter test case description"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preconditions
                                </label>
                                <textarea
                                    name="preconditions"
                                    value={formData.preconditions}
                                    onChange={handleInputChange}
                                    placeholder="Enter preconditions (optional)"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                                    <select
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(project => (
                                            <option key={project._id} value={project._id}>{project.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.projectId && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.projectId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="ready">Ready</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="deprecated">Deprecated</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                                    <select
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Steps</label>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={addStep}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Step
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.steps.map((step, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Step {step.stepNumber}
                                                </span>
                                                {formData.steps.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStep(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                                                    <textarea
                                                        value={step.action}
                                                        onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                                                        placeholder="Describe the action"
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                                                    />
                                                    {formErrors[`step-${index}-action`] && (
                                                        <p className="mt-1 text-xs text-danger-600">{formErrors[`step-${index}-action`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Expected Result</label>
                                                    <textarea
                                                        value={step.expectedResult}
                                                        onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                                                        placeholder="Describe the expected result"
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                                                    />
                                                    {formErrors[`step-${index}-expected`] && (
                                                        <p className="mt-1 text-xs text-danger-600">{formErrors[`step-${index}-expected`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Create Test Case
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Test Case Modal */}
            {showEditModal && selectedTestCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Test Case</h2>
                            <button
                                onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestCase(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditTestCase} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                error={formErrors.title}
                                placeholder="Enter test case title"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter test case description"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preconditions
                                </label>
                                <textarea
                                    name="preconditions"
                                    value={formData.preconditions}
                                    onChange={handleInputChange}
                                    placeholder="Enter preconditions (optional)"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                                    <select
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(project => (
                                            <option key={project._id} value={project._id}>{project.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.projectId && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.projectId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="ready">Ready</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="deprecated">Deprecated</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                                    <select
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Steps</label>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={addStep}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Step
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {formData.steps.map((step, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Step {step.stepNumber}
                                                </span>
                                                {formData.steps.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStep(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                                                    <textarea
                                                        value={step.action}
                                                        onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                                                        placeholder="Describe the action"
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                                                    />
                                                    {formErrors[`step-${index}-action`] && (
                                                        <p className="mt-1 text-xs text-danger-600">{formErrors[`step-${index}-action`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Expected Result</label>
                                                    <textarea
                                                        value={step.expectedResult}
                                                        onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                                                        placeholder="Describe the expected result"
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                                                    />
                                                    {formErrors[`step-${index}-expected`] && (
                                                        <p className="mt-1 text-xs text-danger-600">{formErrors[`step-${index}-expected`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestCase(null); }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTestCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Delete Test Case</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">
                                Are you sure you want to delete the test case <strong>"{selectedTestCase.title}"</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action will soft delete the test case and all associated data.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDeleteTestCase} className="flex-1">
                                Delete Test Case
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedTestCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Test Case Details</h2>
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedTestCase(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTestCase.title}</h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant={selectedTestCase.priority}>{selectedTestCase.priority}</Badge>
                                        <Badge variant={selectedTestCase.status}>{selectedTestCase.status}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedTestCase.description || 'No description'}</p>
                                </div>
                                {selectedTestCase.preconditions && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Preconditions</h4>
                                        <p className="text-sm text-gray-600">{selectedTestCase.preconditions}</p>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Steps</h4>
                                    <div className="space-y-2">
                                        {selectedTestCase.steps?.map((step, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {step.stepNumber}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-700">{step.action}</p>
                                                        <p className="text-sm text-gray-500 mt-1">Expected: {step.expectedResult}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
                                        <p className="text-sm text-gray-600">{getProjectName(selectedTestCase.projectId)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h4>
                                        <p className="text-sm text-gray-600">{getAssignedUserName(selectedTestCase.assignedTo)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Created At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedTestCase.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Updated At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedTestCase.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
