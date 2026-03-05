'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { defectsAPI, projectsAPI, testCasesAPI, executionsAPI, authAPI } from '../../lib/api';
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
    AlertTriangle,
    Calendar,
    User,
    FileText,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    MessageSquare,
    Send
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
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
        if (!currentUser || !defect) return false;
        // Admins and QA Leads have full edit rights
        if (['admin', 'qa_lead'].includes(currentUser.role)) return true;
        // QA Engineers and Automation can edit defects they created
        const creatorId = defect.createdBy?._id || defect.createdBy;
        if (['qa_engineer', 'qa_automation'].includes(currentUser.role) && creatorId === currentUser._id) return true;
        // Developers can edit (to update status/comments) if assigned
        const assignedId = defect.assignedTo?._id || defect.assignedTo;
        if (currentUser.role === 'developer' && assignedId === currentUser._id) return true;
        return false;
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

    // Add comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setIsSubmittingComment(true);
            const response = await defectsAPI.addComment(selectedDefect._id, { text: newComment });
            setSelectedDefect(response.data.data);
            setNewComment('');
            // Update the defects list to show the new comment count
            fetchDefects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setIsSubmittingComment(false);
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

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'fixed':
            case 'closed': return 'success';
            case 'open': return 'danger';
            case 'in_progress':
            case 'retest': return 'warning';
            default: return 'secondary';
        }
    };

    const getSeverityVariant = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'danger';
            case 'major': return 'warning';
            case 'minor': return 'info';
            case 'trivial': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPriorityVariant = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'secondary';
            default: return 'secondary';
        }
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
                    {currentUser?.role !== 'product_manager' && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Defect
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
                <Card className="p-5 border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-2xl">
                    <div className="flex flex-col lg:flex-row gap-5">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search defects by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-[2]">
                            <Select
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                                options={[
                                    { label: 'All Projects', value: 'all' },
                                    ...projects.map(p => ({ label: p.name, value: p._id }))
                                ]}
                                className="rounded-xl h-[42px]"
                            />
                            <Select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                options={[
                                    { label: 'All Severities', value: 'all' },
                                    { label: 'Trivial', value: 'trivial' },
                                    { label: 'Minor', value: 'minor' },
                                    { label: 'Major', value: 'major' },
                                    { label: 'Critical', value: 'critical' }
                                ]}
                                className="rounded-xl h-[42px]"
                            />
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Open', value: 'open' },
                                    { label: 'In Progress', value: 'in_progress' },
                                    { label: 'Fixed', value: 'fixed' },
                                    { label: 'Retest', value: 'retest' },
                                    { label: 'Closed', value: 'closed' }
                                ]}
                                className="rounded-xl h-[42px]"
                            />
                            <Select
                                value={assignedFilter}
                                onChange={(e) => setAssignedFilter(e.target.value)}
                                options={[
                                    { label: 'All Assignees', value: 'all' },
                                    ...users.map(u => ({ label: u.name, value: u._id }))
                                ]}
                                className="rounded-xl h-[42px]"
                            />
                        </div>
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
                                                {(['admin', 'qa_lead'].includes(currentUser?.role) || (currentUser?.role === 'developer' && defect.assignedTo === currentUser?._id)) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openAssignModal(defect)}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                                {(['admin', 'qa_lead'].includes(currentUser?.role) || (currentUser?.role === 'developer' && defect.assignedTo === currentUser?._id)) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openStatusModal(defect)}
                                                    >
                                                        Update Status
                                                    </Button>
                                                )}
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
                                            {currentUser?.role === 'admin' && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => openDeleteModal(defect)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
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
                                            {(['admin', 'qa_lead'].includes(currentUser?.role) || (currentUser?.role === 'developer' && defect.assignedTo === currentUser?._id)) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openAssignModal(defect)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Defect Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                title="Create New Defect"
                size="3xl"
            >
                <form onSubmit={handleCreateDefect} className="space-y-6">
                    <Input
                        label="Defect Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={formErrors.title}
                        placeholder="e.g., Login button not responding on mobile"
                        className="rounded-xl"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide a clear and concise description of the issue..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning-500" />
                            Steps to Reproduce
                        </label>
                        <textarea
                            name="stepsToReproduce"
                            value={formData.stepsToReproduce}
                            onChange={handleInputChange}
                            placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400 font-mono"
                        />
                        {formErrors.stepsToReproduce && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.stepsToReproduce}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold text-success-700">
                                Expected Result
                            </label>
                            <textarea
                                name="expectedResult"
                                value={formData.expectedResult}
                                onChange={handleInputChange}
                                placeholder="What should have happened?"
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold text-danger-700">
                                Actual Result
                            </label>
                            <textarea
                                name="actualResult"
                                value={formData.actualResult}
                                onChange={handleInputChange}
                                placeholder="What actually happened?"
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Project"
                            name="projectId"
                            value={formData.projectId}
                            onChange={handleInputChange}
                            error={formErrors.projectId}
                            options={[
                                { label: 'Select project', value: '' },
                                ...projects.map(p => ({ label: p.name, value: p._id }))
                            ]}
                            className="rounded-xl"
                        />
                        <Select
                            label="Severity"
                            name="severity"
                            value={formData.severity}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Trivial', value: 'trivial' },
                                { label: 'Minor', value: 'minor' },
                                { label: 'Major', value: 'major' },
                                { label: 'Critical', value: 'critical' }
                            ]}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                                { label: 'Critical', value: 'critical' }
                            ]}
                            className="rounded-xl"
                        />
                        <Select
                            label="Assign To"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Unassigned', value: '' },
                                ...users.map(u => ({ label: u.name, value: u._id }))
                            ]}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Test Case (Optional)"
                            name="testCaseId"
                            value={formData.testCaseId}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Select test case', value: '' },
                                ...testCases.map(tc => ({ label: tc.title, value: tc._id }))
                            ]}
                            className="rounded-xl"
                        />
                        <Select
                            label="Execution (Optional)"
                            name="executionId"
                            value={formData.executionId}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Select execution', value: '' },
                                ...executions.map(ex => ({
                                    label: `${getTestCaseTitle(ex.testCaseId)} - ${new Date(ex.executedAt).toLocaleDateString()}`,
                                    value: ex._id
                                }))
                            ]}
                            className="rounded-xl"
                        />
                    </div>

                    {formErrors.submit && (
                        <div className="p-3 bg-danger-50 text-danger-600 text-sm font-bold rounded-xl border border-danger-100 italic">
                            {formErrors.submit}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowCreateModal(false); resetForm(); }}
                            className="flex-1 rounded-xl h-11"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-500/20 font-semibold">
                            Create Defect
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Defect Modal */}
            <Modal
                isOpen={showEditModal && !!selectedDefect}
                onClose={() => { setShowEditModal(false); resetForm(); setSelectedDefect(null); }}
                title="Edit Defect"
                size="3xl"
            >
                <form onSubmit={handleEditDefect} className="space-y-6">
                    <Input
                        label="Defect Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={formErrors.title}
                        className="rounded-xl"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning-500" />
                            Steps to Reproduce
                        </label>
                        <textarea
                            name="stepsToReproduce"
                            value={formData.stepsToReproduce}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400 font-mono"
                        />
                        {formErrors.stepsToReproduce && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.stepsToReproduce}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold text-success-700">
                                Expected Result
                            </label>
                            <textarea
                                name="expectedResult"
                                value={formData.expectedResult}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold text-danger-700">
                                Actual Result
                            </label>
                            <textarea
                                name="actualResult"
                                value={formData.actualResult}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Project"
                            name="projectId"
                            value={formData.projectId}
                            onChange={handleInputChange}
                            error={formErrors.projectId}
                            options={[
                                { label: 'Select project', value: '' },
                                ...projects.map(p => ({ label: p.name, value: p._id }))
                            ]}
                            className="rounded-xl"
                        />
                        <Select
                            label="Severity"
                            name="severity"
                            value={formData.severity}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Trivial', value: 'trivial' },
                                { label: 'Minor', value: 'minor' },
                                { label: 'Major', value: 'major' },
                                { label: 'Critical', value: 'critical' }
                            ]}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                                { label: 'Critical', value: 'critical' }
                            ]}
                            className="rounded-xl"
                        />
                        <Select
                            label="Assign To"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleInputChange}
                            options={[
                                { label: 'Unassigned', value: '' },
                                ...users.map(u => ({ label: u.name, value: u._id }))
                            ]}
                            className="rounded-xl"
                        />
                    </div>

                    {formErrors.submit && (
                        <div className="p-3 bg-danger-50 text-danger-600 text-sm font-bold rounded-xl border border-danger-100 italic">
                            {formErrors.submit}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowEditModal(false); resetForm(); setSelectedDefect(null); }}
                            className="flex-1 rounded-xl h-11"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-500/20 font-semibold">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!selectedDefect}
                onClose={() => { setShowDeleteModal(false); setSelectedDefect(null); }}
                title="Delete Defect"
                size="md"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-danger-50 rounded-full">
                        <Trash2 className="h-8 w-8 text-danger-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-gray-900">"{selectedDefect?.title}"</span>? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowDeleteModal(false); setSelectedDefect(null); }}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteDefect}
                            className="flex-1 rounded-xl shadow-lg shadow-danger-500/20 font-semibold"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Assign Modal */}
            <Modal
                isOpen={showAssignModal && !!selectedDefect}
                onClose={() => { setShowAssignModal(false); setSelectedDefect(null); }}
                title="Assign Defect"
                size="md"
            >
                <div className="space-y-6">
                    <Select
                        label="Select Team Member"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        options={[
                            { label: 'Unassigned', value: '' },
                            ...users.map(u => ({ label: u.name, value: u._id }))
                        ]}
                        className="rounded-xl"
                    />
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowAssignModal(false); setSelectedDefect(null); }}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignDefect}
                            className="flex-1 rounded-xl shadow-lg shadow-primary-500/20 font-semibold"
                        >
                            Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                isOpen={showStatusModal && !!selectedDefect}
                onClose={() => { setShowStatusModal(false); setSelectedDefect(null); }}
                title="Update Status"
                size="md"
            >
                <div className="space-y-6">
                    <div className="space-y-3">
                        {statusFlow.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status }))}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${formData.status === status
                                    ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                                    : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${formData.status === status ? 'bg-primary-500 animate-pulse' : 'bg-gray-300'}`} />
                                    <span className={`font-bold capitalize ${formData.status === status ? 'text-primary-900' : 'text-gray-600'}`}>
                                        {status?.replace('_', ' ')}
                                    </span>
                                </div>
                                <Badge variant={getStatusVariant(status)} className="opacity-80 group-hover:opacity-100">
                                    {status?.replace('_', ' ')}
                                </Badge>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowStatusModal(false); setSelectedDefect(null); }}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            className="flex-1 rounded-xl shadow-lg shadow-primary-500/20 font-semibold"
                        >
                            Update Status
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal && !!selectedDefect}
                onClose={() => { setShowDetailsModal(false); setSelectedDefect(null); }}
                title="Defect Details"
                size="4xl"
            >
                <div className="space-y-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={getStatusVariant(selectedDefect?.status)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm">
                            {selectedDefect?.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getSeverityVariant(selectedDefect?.severity)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm">
                            {selectedDefect?.severity}
                        </Badge>
                        <Badge variant={getPriorityVariant(selectedDefect?.priority)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm">
                            {selectedDefect?.priority}
                        </Badge>
                        <span className="text-xs text-gray-400 font-medium ml-auto">
                            Created {new Date(selectedDefect?.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <FileText className="h-4 w-4 text-primary-500" />
                                    Description
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedDefect?.description}
                                </p>
                            </div>

                            <div className="bg-warning-50/30 p-5 rounded-2xl border border-warning-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <AlertTriangle className="h-4 w-4 text-warning-500" />
                                    Steps to Reproduce
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono bg-white/50 p-3 rounded-xl border border-warning-100/50">
                                    {selectedDefect?.stepsToReproduce}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-success-50/30 p-5 rounded-2xl border border-success-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-success-700">Expected Result</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedDefect?.expectedResult}</p>
                                </div>
                                <div className="bg-danger-50/30 p-5 rounded-2xl border border-danger-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-danger-700">Actual Result</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedDefect?.actualResult}</p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Project</span>
                                    <span className="text-gray-900 font-bold">{getProjectName(selectedDefect?.projectId)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Assigned To</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 uppercase">
                                            {getUserName(selectedDefect?.assignedTo).charAt(0)}
                                        </div>
                                        <span className="text-gray-900 font-bold">{getUserName(selectedDefect?.assignedTo)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                                <MessageSquare className="h-4 w-4 text-primary-500" />
                                Comments ({selectedDefect?.comments?.length || 0})
                            </h3>
                        </div>

                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {selectedDefect?.comments && selectedDefect.comments.length > 0 ? (
                                selectedDefect.comments.map((comment, index) => (
                                    <div key={index} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900">{comment.user?.name || 'Unknown User'}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {comment.text}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-sm text-gray-400 italic bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                                    No comments yet.
                                </p>
                            )}
                        </div>

                        {currentUser && currentUser.role !== 'product_manager' && (
                            <form onSubmit={handleAddComment} className="relative mt-4">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={
                                        currentUser.role === 'developer' && selectedDefect?.assignedTo?._id !== currentUser._id
                                            ? "Only assigned developers can comment"
                                            : "Add a comment..."
                                    }
                                    disabled={isSubmittingComment || (currentUser.role === 'developer' && selectedDefect?.assignedTo?._id !== currentUser._id)}
                                    rows={2}
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400 bg-white shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment || !newComment.trim() || (currentUser.role === 'developer' && selectedDefect?.assignedTo?._id !== currentUser._id)}
                                    className="absolute right-3 bottom-3 p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20"
                                >
                                    {isSubmittingComment ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowDetailsModal(false); setSelectedDefect(null); }}
                            className="flex-1 rounded-xl h-11"
                        >
                            Close
                        </Button>
                        {canEditDefect(selectedDefect) && (
                            <Button
                                onClick={() => openEditModal(selectedDefect)}
                                className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-500/20 font-semibold"
                            >
                                Edit Defect
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
