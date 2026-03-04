'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { defectsAPI, projectsAPI, testCasesAPI, executionsAPI, authAPI } from '../../lib/api';
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
    AlertTriangle,
    Calendar,
    User,
    FileText,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight
} from 'lucide-react';

export default function Defects() {
    const [defects, setDefects] = useState([]);
    const [projects, setProjects] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [executions, setExecutions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assignedFilter, setAssignedFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedDefect, setSelectedDefect] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedDefects, setExpandedDefects] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
        severity: 'minor',
        priority: 'medium',
        projectId: '',
        testCaseId: '',
        executionId: '',
        assignedTo: '',
    });

    const [formErrors, setFormErrors] = useState({});

    // Status flow
    const statusFlow = ['open', 'in_progress', 'fixed', 'retest', 'closed'];

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
        fetchDefects();
        fetchProjects();
        fetchTestCases();
        fetchExecutions();
        fetchUsers();
    }, []);

    const fetchDefects = async () => {
        try {
            setLoading(true);
            const response = await defectsAPI.getAll();
            setDefects(response.data.data || []);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch defects');
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

    const fetchTestCases = async () => {
        try {
            const response = await testCasesAPI.getAll();
            setTestCases(response.data.data || []);
        } catch (error) {
            console.error('Error fetching test cases:', error);
        }
    };

    const fetchExecutions = async () => {
        try {
            const response = await executionsAPI.getAll();
            setExecutions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching executions:', error);
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

    // Filter defects
    const filteredDefects = defects.filter(defect => {
        const matchesSearch = defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            defect.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter === 'all' || defect.projectId === projectFilter;
        const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
        const matchesAssigned = assignedFilter === 'all' || defect.assignedTo === assignedFilter;
        return matchesSearch && matchesProject && matchesSeverity && matchesStatus && matchesAssigned;
    });

    // Check if user can edit/delete defect
    const canEditDefect = (defect) => {
        if (!currentUser) return false;
        return currentUser.role === 'Admin' || defect.createdBy === currentUser._id;
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
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
        if (!formData.stepsToReproduce.trim()) {
            errors.stepsToReproduce = 'Steps to reproduce are required';
        }
        if (!formData.projectId) {
            errors.projectId = 'Project is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create defect
    const handleCreateDefect = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await defectsAPI.create(formData);
            setShowCreateModal(false);
            resetForm();
            fetchDefects();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create defect' });
        }
    };

    // Edit defect
    const handleEditDefect = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await defectsAPI.update(selectedDefect._id, formData);
            setShowEditModal(false);
            resetForm();
            setSelectedDefect(null);
            fetchDefects();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to update defect' });
        }
    };

    // Delete defect
    const handleDeleteDefect = async () => {
        try {
            await defectsAPI.delete(selectedDefect._id);
            setShowDeleteModal(false);
            setSelectedDefect(null);
            fetchDefects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete defect');
        }
    };

    // Assign defect
    const handleAssignDefect = async () => {
        try {
            await defectsAPI.assign(selectedDefect._id, { assignedTo: formData.assignedTo });
            setShowAssignModal(false);
            setSelectedDefect(null);
            fetchDefects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to assign defect');
        }
    };

    // Update defect status
    const handleUpdateStatus = async () => {
        try {
            await defectsAPI.updateStatus(selectedDefect._id, { status: formData.status });
            setShowStatusModal(false);
            setSelectedDefect(null);
            fetchDefects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update defect status');
        }
    };

    // Open edit modal
    const openEditModal = (defect) => {
        setSelectedDefect(defect);
        setFormData({
            title: defect.title,
            description: defect.description || '',
            stepsToReproduce: defect.stepsToReproduce || '',
            expectedResult: defect.expectedResult || '',
            actualResult: defect.actualResult || '',
            severity: defect.severity || 'minor',
            priority: defect.priority || 'medium',
            projectId: defect.project?._id || defect.projectId || '',
            testCaseId: defect.linkedTestCase?._id || defect.testCaseId || '',
            executionId: defect.linkedExecution?._id || defect.executionId || '',
            assignedTo: defect.assignedTo?._id || defect.assignedTo || '',
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (defect) => {
        setSelectedDefect(defect);
        setShowDeleteModal(true);
    };

    // Open details modal
    const openDetailsModal = (defect) => {
        setSelectedDefect(defect);
        setShowDetailsModal(true);
    };

    // Open assign modal
    const openAssignModal = (defect) => {
        setSelectedDefect(defect);
        setFormData(prev => ({ ...prev, assignedTo: defect.assignedTo || '' }));
        setShowAssignModal(true);
    };

    // Open status modal
    const openStatusModal = (defect) => {
        setSelectedDefect(defect);
        setFormData(prev => ({ ...prev, status: defect.status || 'open' }));
        setShowStatusModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            stepsToReproduce: '',
            expectedResult: '',
            actualResult: '',
            severity: 'minor',
            priority: 'medium',
            projectId: '',
            testCaseId: '',
            executionId: '',
            assignedTo: '',
        });
        setFormErrors({});
    };

    // Toggle expanded state
    const toggleExpanded = (defectId) => {
        setExpandedDefects(prev => ({
            ...prev,
            [defectId]: !prev[defectId]
        }));
    };

    // Get project name
    const getProjectName = (projectId) => {
        const project = projects.find(p => p._id === projectId);
        return project?.name || 'Unknown';
    };

    // Get test case title
    const getTestCaseTitle = (testCaseId) => {
        const testCase = testCases.find(tc => tc._id === testCaseId);
        return testCase?.title || 'Unknown';
    };

    // Get execution details
    const getExecutionDetails = (executionId) => {
        const execution = executions.find(e => e._id === executionId);
        return execution;
    };

    // Get user name
    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user?.name || 'Unassigned';
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            low: { variant: 'default', label: 'Low' },
            medium: { variant: 'info', label: 'Medium' },
            high: { variant: 'warning', label: 'High' },
            critical: { variant: 'danger', label: 'Critical' },
        };
        const config = priorityConfig[priority] || priorityConfig.medium;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // Get severity badge
    const getSeverityBadge = (severity) => {
        const severityConfig = {
            trivial: { variant: 'default', label: 'Trivial' },
            minor: { variant: 'info', label: 'Minor' },
            major: { variant: 'warning', label: 'Major' },
            critical: { variant: 'danger', label: 'Critical' },
        };
        const config = severityConfig[severity] || severityConfig.minor;
        return (
            <Badge variant={config.variant}>
                {config.label}
            </Badge>
        );
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            open: { variant: 'default', label: 'Open' },
            in_progress: { variant: 'info', label: 'In Progress' },
            fixed: { variant: 'success', label: 'Fixed' },
            retest: { variant: 'warning', label: 'Retest' },
            closed: { variant: 'default', label: 'Closed' },
        };
        const config = statusConfig[status] || statusConfig.open;
        return (
            <Badge variant={config.variant}>
                {config.label}
            </Badge>
        );
    };

    // Get next status in flow
    const getNextStatus = (currentStatus) => {
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex < statusFlow.length - 1) {
            return statusFlow[currentIndex + 1];
        }
        return currentStatus;
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
                        <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
                        <p className="text-gray-600 mt-1">Track and manage defects</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Defect
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
                                placeholder="Search defects..."
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
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Severities</option>
                            <option value="trivial">Trivial</option>
                            <option value="minor">Minor</option>
                            <option value="major">Major</option>
                            <option value="critical">Critical</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="fixed">Fixed</option>
                            <option value="retest">Retest</option>
                            <option value="closed">Closed</option>
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

                {/* Defects List */}
                {filteredDefects.length === 0 ? (
                    <Card className="p-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm || projectFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all' || assignedFilter !== 'all'
                                ? 'No defects match your search criteria'
                                : 'No defects yet. Create your first defect to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredDefects.map((defect) => (
                            <Card key={defect._id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {defect.title}
                                            </h3>
                                            {getSeverityBadge(defect.severity)}
                                            {getPriorityBadge(defect.priority)}
                                            {getStatusBadge(defect.status)}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {defect.description || 'No description'}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <FileText className="h-4 w-4 mr-1" />
                                                {getProjectName(defect.projectId)}
                                            </span>
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                {getUserName(defect.assignedTo)}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(defect.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleExpanded(defect._id)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            {expandedDefects[defect._id] ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedDefects[defect._id] && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="space-y-3">
                                            {defect.stepsToReproduce && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Steps to Reproduce</h4>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                                                        {defect.stepsToReproduce}
                                                    </p>
                                                </div>
                                            )}
                                            {(defect.expectedResult || defect.actualResult) && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {defect.expectedResult && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Expected Result</h4>
                                                            <p className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg">{defect.expectedResult}</p>
                                                        </div>
                                                    )}
                                                    {defect.actualResult && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Actual Result</h4>
                                                            <p className="text-sm text-gray-600 bg-red-50 p-2 rounded-lg">{defect.actualResult}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {defect.testCaseId && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Test Case</h4>
                                                    <p className="text-sm text-gray-600">{getTestCaseTitle(defect.testCaseId)}</p>
                                                </div>
                                            )}
                                            {defect.executionId && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Execution</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {getExecutionDetails(defect.executionId)?.executedAt
                                                            ? new Date(getExecutionDetails(defect.executionId).executedAt).toLocaleString()
                                                            : 'Unknown'}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openDetailsModal(defect)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openAssignModal(defect)}
                                                >
                                                    Assign
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openStatusModal(defect)}
                                                >
                                                    Update Status
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                    {canEditDefect(defect) && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(defect)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(defect)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    {!expandedDefects[defect._id] && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleExpanded(defect._id)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openAssignModal(defect)}
                                            >
                                                Assign
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Defect Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Defect</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDefect} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                error={formErrors.title}
                                placeholder="Enter defect title"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter defect description"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Steps to Reproduce
                                </label>
                                <textarea
                                    name="stepsToReproduce"
                                    value={formData.stepsToReproduce}
                                    onChange={handleInputChange}
                                    placeholder="Enter steps to reproduce the defect"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.stepsToReproduce && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.stepsToReproduce}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Result</label>
                                    <textarea
                                        name="expectedResult"
                                        value={formData.expectedResult}
                                        onChange={handleInputChange}
                                        placeholder="What was expected to happen"
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Result</label>
                                    <textarea
                                        name="actualResult"
                                        value={formData.actualResult}
                                        onChange={handleInputChange}
                                        placeholder="What actually happened"
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                                    <select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="trivial">Trivial</option>
                                        <option value="minor">Minor</option>
                                        <option value="major">Major</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
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
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Case (Optional)</label>
                                    <select
                                        name="testCaseId"
                                        value={formData.testCaseId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select test case</option>
                                        {testCases.map(testCase => (
                                            <option key={testCase._id} value={testCase._id}>{testCase.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Execution (Optional)</label>
                                    <select
                                        name="executionId"
                                        value={formData.executionId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select execution</option>
                                        {executions.map(execution => (
                                            <option key={execution._id} value={execution._id}>
                                                {getTestCaseTitle(execution.testCaseId)} - {new Date(execution.executedAt).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
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
                                    Create Defect
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Defect Modal */}
            {showEditModal && selectedDefect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Defect</h2>
                            <button
                                onClick={() => { setShowEditModal(false); resetForm(); setSelectedDefect(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditDefect} className="max-h-[70vh] overflow-y-auto pr-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                error={formErrors.title}
                                placeholder="Enter defect title"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter defect description"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Steps to Reproduce
                                </label>
                                <textarea
                                    name="stepsToReproduce"
                                    value={formData.stepsToReproduce}
                                    onChange={handleInputChange}
                                    placeholder="Enter steps to reproduce the defect"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.stepsToReproduce && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.stepsToReproduce}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Result</label>
                                    <textarea
                                        name="expectedResult"
                                        value={formData.expectedResult}
                                        onChange={handleInputChange}
                                        placeholder="What was expected to happen"
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Result</label>
                                    <textarea
                                        name="actualResult"
                                        value={formData.actualResult}
                                        onChange={handleInputChange}
                                        placeholder="What actually happened"
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                                    <select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="trivial">Trivial</option>
                                        <option value="minor">Minor</option>
                                        <option value="major">Major</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
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
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Case (Optional)</label>
                                    <select
                                        name="testCaseId"
                                        value={formData.testCaseId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select test case</option>
                                        {testCases.map(testCase => (
                                            <option key={testCase._id} value={testCase._id}>{testCase.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Execution (Optional)</label>
                                    <select
                                        name="executionId"
                                        value={formData.executionId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select execution</option>
                                        {executions.map(execution => (
                                            <option key={execution._id} value={execution._id}>
                                                {getTestCaseTitle(execution.testCaseId)} - {new Date(execution.executedAt).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
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
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowEditModal(false); resetForm(); setSelectedDefect(null); }}
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
            {showDeleteModal && selectedDefect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Delete Defect</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">
                                Are you sure you want to delete the defect <strong>"{selectedDefect.title}"</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action will soft delete the defect and all associated data.
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
                            <Button variant="danger" onClick={handleDeleteDefect} className="flex-1">
                                Delete Defect
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && selectedDefect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Assign Defect</h2>
                            <button
                                onClick={() => { setShowAssignModal(false); setSelectedDefect(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Assign defect <strong>"{selectedDefect.title}"</strong> to:
                            </p>
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
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => { setShowAssignModal(false); setSelectedDefect(null); }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAssignDefect} className="flex-1">
                                Assign
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedDefect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Update Defect Status</h2>
                            <button
                                onClick={() => { setShowStatusModal(false); setSelectedDefect(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Update status for defect <strong>"{selectedDefect.title}"</strong>:
                            </p>
                            <div className="space-y-2">
                                {statusFlow.map((status, index) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, status }))}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${formData.status === status
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="font-medium text-gray-900 capitalize">
                                            {status.replace('_', ' ')}
                                        </span>
                                        {getStatusBadge(status)}
                                        {index < statusFlow.length - 1 && (
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => { setShowStatusModal(false); setSelectedDefect(null); }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateStatus} className="flex-1">
                                Update Status
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedDefect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Defect Details</h2>
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedDefect(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedDefect.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {getSeverityBadge(selectedDefect.severity)}
                                        {getPriorityBadge(selectedDefect.priority)}
                                        {getStatusBadge(selectedDefect.status)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedDefect.description || 'No description'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Steps to Reproduce</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                                        {selectedDefect.stepsToReproduce || 'Not provided'}
                                    </p>
                                </div>
                                {(selectedDefect.expectedResult || selectedDefect.actualResult) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Expected Result</h4>
                                            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                                                {selectedDefect.expectedResult || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Actual Result</h4>
                                            <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                                                {selectedDefect.actualResult || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
                                        <p className="text-sm text-gray-600">{getProjectName(selectedDefect.projectId)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h4>
                                        <p className="text-sm text-gray-600">{getUserName(selectedDefect.assignedTo)}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Created At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedDefect.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Updated At</h4>
                                        <p className="text-sm text-gray-600">{new Date(selectedDefect.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                {selectedDefect.testCaseId && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Test Case</h4>
                                        <p className="text-sm text-gray-600">{getTestCaseTitle(selectedDefect.testCaseId)}</p>
                                    </div>
                                )}
                                {selectedDefect.executionId && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Execution</h4>
                                        <p className="text-sm text-gray-600">
                                            {getExecutionDetails(selectedDefect.executionId)?.executedAt
                                                ? new Date(getExecutionDetails(selectedDefect.executionId).executedAt).toLocaleString()
                                                : 'Unknown'}
                                        </p>
                                    </div>
                                )}
                                {/* Status Flow Visualization */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Status Flow</h4>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {statusFlow.map((status, index) => (
                                            <div key={status} className="flex items-center">
                                                <div
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedDefect.status === status
                                                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                                                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                                                        }`}
                                                >
                                                    {status.replace('_', ' ')}
                                                </div>
                                                {index < statusFlow.length - 1 && (
                                                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        ))}
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
