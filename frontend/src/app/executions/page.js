'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { executionsAPI, testPlansAPI, testCasesAPI, authAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
    Plus,
    Search,
    Filter,
    X,
    PlayCircle,
    Calendar,
    User,
    FileText,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    RotateCcw,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function Executions() {
    const [executions, setExecutions] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [testPlanFilter, setTestPlanFilter] = useState('all');
    const [testCaseFilter, setTestCaseFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [executedByFilter, setExecutedByFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedExecutions, setExpandedExecutions] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        testPlanId: '',
        testCaseId: '',
        status: 'not_run',
        comment: '',
        createDefect: false,
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
        fetchExecutions();
        fetchTestPlans();
        fetchTestCases();
        fetchUsers();
    }, []);

    const fetchExecutions = async () => {
        try {
            setLoading(true);
            const response = await executionsAPI.getAll();
            setExecutions(response.data.data || []);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch executions');
        } finally {
            setLoading(false);
        }
    };

    const fetchTestPlans = async () => {
        try {
            const response = await testPlansAPI.getAll();
            setTestPlans(response.data.data || []);
        } catch (error) {
            console.error('Error fetching test plans:', error);
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

    const fetchUsers = async () => {
        try {
            const response = await authAPI.getUsers();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Filter executions
    const filteredExecutions = executions.filter(execution => {
        const matchesSearch = execution.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getTestPlanName(execution.testPlanId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getTestCaseTitle(execution.testCaseId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTestPlan = testPlanFilter === 'all' || execution.testPlanId === testPlanFilter;
        const matchesTestCase = testCaseFilter === 'all' || execution.testCaseId === testCaseFilter;
        const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
        const matchesExecutedBy = executedByFilter === 'all' || execution.executedBy === executedByFilter;
        return matchesSearch && matchesTestPlan && matchesTestCase && matchesStatus && matchesExecutedBy;
    });

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.testPlanId) {
            errors.testPlanId = 'Test plan is required';
        }
        if (!formData.testCaseId) {
            errors.testCaseId = 'Test case is required';
        }
        if (formData.status === 'fail' && !formData.comment.trim()) {
            errors.comment = 'Comment is required when status is fail';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create execution
    const handleCreateExecution = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await executionsAPI.create(formData);
            setShowCreateModal(false);
            resetForm();
            fetchExecutions();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create execution' });
        }
    };

    // Re-execute test case
    const handleReExecute = async (execution) => {
        try {
            await executionsAPI.create({
                testPlanId: execution.testPlanId,
                testCaseId: execution.testCaseId,
                status: 'not_run',
                comment: '',
                createDefect: false,
            });
            fetchExecutions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to re-execute test case');
        }
    };

    // Open details modal
    const openDetailsModal = (execution) => {
        setSelectedExecution(execution);
        setShowDetailsModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            testPlanId: '',
            testCaseId: '',
            status: 'not_run',
            comment: '',
            createDefect: false,
        });
        setFormErrors({});
    };

    // Toggle expanded state
    const toggleExpanded = (executionId) => {
        setExpandedExecutions(prev => ({
            ...prev,
            [executionId]: !prev[executionId]
        }));
    };

    // Get test plan name
    const getTestPlanName = (testPlanId) => {
        const testPlan = testPlans.find(tp => tp._id === testPlanId);
        return testPlan?.name || 'Unknown';
    };

    // Get test case title
    const getTestCaseTitle = (testCaseId) => {
        const testCase = testCases.find(tc => tc._id === testCaseId);
        return testCase?.title || 'Unknown';
    };

    // Get user name
    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user?.name || 'Unknown';
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            not_run: { variant: 'default', icon: Clock, label: 'Not Run' },
            pass: { variant: 'success', icon: CheckCircle2, label: 'Pass' },
            fail: { variant: 'danger', icon: XCircle, label: 'Fail' },
            blocked: { variant: 'warning', icon: AlertTriangle, label: 'Blocked' },
            retest: { variant: 'info', icon: RotateCcw, label: 'Retest' },
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

    // Filter test cases by selected test plan
    const getFilteredTestCases = () => {
        if (!formData.testPlanId) return testCases;
        const selectedTestPlan = testPlans.find(tp => tp._id === formData.testPlanId);
        if (!selectedTestPlan) return testCases;
        const testCaseIds = selectedTestPlan.testCases?.map(tc => typeof tc === 'object' ? tc._id : tc) || [];
        return testCases.filter(tc => testCaseIds.includes(tc._id));
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
                        <h1 className="text-2xl font-bold text-gray-900">Test Executions</h1>
                        <p className="text-gray-600 mt-1">Track test execution results</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Execution
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
                                placeholder="Search executions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={testPlanFilter}
                            onChange={(e) => setTestPlanFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Test Plans</option>
                            {testPlans.map(testPlan => (
                                <option key={testPlan._id} value={testPlan._id}>{testPlan.name}</option>
                            ))}
                        </select>
                        <select
                            value={testCaseFilter}
                            onChange={(e) => setTestCaseFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Test Cases</option>
                            {testCases.map(testCase => (
                                <option key={testCase._id} value={testCase._id}>{testCase.title}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="not_run">Not Run</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                            <option value="blocked">Blocked</option>
                            <option value="retest">Retest</option>
                        </select>
                        <select
                            value={executedByFilter}
                            onChange={(e) => setExecutedByFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Executors</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Executions List */}
                {filteredExecutions.length === 0 ? (
                    <Card className="p-12 text-center">
                        <PlayCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm || testPlanFilter !== 'all' || testCaseFilter !== 'all' || statusFilter !== 'all' || executedByFilter !== 'all'
                                ? 'No executions match your search criteria'
                                : 'No executions yet. Create your first execution to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredExecutions.map((execution) => (
                            <Card key={execution._id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {getTestCaseTitle(execution.testCaseId)}
                                            </h3>
                                            {getStatusBadge(execution.status)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                                            <span className="flex items-center">
                                                <ClipboardList className="h-4 w-4 mr-1" />
                                                {getTestPlanName(execution.testPlanId)}
                                            </span>
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                {getUserName(execution.executedBy)}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(execution.executedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {execution.comment && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {execution.comment}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleExpanded(execution._id)}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            {expandedExecutions[execution._id] ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedExecutions[execution._id] && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="space-y-3">
                                            {execution.comment && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Comment</h4>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                        {execution.comment}
                                                    </p>
                                                </div>
                                            )}
                                            {execution.defectId && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Defect</h4>
                                                    <Badge variant="danger">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Defect Created
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openDetailsModal(execution)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReExecute(execution)}
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Re-execute
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                    {!expandedExecutions[execution._id] && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleExpanded(execution._id)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReExecute(execution)}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                Re-execute
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Execution Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Execution</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateExecution}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Test Plan</label>
                                <select
                                    name="testPlanId"
                                    value={formData.testPlanId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select test plan</option>
                                    {testPlans.map(testPlan => (
                                        <option key={testPlan._id} value={testPlan._id}>{testPlan.name}</option>
                                    ))}
                                </select>
                                {formErrors.testPlanId && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.testPlanId}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Test Case</label>
                                <select
                                    name="testCaseId"
                                    value={formData.testCaseId}
                                    onChange={handleInputChange}
                                    disabled={!formData.testPlanId}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select test case</option>
                                    {getFilteredTestCases().map(testCase => (
                                        <option key={testCase._id} value={testCase._id}>{testCase.title}</option>
                                    ))}
                                </select>
                                {formErrors.testCaseId && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.testCaseId}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="not_run">Not Run</option>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="retest">Retest</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleInputChange}
                                    placeholder="Add execution notes..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.comment && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.comment}</p>
                                )}
                            </div>
                            {formData.status === 'fail' && (
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="createDefect"
                                            checked={formData.createDefect}
                                            onChange={handleInputChange}
                                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Create defect automatically</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                        A defect will be created with the execution details
                                    </p>
                                </div>
                            )}
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
                                    Create Execution
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedExecution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Execution Details</h2>
                            <button
                                onClick={() => { setShowDetailsModal(false); setSelectedExecution(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {getTestCaseTitle(selectedExecution.testCaseId)}
                                </h3>
                                {getStatusBadge(selectedExecution.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Test Plan</h4>
                                    <p className="text-sm text-gray-600">{getTestPlanName(selectedExecution.testPlanId)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Executed By</h4>
                                    <p className="text-sm text-gray-600">{getUserName(selectedExecution.executedBy)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Executed At</h4>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedExecution.executedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                                    <p className="text-sm text-gray-600">
                                        {selectedExecution.duration ? `${selectedExecution.duration}s` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {selectedExecution.comment && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Comment</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {selectedExecution.comment}
                                    </p>
                                </div>
                            )}
                            {selectedExecution.defectId && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Defect</h4>
                                    <Badge variant="danger">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Defect Created
                                    </Badge>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Created At</h4>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedExecution.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Updated At</h4>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedExecution.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
