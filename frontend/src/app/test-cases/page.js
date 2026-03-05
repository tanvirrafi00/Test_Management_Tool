'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { testCasesAPI, projectsAPI, authAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
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
    ChevronUp,
    Folder,
    AlertTriangle,
    Clock
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
        tags: '',
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
        if (!currentUser || !testCase) return false;
        // Admins and all QA roles can edit test cases
        const isQA = ['qa_lead', 'qa_engineer', 'qa_automation'].includes(currentUser.role);
        const isCreator = testCase.createdBy === currentUser._id || testCase.createdBy?._id === currentUser._id;
        return currentUser.role === 'admin' || isQA || (isCreator && ['admin', 'qa_lead', 'qa_engineer', 'qa_automation'].includes(currentUser.role));
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
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                testSteps: formData.steps,
            };
            await testCasesAPI.create(payload);
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
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                testSteps: formData.steps,
            };
            await testCasesAPI.update(selectedTestCase._id, payload);
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
            projectId: testCase.project?._id || testCase.projectId || '',
            priority: testCase.priority || 'medium',
            status: testCase.status || 'ready',
            assignedTo: testCase.assignedTo?._id || testCase.assignedTo || '',
            tags: Array.isArray(testCase.tags) ? testCase.tags.join(', ') : (testCase.tags || ''),
            steps: testCase.testSteps || testCase.steps || [{ stepNumber: 1, action: '', expectedResult: '' }],
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
            tags: '',
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
                    {['admin', 'qa_lead', 'qa_engineer', 'qa_automation'].includes(currentUser?.role) && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Test Case
                        </Button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <Card className="p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search test cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm"
                            />
                        </div>
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        >
                            <option value="all">All Projects</option>
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>{project.name}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
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
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
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
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
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
                    <Card className="p-12 text-center bg-gray-50/50 border-dashed border-2">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || assignedFilter !== 'all'
                                ? 'No test cases match your search criteria'
                                : 'No test cases yet. Create your first test case to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredTestCases.map((testCase) => (
                            <Card key={testCase._id} className="p-5 flex flex-col hover:shadow-md transition-shadow duration-200 border-gray-200/60 overflow-hidden relative">
                                {/* Left strip based on Priority */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${testCase.priority === 'critical' ? 'bg-danger-500' :
                                    testCase.priority === 'high' ? 'bg-warning-500' :
                                        testCase.priority === 'low' ? 'bg-gray-400' :
                                            'bg-blue-400'
                                    }`} />

                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                {testCase.title}
                                            </h3>
                                            <Badge variant={testCase.priority}>{testCase.priority}</Badge>
                                            <Badge variant={testCase.status}>{testCase.status}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                                            {testCase.description || 'No description provided.'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                            <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                <Folder className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
                                                {getProjectName(testCase.projectId || testCase.project?._id)}
                                            </span>
                                            <span className="flex items-center">
                                                <User className="h-3.5 w-3.5 mr-1.5" />
                                                {getAssignedUserName(testCase.assignedTo?._id || testCase.assignedTo)}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                {new Date(testCase.createdAt).toLocaleDateString()}
                                            </span>
                                            {testCase.version && (
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">v{testCase.version}</span>
                                            )}
                                        </div>
                                        {testCase.tags && testCase.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {testCase.tags.map((tag, i) => (
                                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center self-start">
                                        <button
                                            onClick={() => toggleExpanded(testCase._id)}
                                            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
                                            title="Toggle Details"
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
                                    <div className="mt-5 pt-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {testCase.preconditions && (
                                            <div className="mb-5 bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                                                <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1.5">Preconditions</h4>
                                                <p className="text-sm text-blue-900/80">{testCase.preconditions}</p>
                                            </div>
                                        )}
                                        <div className="mb-5">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Steps</h4>
                                            <div className="space-y-3">
                                                {testCase.steps?.map((step, index) => (
                                                    <div key={index} className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-7 h-7 bg-primary-50 text-primary-700 rounded-lg border border-primary-100 flex items-center justify-center text-xs font-bold">
                                                            {step.stepNumber}
                                                        </div>
                                                        <div className="flex-1 bg-gray-50/80 p-3 rounded-lg border border-gray-100/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Action</span>
                                                                <p className="text-sm text-gray-800">{step.action}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Expected Result</span>
                                                                <p className="text-sm text-gray-600">{step.expectedResult}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openDetailsModal(testCase)}
                                                >
                                                    Full Details
                                                </Button>
                                                {currentUser?.role !== 'product_manager' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCloneTestCase(testCase)}
                                                    >
                                                        <Copy className="h-4 w-4 mr-1.5" />
                                                        Clone
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Action Buttons inside Expanded view so they are clean */}
                                            {canEditTestCase(testCase) && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(testCase)}
                                                        className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                                    >
                                                        <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                                                    </Button>
                                                    {currentUser?.role === 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDeleteModal(testCase)}
                                                            className="text-danger-600 hover:text-danger-700 bg-danger-50 hover:bg-danger-100 border border-danger-200"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Action Buttons when not expanded */}
                                {!expandedTestCases[testCase._id] && canEditTestCase(testCase) && (
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(testCase)}
                                            className="px-2"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        {currentUser?.role === 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(testCase)}
                                                className="px-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Test Case Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    {/* Create Test Case Modal */}
                    <Modal
                        isOpen={showCreateModal}
                        onClose={() => { setShowCreateModal(false); resetForm(); }}
                        title="Create New Test Case"
                        size="lg"
                    >
                        <form onSubmit={handleCreateTestCase}>
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
                                    <p className="mt-1 text-sm text-danger-600 font-medium">{formErrors.description}</p>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Project"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleInputChange}
                                    error={formErrors.projectId}
                                    options={projects.map(p => ({ label: p.name, value: p._id }))}
                                    placeholder="Select project"
                                />
                                <Select
                                    label="Priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    options={[
                                        { label: 'Low', value: 'low' },
                                        { label: 'Medium', value: 'medium' },
                                        { label: 'High', value: 'high' },
                                        { label: 'Critical', value: 'critical' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    options={[
                                        { label: 'Ready', value: 'ready' },
                                        { label: 'In Progress', value: 'in_progress' },
                                        { label: 'Completed', value: 'completed' },
                                        { label: 'Deprecated', value: 'deprecated' },
                                    ]}
                                />
                                <Select
                                    label="Assign To"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleInputChange}
                                    options={users.map(u => ({ label: u.name, value: u._id }))}
                                    placeholder="Unassigned"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g. login, regression, smoke"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
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
                                <div className="space-y-4">
                                    {formData.steps.map((step, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                                                    Step {step.stepNumber}
                                                </span>
                                                {formData.steps.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStep(index)}
                                                        className="text-danger-500 hover:text-danger-700 text-sm font-medium transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Action</label>
                                                    <textarea
                                                        value={step.action}
                                                        onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                                                        placeholder="Describe the action"
                                                        rows={2}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none transition-all"
                                                    />
                                                    {formErrors[`step-${index}-action`] && (
                                                        <p className="mt-1 text-xs text-danger-600 font-medium">{formErrors[`step-${index}-action`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Expected Result</label>
                                                    <textarea
                                                        value={step.expectedResult}
                                                        onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                                                        placeholder="Describe the expected result"
                                                        rows={2}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none transition-all"
                                                    />
                                                    {formErrors[`step-${index}-expected`] && (
                                                        <p className="mt-1 text-xs text-danger-600 font-medium">{formErrors[`step-${index}-expected`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="flex-1 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 rounded-xl">
                                    Create Test Case
                                </Button>
                            </div>
                        </form>
                    </Modal>
                </div>
            )}

            {/* Edit Test Case Modal */}
            <Modal
                isOpen={showEditModal && !!selectedTestCase}
                onClose={() => { setShowEditModal(false); resetForm(); setSelectedTestCase(null); }}
                title="Edit Test Case"
                size="lg"
            >
                <form onSubmit={handleEditTestCase}>
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
                            <p className="mt-1 text-sm text-danger-600 font-medium">{formErrors.description}</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Project"
                            name="projectId"
                            value={formData.projectId}
                            onChange={handleInputChange}
                            error={formErrors.projectId}
                            options={projects.map(p => ({ label: p.name, value: p._id }))}
                            placeholder="Select project"
                        />
                        <Select
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                                { label: 'Critical', value: 'critical' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Ready', value: 'ready' },
                                { label: 'In Progress', value: 'in_progress' },
                                { label: 'Completed', value: 'completed' },
                                { label: 'Deprecated', value: 'deprecated' },
                            ]}
                        />
                        <Select
                            label="Assign To"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleInputChange}
                            options={users.map(u => ({ label: u.name, value: u._id }))}
                            placeholder="Unassigned"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="e.g. login, regression, smoke"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
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
                        <div className="space-y-4">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                                            Step {step.stepNumber}
                                        </span>
                                        {formData.steps.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeStep(index)}
                                                className="text-danger-500 hover:text-danger-700 text-sm font-medium transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Action</label>
                                            <textarea
                                                value={step.action}
                                                onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                                                placeholder="Describe the action"
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none transition-all"
                                            />
                                            {formErrors[`step-${index}-action`] && (
                                                <p className="mt-1 text-xs text-danger-600 font-medium">{formErrors[`step-${index}-action`]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Expected Result</label>
                                            <textarea
                                                value={step.expectedResult}
                                                onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                                                placeholder="Describe the expected result"
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none transition-all"
                                            />
                                            {formErrors[`step-${index}-expected`] && (
                                                <p className="mt-1 text-xs text-danger-600 font-medium">{formErrors[`step-${index}-expected`]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {formErrors.submit && (
                        <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestCase(null); }}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!selectedTestCase}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Test Case"
                size="sm"
            >
                <div className="mb-6 mt-2">
                    <p className="text-gray-700 leading-relaxed">
                        Are you sure you want to delete the test case <strong className="text-gray-900">"{selectedTestCase?.title}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-3 p-3 bg-danger-50 rounded-lg border border-danger-100 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-danger-500 flex-shrink-0 mt-0.5" />
                        This action will soft delete the test case and all associated data.
                    </p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteTestCase} className="flex-1 rounded-xl">
                        Delete Test Case
                    </Button>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal && !!selectedTestCase}
                onClose={() => { setShowDetailsModal(false); setSelectedTestCase(null); }}
                title="Test Case Details"
                size="lg"
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{selectedTestCase?.title}</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={selectedTestCase?.priority}>{selectedTestCase?.priority}</Badge>
                            <Badge variant={selectedTestCase?.status}>{selectedTestCase?.status}</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project</h4>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary-500" />
                                {getProjectName(selectedTestCase?.projectId)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned To</h4>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <User className="h-4 w-4 text-primary-500" />
                                {getAssignedUserName(selectedTestCase?.assignedTo)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Created At</h4>
                            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {selectedTestCase && new Date(selectedTestCase.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</h4>
                            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {selectedTestCase && new Date(selectedTestCase.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary-500" />
                                Description
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{selectedTestCase?.description || 'No description provided.'}</p>
                        </div>

                        {selectedTestCase?.preconditions && (
                            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning-500" />
                                    Preconditions
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedTestCase.preconditions}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 px-1">Test Steps</h4>
                        <div className="space-y-3">
                            {selectedTestCase?.steps?.map((step, index) => (
                                <div key={index} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                        {step.stepNumber}
                                    </span>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-semibold text-gray-900 leading-snug">{step.action}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white p-2.5 rounded-xl border border-gray-50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
                                            <span className="font-medium text-gray-400 text-xs uppercase tracking-tight">Expected:</span>
                                            <span className="text-gray-700">{step.expectedResult}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8">
                    <Button
                        variant="secondary"
                        onClick={() => { setShowDetailsModal(false); setSelectedTestCase(null); }}
                        className="flex-1 rounded-xl"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => { setShowDetailsModal(false); openEditModal(selectedTestCase); }}
                        className="flex-1 rounded-xl"
                    >
                        Edit Test Case
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
