'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { testPlansAPI, testCasesAPI, projectsAPI, executionsAPI, authAPI } from '../../lib/api';
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
        if (!currentUser || !testPlan) return false;
        // Admin and QA Lead can edit any test plan
        if (['admin', 'qa_lead'].includes(currentUser.role)) return true;
        // QA Engineers and Automation can edit if they created it or are assigned as testers
        const isQA = ['qa_engineer', 'qa_automation'].includes(currentUser.role);
        const isCreator = testPlan.createdBy === currentUser._id || testPlan.createdBy?._id === currentUser._id;
        const isTester = testPlan.testers?.some(t => (t._id || t) === currentUser._id);
        return isQA && (isCreator || isTester);
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
                    {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Test Plan
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
                <Card className="p-4 bg-gray-50/50 border-gray-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search test plans by name, description or version..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                                options={[
                                    { label: 'All Projects', value: 'all' },
                                    ...projects.map(p => ({ label: p.name, value: p._id }))
                                ]}
                                containerClassName="mb-0 min-w-[200px]"
                                className="rounded-xl py-2.5 text-xs"
                            />
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Draft', value: 'draft' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Completed', value: 'completed' },
                                ]}
                                containerClassName="mb-0 min-w-[150px]"
                                className="rounded-xl py-2.5 text-xs"
                            />
                        </div>
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
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                                                <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                    <FileText className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
                                                    {getProjectName(testPlan.projectId)}
                                                </span>
                                                <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                    <Badge variant="outline" className="h-4 px-1 text-[10px] mr-1.5 border-primary-200 text-primary-600">Ver</Badge>
                                                    {testPlan.releaseVersion}
                                                </span>
                                                <span className="flex items-center">
                                                    <ClipboardList className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {testPlan.testCases?.length || 0} test cases
                                                </span>
                                                <span className="flex items-center">
                                                    <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
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
                                        {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(testPlan)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                {currentUser?.role === 'admin' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(testPlan)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
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
            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                title="Create New Test Plan"
                size="3xl"
            >
                <form onSubmit={handleCreateTestPlan} className="space-y-6">
                    <Input
                        label="Test Plan Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="e.g., Release Q1 Regression Suite"
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
                            placeholder="Briefly describe the objective and scope of this test plan..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
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
                        <Input
                            label="Release Version"
                            name="releaseVersion"
                            value={formData.releaseVersion}
                            onChange={handleInputChange}
                            error={formErrors.releaseVersion}
                            placeholder="e.g., v1.0.0"
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary-500" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                            {formErrors.startDate && (
                                <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-danger-500" />
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                            {formErrors.endDate && (
                                <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.endDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Test Cases Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-primary-500" />
                                Select Test Cases
                            </span>
                            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full border border-primary-100 italic">
                                {formData.testCases.length} selected
                            </span>
                        </label>
                        <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-2xl p-3 bg-gray-50/50 space-y-2">
                            {testCases.length === 0 ? (
                                <div className="text-center py-8">
                                    <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No test cases found in database</p>
                                </div>
                            ) : (
                                testCases.map(tc => (
                                    <label key={tc._id} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${formData.testCases.includes(tc._id) ? 'bg-white border-primary-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.testCases.includes(tc._id)}
                                                onChange={() => handleTestCaseToggle(tc._id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.testCases.includes(tc._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                                {formData.testCases.includes(tc._id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{tc.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${tc.priority === 'High' ? 'bg-danger-50 text-danger-600' : tc.priority === 'Medium' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'}`}>
                                                    {tc.priority}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">{tc.status}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                        {formErrors.testCases && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.testCases}</p>
                        )}
                    </div>

                    {/* Testers Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary-500" />
                                Assign Testers
                            </span>
                            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full border border-primary-100 italic">
                                {formData.testers.length} selected
                            </span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                            {users.map(user => (
                                <label key={user._id} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${formData.testers.includes(user._id) ? 'bg-white border-primary-200 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.testers.includes(user._id)}
                                            onChange={() => handleTesterToggle(user._id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.testers.includes(user._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                            {formData.testers.includes(user._id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>
                                    <div className="ml-3 overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
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
                        <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-500/20">
                            Create Test Plan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Test Plan Modal */}
            <Modal
                isOpen={showEditModal && !!selectedTestPlan}
                onClose={() => { setShowEditModal(false); resetForm(); setSelectedTestPlan(null); }}
                title="Edit Test Plan"
                size="3xl"
            >
                <form onSubmit={handleEditTestPlan} className="space-y-6">
                    <Input
                        label="Test Plan Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="e.g., Release Q1 Regression Suite"
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
                            placeholder="Briefly describe the objective and scope of this test plan..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
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
                        <Input
                            label="Release Version"
                            name="releaseVersion"
                            value={formData.releaseVersion}
                            onChange={handleInputChange}
                            error={formErrors.releaseVersion}
                            placeholder="e.g., v1.0.0"
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary-500" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                            {formErrors.startDate && (
                                <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-danger-500" />
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm"
                            />
                            {formErrors.endDate && (
                                <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.endDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Test Cases Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-primary-500" />
                                Select Test Cases
                            </span>
                            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full border border-primary-100 italic">
                                {formData.testCases.length} selected
                            </span>
                        </label>
                        <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-2xl p-3 bg-gray-50/50 space-y-2">
                            {testCases.length === 0 ? (
                                <div className="text-center py-8">
                                    <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No test cases found in database</p>
                                </div>
                            ) : (
                                testCases.map(tc => (
                                    <label key={tc._id} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${formData.testCases.includes(tc._id) ? 'bg-white border-primary-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.testCases.includes(tc._id)}
                                                onChange={() => handleTestCaseToggle(tc._id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.testCases.includes(tc._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                                {formData.testCases.includes(tc._id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{tc.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${tc.priority === 'High' ? 'bg-danger-50 text-danger-600' : tc.priority === 'Medium' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'}`}>
                                                    {tc.priority}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">{tc.status}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                        {formErrors.testCases && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium">{formErrors.testCases}</p>
                        )}
                    </div>

                    {/* Testers Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary-500" />
                                Assign Testers
                            </span>
                            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full border border-primary-100 italic">
                                {formData.testers.length} selected
                            </span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                            {users.map(user => (
                                <label key={user._id} className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${formData.testers.includes(user._id) ? 'bg-white border-primary-200 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.testers.includes(user._id)}
                                            onChange={() => handleTesterToggle(user._id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.testers.includes(user._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                            {formData.testers.includes(user._id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>
                                    <div className="ml-3 overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
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
                            onClick={() => { setShowEditModal(false); resetForm(); setSelectedTestPlan(null); }}
                            className="flex-1 rounded-xl h-11"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-500/20">
                            Update Test Plan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedTestPlan(null); }}
                title="Delete Test Plan"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-danger-50 rounded-xl border border-danger-100 flex items-center gap-3">
                        <Trash2 className="h-6 w-6 text-danger-500" />
                        <p className="text-sm text-danger-700 font-medium">
                            Are you sure you want to delete this test plan? This action cannot be undone.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">{selectedTestPlan?.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{selectedTestPlan?.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            variant="secondary"
                            className="flex-1 rounded-xl"
                            onClick={() => { setShowDeleteModal(false); setSelectedTestPlan(null); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1 rounded-xl"
                            onClick={handleDeleteTestPlan}
                        >
                            Delete Plan
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal && !!selectedTestPlan}
                onClose={() => { setShowDetailsModal(false); setSelectedTestPlan(null); }}
                title="Test Plan Details"
                size="3xl"
            >
                {selectedTestPlan && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {selectedTestPlan.name}
                                </h3>
                                <Badge variant={selectedTestPlan.status}>{selectedTestPlan.status}</Badge>
                            </div>
                            <p className="text-gray-600">{selectedTestPlan.description || 'No description provided.'}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Project</p>
                                <p className="text-sm font-bold text-gray-900">{getProjectName(selectedTestPlan.projectId)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Version</p>
                                <p className="text-sm font-bold text-gray-900">{selectedTestPlan.releaseVersion || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(selectedTestPlan.startDate).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">End Date</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(selectedTestPlan.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary-500" />
                                Test Cases ({selectedTestPlan.testCases?.length || 0})
                            </h4>
                            <div className="space-y-3">
                                {selectedTestPlan.testCases?.map((testCase) => {
                                    const tc = typeof testCase === 'object' ? testCase : getTestCaseDetails(testCase);
                                    if (!tc) return null;
                                    return (
                                        <div key={tc._id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-primary-100 transition-colors shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-900">{tc.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${tc.priority === 'High' ? 'bg-danger-50 text-danger-600' : tc.priority === 'Medium' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'}`}>
                                                        {tc.priority}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{tc.status}</span>
                                                </div>
                                            </div>
                                            {getStatusBadge(tc.executionStatus || 'not_run')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedTestPlan.testers && selectedTestPlan.testers.length > 0 && (
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary-500" />
                                    Assigned Testers
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {selectedTestPlan.testers.map((tester) => {
                                        const user = typeof tester === 'object' ? tester : users.find(u => u._id === tester);
                                        if (!user) return null;
                                        return (
                                            <div key={user._id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-600">
                                                    {user.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100 text-xs text-gray-400">
                            <div>
                                <p className="font-medium">Created At</p>
                                <p className="mt-1">{new Date(selectedTestPlan.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-medium">Last Updated</p>
                                <p className="mt-1">{new Date(selectedTestPlan.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
