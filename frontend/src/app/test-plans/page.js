'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { testPlansAPI, testCasesAPI, projectsAPI, executionsAPI, authAPI } from '../../lib/api';
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
    ClipboardList,
    Calendar,
    FileText,
    Users,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

export default function TestPlans() {
    const [testPlans, setTestPlans] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTestPlan, setSelectedTestPlan] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedTestPlans, setExpandedTestPlans] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        projectId: '',
        releaseVersion: '',
        startDate: '',
        endDate: '',
        testCases: [],
        testers: [],
    });

    const [formErrors, setFormErrors] = useState({});

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
        fetchTestPlans();
        fetchTestCases();
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchTestPlans = async () => {
        try {
            setLoading(true);
            const response = await testPlansAPI.getAll();
            setTestPlans(response.data.data || []);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch test plans');
        } finally {
            setLoading(false);
        }
    };

    const fetchTestCases = async () => {
        try {
            const response = await testCasesAPI.getAll();
            setTestCases(response.data.data || []);
        } catch (error) {
            console.error('Error fetching test cases:', error);
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

    // Fetch executions for a test plan
    const fetchExecutionsForPlan = async (testPlanId) => {
        try {
            const response = await executionsAPI.getByTestPlan(testPlanId);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching executions:', error);
            return [];
        }
    };

    // Filter test plans
    const filteredTestPlans = testPlans.filter(testPlan => {
        const matchesSearch = testPlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testPlan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testPlan.releaseVersion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter === 'all' || testPlan.projectId === projectFilter;
        const matchesStatus = statusFilter === 'all' || testPlan.status === statusFilter;
        return matchesSearch && matchesProject && matchesStatus;
    });

    // Check if user can edit/delete test plan
    const canEditTestPlan = (testPlan) => {
        if (!currentUser) return false;
        return currentUser.role === 'Admin' || testPlan.createdBy === currentUser._id;
    };

    // Calculate progress
    const calculateProgress = (testPlan) => {
        if (!testPlan.testCases || testPlan.testCases.length === 0) return 0;
        const executedCount = testPlan.testCases.filter(tc => tc.executionStatus && tc.executionStatus !== 'not_run').length;
        return Math.round((executedCount / testPlan.testCases.length) * 100);
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Handle test case selection
    const handleTestCaseToggle = (testCaseId) => {
        setFormData(prev => ({
            ...prev,
            testCases: prev.testCases.includes(testCaseId)
                ? prev.testCases.filter(id => id !== testCaseId)
                : [...prev.testCases, testCaseId]
        }));
    };

    // Handle tester selection
    const handleTesterToggle = (userId) => {
        setFormData(prev => ({
            ...prev,
            testers: prev.testers.includes(userId)
                ? prev.testers.filter(id => id !== userId)
                : [...prev.testers, userId]
        }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Test plan name is required';
        }
        if (!formData.projectId) {
            errors.projectId = 'Project is required';
        }
        if (!formData.releaseVersion.trim()) {
            errors.releaseVersion = 'Release version is required';
        }
        if (!formData.startDate) {
            errors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
            errors.endDate = 'End date is required';
        }
        if (formData.testCases.length === 0) {
            errors.testCases = 'At least one test case is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create test plan
    const handleCreateTestPlan = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await testPlansAPI.create(formData);
            setShowCreateModal(false);
            resetForm();
            fetchTestPlans();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create test plan' });
        }
    };

    // Edit test plan
    const handleEditTestPlan = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await testPlansAPI.update(selectedTestPlan._id, formData);
            setShowEditModal(false);
            resetForm();
            setSelectedTestPlan(null);
            fetchTestPlans();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to update test plan' });
        }
    };

    // Delete test plan
    const handleDeleteTestPlan = async () => {
        try {
            await testPlansAPI.delete(selectedTestPlan._id);
            setShowDeleteModal(false);
            setSelectedTestPlan(null);
            fetchTestPlans();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete test plan');
        }
    };

    // Open edit modal
    const openEditModal = async (testPlan) => {
        setSelectedTestPlan(testPlan);
        setFormData({
            name: testPlan.name,
            description: testPlan.description || '',
            projectId: testPlan.projectId,
            releaseVersion: testPlan.releaseVersion || '',
            startDate: testPlan.startDate?.split('T')[0] || '',
            endDate: testPlan.endDate?.split('T')[0] || '',
            testCases: testPlan.testCases?.map(tc => tc._id || tc) || [],
            testers: testPlan.testers?.map(t => t._id || t) || [],
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (testPlan) => {
        setSelectedTestPlan(testPlan);
        setShowDeleteModal(true);
    };

    // Open details modal
    const openDetailsModal = (testPlan) => {
        setSelectedTestPlan(testPlan);
        setShowDetailsModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            projectId: '',
            releaseVersion: '',
            startDate: '',
            endDate: '',
            testCases: [],
            testers: [],
        });
        setFormErrors({});
    };

    // Toggle expanded state
    const toggleExpanded = (testPlanId) => {
        setExpandedTestPlans(prev => ({
            ...prev,
            [testPlanId]: !prev[testPlanId]
        }));
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p._id === projectId);
        return project?.name || 'Unknown';
    };

    // Get test case details
    const getTestCaseDetails = (testCaseId) => {
        return testCases.find(tc => tc._id === testCaseId);
    };

    // Get execution status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            not_run: { variant: 'default', icon: Clock, label: 'Not Run' },
            pass: { variant: 'success', icon: CheckCircle2, label: 'Pass' },
            fail: { variant: 'danger', icon: XCircle, label: 'Fail' },
            blocked: { variant: 'warning', icon: XCircle, label: 'Blocked' },
            retest: { variant: 'info', icon: Clock, label: 'Retest' },
        };
        const config = statusConfig[status] || statusConfig.not_run;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
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
                        <h1 className="text-2xl font-bold text-gray-900">Test Plans</h1>
                        <p className="text-gray-600 mt-1">Manage your test plans</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Test Plan
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
                                placeholder="Search test plans..."
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
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </Card>

                {/* Test Plans List */}
                {filteredTestPlans.length === 0 ? (
                    <Card className="p-12 text-center">
                        <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all'
                                ? 'No test plans match your search criteria'
                                : 'No test plans yet. Create your first test plan to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredTestPlans.map((testPlan) => {
                            const progress = calculateProgress(testPlan);
                            return (
                                <Card key={testPlan._id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {testPlan.name}
                                                </h3>
                                                <Badge variant={testPlan.status}>{testPlan.status}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {testPlan.description || 'No description'}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    {getProjectName(testPlan.projectId)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {testPlan.releaseVersion}
                                                </span>
                                                <span className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    {testPlan.testCases?.length || 0} test cases
                                                </span>
                                                <span className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {testPlan.testers?.length || 0} testers
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleExpanded(testPlan._id)}
                                                className="text-gray-400 hover:text-gray-600 p-1"
                                            >
                                                {expandedTestPlans[testPlan._id] ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progress</span>
                                            <span className="text-sm text-gray-600">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedTestPlans[testPlan._id] && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Start Date:</span>
                                                    <span className="ml-2 text-gray-700">
                                                        {testPlan.startDate ? new Date(testPlan.startDate).toLocaleDateString() : 'Not set'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">End Date:</span>
                                                    <span className="ml-2 text-gray-700">
                                                        {testPlan.endDate ? new Date(testPlan.endDate).toLocaleDateString() : 'Not set'}
                                                    </span>
                                                </div>
                                            </div>

                                            {testPlan.testCases && testPlan.testCases.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases</h4>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                        {testPlan.testCases.map((testCase) => {
                                                            const tc = typeof testCase === 'object' ? testCase : getTestCaseDetails(testCase);
                                                            if (!tc) return null;
                                                            return (
                                                                <div key={tc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900">{tc.title}</p>
                                                                        <p className="text-xs text-gray-500">{tc.priority}</p>
                                                                    </div>
                                                                    {getStatusBadge(tc.executionStatus || 'not_run')}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openDetailsModal(testPlan)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                        {canEditTestPlan(testPlan) && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(testPlan)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => openDeleteModal(testPlan)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {!expandedTestPlans[testPlan._id] && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleExpanded(testPlan._id)}
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Test Plan Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Test Plan</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTestPlan} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Test Plan Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={formErrors.name}
                                placeholder="Enter test plan name"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter test plan description"
                                    rows={3}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Release Version</label>
                                    <Input
                                        name="releaseVersion"
                                        value={formData.releaseVersion}
                                        onChange={handleInputChange}
                                        error={formErrors.releaseVersion}
                                        placeholder="e.g., v1.0.0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.startDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    {formErrors.endDate && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.endDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Test Cases Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Cases ({formData.testCases.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                    {testCases.length === 0 ? (
                                        <p className="text-sm text-gray-500 p-2">No test cases available</p>
                                    ) : (
                                        testCases.map(testCase => (
                                            <label key={testCase._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.testCases.includes(testCase._id)}
                                                    onChange={() => handleTestCaseToggle(testCase._id)}
                                                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{testCase.title}</p>
                                                    <p className="text-xs text-gray-500">{testCase.priority} - {testCase.status}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {formErrors.testCases && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.testCases}</p>
                                )}
                            </div>

                            {/* Testers Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Testers ({formData.testers.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                    {users.length === 0 ? (
                                        <p className="text-sm text-gray-500 p-2">No users available</p>
                                    ) : (
                                        users.map(user => (
                                            <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.testers.includes(user._id)}
                                                    onChange={() => handleTesterToggle(user._id)}
                                                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
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
                                    Create Test Plan
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Test Plan Modal */}
            {showEditModal && selectedTestPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Test Plan</h2>
                            <button
                                onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestPlan(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditTestPlan} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Test Plan Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={formErrors.name}
                                placeholder="Enter test plan name"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter test plan description"
                                    rows={3}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Release Version</label>
                                    <Input
                                        name="releaseVersion"
                                        value={formData.releaseVersion}
                                        onChange={handleInputChange}
                                        error={formErrors.releaseVersion}
                                        placeholder="e.g., v1.0.0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.startDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    {formErrors.endDate && (
                                        <p className="mt-1 text-sm text-danger-600">{formErrors.endDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Test Cases Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Cases ({formData.testCases.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                    {testCases.length === 0 ? (
                                        <p className="text-sm text-gray-500 p-2">No test cases available</p>
                                    ) : (
                                        testCases.map(testCase => (
                                            <label key={testCase._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.testCases.includes(testCase._id)}
                                                    onChange={() => handleTestCaseToggle(testCase._id)}
                                                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{testCase.title}</p>
                                                    <p className="text-xs text-gray-500">{testCase.priority} - {testCase.status}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {formErrors.testCases && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.testCases}</p>
                                )}
                            </div>

                            {/* Testers Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Testers ({formData.testers.length} selected)
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                    {users.length === 0 ? (
                                        <p className="text-sm text-gray-500 p-2">No users available</p>
                                    ) : (
                                        users.map(user => (
                                            <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.testers.includes(user._id)}
                                                    onChange={() => handleTesterToggle(user._id)}
                                                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestPlan(null); }}
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
            {showDeleteModal && selectedTestPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Delete Test Plan</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">
                                Are you sure you want to delete the test plan <strong>"{selectedTestPlan.name}"</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action will soft delete the test plan and all associated data.
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
                            <Button variant="danger" onClick={handleDeleteTestPlan} className="flex-1">
                                Delete Test Plan
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedTestPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Test Plan Details</h2>
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedTestPlan(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTestPlan.name}</h3>
                                    <Badge variant={selectedTestPlan.status}>{selectedTestPlan.status}</Badge>
                                </div>
                                {selectedTestPlan.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                        <p className="text-sm text-gray-600">{selectedTestPlan.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
                                        <p className="text-sm text-gray-600">{getProjectName(selectedTestPlan.projectId)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Release Version</h4>
                                        <p className="text-sm text-gray-600">{selectedTestPlan.releaseVersion || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
                                        <p className="text-sm text-gray-600">
                                            {selectedTestPlan.startDate ? new Date(selectedTestPlan.startDate).toLocaleDateString() : 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">End Date</h4>
                                        <p className="text-sm text-gray-600">
                                            {selectedTestPlan.endDate ? new Date(selectedTestPlan.endDate).toLocaleDateString() : 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Progress</h4>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">
                                            {selectedTestPlan.testCases?.filter(tc => tc.executionStatus && tc.executionStatus !== 'not_run').length || 0} / {selectedTestPlan.testCases?.length || 0} executed
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">{calculateProgress(selectedTestPlan)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${calculateProgress(selectedTestPlan)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Test Cases */}
                                {selectedTestPlan.testCases && selectedTestPlan.testCases.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases</h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {selectedTestPlan.testCases.map((testCase) => {
                                                const tc = typeof testCase === 'object' ? testCase : getTestCaseDetails(testCase);
                                                if (!tc) return null;
                                                return (
                                                    <div key={tc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{tc.title}</p>
                                                            <p className="text-xs text-gray-500">{tc.priority}</p>
                                                        </div>
                                                        {getStatusBadge(tc.executionStatus || 'not_run')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Testers */}
                                {selectedTestPlan.testers && selectedTestPlan.testers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Testers</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTestPlan.testers.map((tester) => {
                                                const user = typeof tester === 'object' ? tester : users.find(u => u._id === tester);
                                                if (!user) return null;
                                                return (
                                                    <Badge key={user._id} variant="default">
                                                        {user.name}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Created At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedTestPlan.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Updated At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedTestPlan.updatedAt).toLocaleString()}</p>
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
