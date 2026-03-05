'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { executionsAPI, testPlansAPI, testCasesAPI, authAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
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
                <Card className="p-4 bg-gray-50/50 border-gray-100 shadow-sm">
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by comment, test plan or case..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Select
                                value={testPlanFilter}
                                onChange={(e) => setTestPlanFilter(e.target.value)}
                                options={[
                                    { label: 'All Plans', value: 'all' },
                                    ...testPlans.map(tp => ({ label: tp.name, value: tp._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5 text-xs"
                            />
                            <Select
                                value={testCaseFilter}
                                onChange={(e) => setTestCaseFilter(e.target.value)}
                                options={[
                                    { label: 'All Cases', value: 'all' },
                                    ...testCases.map(tc => ({ label: tc.title, value: tc._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5 text-xs"
                            />
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Not Run', value: 'not_run' },
                                    { label: 'Pass', value: 'pass' },
                                    { label: 'Fail', value: 'fail' },
                                    { label: 'Blocked', value: 'blocked' },
                                    { label: 'Retest', value: 'retest' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5 text-xs"
                            />
                            <Select
                                value={executedByFilter}
                                onChange={(e) => setExecutedByFilter(e.target.value)}
                                options={[
                                    { label: 'All Executors', value: 'all' },
                                    ...users.map(u => ({ label: u.name, value: u._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5 text-xs"
                            />
                        </div>
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
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                    {!expandedExecutions[execution._id] && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleExpanded(execution._id)}
                                                className="rounded-lg text-xs"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReExecute(execution)}
                                                className="rounded-lg text-xs"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
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
            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                title="Log New Test Execution"
                size="md"
            >
                <form onSubmit={handleCreateExecution}>
                    <Select
                        label="Test Plan"
                        name="testPlanId"
                        value={formData.testPlanId}
                        onChange={handleInputChange}
                        error={formErrors.testPlanId}
                        options={[
                            { label: 'Select test plan', value: '' },
                            ...testPlans.map(tp => ({ label: tp.name, value: tp._id }))
                        ]}
                        className="rounded-xl"
                    />

                    <Select
                        label="Test Case"
                        name="testCaseId"
                        value={formData.testCaseId}
                        onChange={handleInputChange}
                        disabled={!formData.testPlanId}
                        error={formErrors.testCaseId}
                        options={[
                            { label: 'Select test case', value: '' },
                            ...getFilteredTestCases().map(tc => ({ label: tc.title, value: tc._id }))
                        ]}
                        className="rounded-xl"
                    />

                    <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        options={[
                            { label: 'Not Run', value: 'not_run' },
                            { label: 'Pass', value: 'pass' },
                            { label: 'Fail', value: 'fail' },
                            { label: 'Blocked', value: 'blocked' },
                            { label: 'Retest', value: 'retest' },
                        ]}
                        className="rounded-xl"
                    />

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Comment
                        </label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleInputChange}
                            placeholder="Add execution notes, found issues, or environment info..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.comment && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.comment}</p>
                        )}
                    </div>

                    {formData.status === 'fail' && (
                        <div className="mb-6 bg-danger-50 p-4 rounded-xl border border-danger-100 animate-in zoom-in-95 duration-200">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="createDefect"
                                        checked={formData.createDefect}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-5 bg-gray-200 rounded-full shadow-inner transition-colors ${formData.createDefect ? 'bg-danger-500' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.createDefect ? 'transform translate-x-5' : ''}`}></div>
                                </div>
                                <span className="ml-3 text-sm font-semibold text-danger-900">Create defect automatically</span>
                            </label>
                            <p className="text-xs text-danger-600 mt-2 ml-0 font-medium">
                                A defect will be logged automatically including these execution results.
                            </p>
                        </div>
                    )}

                    {formErrors.submit && (
                        <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setShowCreateModal(false); resetForm(); }}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary-500/20">
                            Create Execution
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal && !!selectedExecution}
                onClose={() => { setShowDetailsModal(false); setSelectedExecution(null); }}
                title="Execution Details"
                size="md"
            >
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 pr-4 leading-tight">
                                {getTestCaseTitle(selectedExecution?.testCaseId)}
                            </h3>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(selectedExecution?.status)}
                                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    ID: {selectedExecution?._id?.substring(0, 8)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <ClipboardList className="h-4 w-4 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Test Plan</h4>
                                <p className="text-sm font-semibold text-gray-700">{getTestPlanName(selectedExecution?.testPlanId)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <User className="h-4 w-4 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Executed By</h4>
                                <p className="text-sm font-semibold text-gray-700">{getUserName(selectedExecution?.executedBy)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Calendar className="h-4 w-4 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Executed At</h4>
                                <p className="text-sm font-semibold text-gray-700">
                                    {selectedExecution && new Date(selectedExecution.executedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Clock className="h-4 w-4 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duration</h4>
                                <p className="text-sm font-semibold text-gray-700">
                                    {selectedExecution?.duration ? `${selectedExecution.duration}s` : 'Not recorded'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedExecution?.comment && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-primary-500" />
                                Execution Comment
                            </h4>
                            <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 shadow-sm italic leading-relaxed">
                                "{selectedExecution.comment}"
                            </div>
                        </div>
                    )}

                    {selectedExecution?.defectId && (
                        <div className="p-4 bg-danger-50 rounded-xl border border-danger-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <AlertTriangle className="h-4 w-4 text-danger-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-danger-900">Linked Defect Found</h4>
                                    <p className="text-xs text-danger-600 font-medium">Auto-generated during failure</p>
                                </div>
                            </div>
                            <Button variant="danger" size="sm" className="rounded-lg h-8 px-3 text-xs">
                                View Defect
                            </Button>
                        </div>
                    )}

                    <div className="flex pt-4 border-t border-gray-100 mt-2">
                        <Button
                            onClick={() => { setShowDetailsModal(false); setSelectedExecution(null); }}
                            className="w-full rounded-xl"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
