'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { featuresAPI, projectsAPI, testCasesAPI } from '../../lib/api';
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
    Layers,
    FileText,
    CheckCircle2 as CheckCircle,
    AlertTriangle,
    BarChart3
} from 'lucide-react';

export default function Features() {
    const [features, setFeatures] = useState([]);
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
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [featureStats, setFeatureStats] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        project: '',
        status: 'In Development',
        priority: 'Medium',
        owner: '',
        requirementLink: '',
        designDocument: '',
        storyReference: '',
    });

    const [formErrors, setFormErrors] = useState({});

    // Fetch current user
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const userData = await response.json();
            setCurrentUser(userData.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    // Fetch features and projects
    useEffect(() => {
        fetchFeatures();
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchFeatures = async () => {
        try {
            setLoading(true);
            const params = {};
            if (projectFilter !== 'all') {
                params.project = projectFilter;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await featuresAPI.getAll(params);
            setFeatures(response.data.data || []);
            setError('');

            // Fetch stats for each feature
            await fetchFeatureStats(response.data.data || []);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch features');
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
            const response = await fetch('/api/auth/users');
            const userData = await response.json();
            setUsers(userData.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchFeatureStats = async (featuresList) => {
        const stats = {};
        for (const feature of featuresList) {
            try {
                const testCasesResponse = await testCasesAPI.getAll({ feature: feature._id });
                const testCases = testCasesResponse.data.data || [];

                const total = testCases.length;
                const passed = testCases.filter(tc => tc.status === 'ready').length;
                const failed = testCases.filter(tc => tc.status === 'deprecated').length;
                const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

                stats[feature._id] = {
                    totalTestCases: total,
                    passed,
                    failed,
                    passRate
                };
            } catch (error) {
                console.error('Error fetching stats for feature:', error);
            }
        }
        setFeatureStats(stats);
    };

    // Filter features
    const filteredFeatures = features.filter(feature => {
        const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter === 'all' || feature.project._id === projectFilter;
        const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;
        return matchesSearch && matchesProject && matchesStatus;
    });

    // Check if user can edit/delete feature
    const canEditFeature = (feature) => {
        if (!currentUser) return false;
        return currentUser.role === 'admin' || currentUser.role === 'qa_lead' || feature.createdBy._id === currentUser._id;
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
        if (!formData.name.trim()) {
            errors.name = 'Feature name is required';
        }
        if (!formData.project) {
            errors.project = 'Project is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create feature
    const handleCreateFeature = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await featuresAPI.create(formData);
            setShowCreateModal(false);
            setFormData({
                name: '',
                description: '',
                project: '',
                status: 'In Development',
                priority: 'Medium',
                owner: '',
                requirementLink: '',
                designDocument: '',
                storyReference: '',
            });
            fetchFeatures();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create feature' });
        }
    };

    // Edit feature
    const handleEditFeature = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await featuresAPI.update(selectedFeature._id, formData);
            setShowEditModal(false);
            setFormData({
                name: '',
                description: '',
                project: '',
                status: 'In Development',
                priority: 'Medium',
                owner: '',
                requirementLink: '',
                designDocument: '',
                storyReference: '',
            });
            setSelectedFeature(null);
            fetchFeatures();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to update feature' });
        }
    };

    // Delete feature
    const handleDeleteFeature = async () => {
        try {
            await featuresAPI.delete(selectedFeature._id);
            setShowDeleteModal(false);
            setSelectedFeature(null);
            fetchFeatures();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete feature');
        }
    };

    // Restore feature
    const handleRestoreFeature = async (featureId) => {
        try {
            await featuresAPI.restore(featureId);
            fetchFeatures();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to restore feature');
        }
    };

    // Open edit modal
    const openEditModal = (feature) => {
        setSelectedFeature(feature);
        setFormData({
            name: feature.name,
            description: feature.description || '',
            project: feature.project._id,
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (feature) => {
        setSelectedFeature(feature);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
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
                        <h1 className="text-2xl font-bold text-gray-900">Features</h1>
                        <p className="text-gray-600 mt-1">Manage features across your projects</p>
                    </div>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Feature
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
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search features by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                                options={[
                                    { label: 'All Projects', value: 'all' },
                                    ...projects.map(p => ({ label: p.name, value: p._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Deprecated', value: 'Deprecated' },
                                    { label: 'In Development', value: 'In Development' },
                                    { label: 'Completed', value: 'Completed' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                </Card>

                {/* Features Grid */}
                {filteredFeatures.length === 0 ? (
                    <Card className="p-12 text-center bg-gray-50/50 border-dashed border-2">
                        <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all'
                                ? 'No features match your search criteria'
                                : 'No features yet. Create your first feature to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFeatures.map((feature) => {
                            const stats = featureStats[feature._id] || { totalTestCases: 0, passed: 0, failed: 0, passRate: 0 };
                            return (
                                <Card key={feature._id} className="p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-gray-200/60">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 pr-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                                {feature.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                                {feature.description || 'No description provided for this feature.'}
                                            </p>
                                        </div>
                                        <Badge variant={feature.status === 'active' ? 'success' : 'default'} className="mt-1">
                                            {feature.status || 'active'}
                                        </Badge>
                                    </div>

                                    {/* Feature Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-auto">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FileText className="h-4 w-4 mr-2 text-primary-500" />
                                            <span className="font-medium text-gray-900">{stats.totalTestCases}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CheckCircle className="h-4 w-4 mr-2 text-success-500" />
                                            <span className="font-medium text-gray-900">{stats.passed}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <BarChart3 className="h-4 w-4 mr-2 text-primary-500" />
                                            <span className="font-medium text-gray-900">{stats.passRate}%</span>
                                        </div>
                                    </div>

                                    {/* Project Badge */}
                                    <div className="mb-4">
                                        <Badge variant="info" className="text-xs">
                                            {feature.project?.name || 'Unknown Project'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(feature)}
                                                    className="px-2"
                                                    title="Edit Feature"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                {currentUser?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(feature)}
                                                        className="px-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                                        title="Delete Feature"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-xs text-gray-400 italic py-1.5 w-full text-center">Assigned View Only</div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Feature Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Feature"
                size="lg"
            >
                <form onSubmit={handleCreateFeature}>
                    <Input
                        label="Feature Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="e.g. User Authentication"
                    />
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Briefly describe this feature..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Project *
                            </label>
                            <Select
                                value={formData.project}
                                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                                options={[
                                    { label: 'Select a project...', value: '' },
                                    ...projects.map(p => ({ label: p.name, value: p._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                            {formErrors.project && (
                                <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.project}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Status
                            </label>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                options={[
                                    { label: 'In Development', value: 'In Development' },
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Completed', value: 'Completed' },
                                    { label: 'Deprecated', value: 'Deprecated' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Priority
                            </label>
                            <Select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                options={[
                                    { label: 'High', value: 'High' },
                                    { label: 'Medium', value: 'Medium' },
                                    { label: 'Low', value: 'Low' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Owner
                            </label>
                            <Select
                                value={formData.owner}
                                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                                options={[
                                    { label: 'Select Owner...', value: '' },
                                    ...users.map(u => ({ label: u.name, value: u._id }))
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Requirement Link (Optional)
                        </label>
                        <input
                            type="url"
                            name="requirementLink"
                            value={formData.requirementLink}
                            onChange={handleInputChange}
                            placeholder="https://requirements.example.com"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Design Document (Optional)
                        </label>
                        <input
                            type="url"
                            name="designDocument"
                            value={formData.designDocument}
                            onChange={handleInputChange}
                            placeholder="https://design.example.com"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Story Reference (Optional)
                        </label>
                        <input
                            type="text"
                            name="storyReference"
                            value={formData.storyReference}
                            onChange={handleInputChange}
                            placeholder="STORY-123"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    {formErrors.submit && (
                        <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary-500/20">
                            Create Feature
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Feature Modal */}
            <Modal
                isOpen={showEditModal && !!selectedFeature}
                onClose={() => setShowEditModal(false)}
                title="Edit Feature"
                size="lg"
            >
                <form onSubmit={handleEditFeature}>
                    <Input
                        label="Feature Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="Enter feature name"
                    />
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter feature description"
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Status
                            </label>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                options={[
                                    { label: 'In Development', value: 'In Development' },
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Completed', value: 'Completed' },
                                    { label: 'Deprecated', value: 'Deprecated' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                                Priority
                            </label>
                            <Select
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                options={[
                                    { label: 'High', value: 'High' },
                                    { label: 'Medium', value: 'Medium' },
                                    { label: 'Low', value: 'Low' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Owner
                        </label>
                        <Select
                            value={formData.owner}
                            onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                            options={[
                                { label: 'Select Owner...', value: '' },
                                ...users.map(u => ({ label: u.name, value: u._id }))
                            ]}
                            containerClassName="mb-0"
                            className="rounded-xl py-2.5"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Requirement Link (Optional)
                        </label>
                        <input
                            type="url"
                            name="requirementLink"
                            value={formData.requirementLink}
                            onChange={handleInputChange}
                            placeholder="https://requirements.example.com"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Design Document (Optional)
                        </label>
                        <input
                            type="url"
                            name="designDocument"
                            value={formData.designDocument}
                            onChange={handleInputChange}
                            placeholder="https://design.example.com"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Story Reference (Optional)
                        </label>
                        <input
                            type="text"
                            name="storyReference"
                            value={formData.storyReference}
                            onChange={handleInputChange}
                            placeholder="STORY-123"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                        />
                    </div>
                    {formErrors.submit && (
                        <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEditModal(false)}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary-500/20">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal && !!selectedFeature}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Feature"
                size="sm"
            >
                <div className="mb-6 mt-2">
                    <p className="text-gray-700 leading-relaxed">
                        Are you sure you want to delete feature <strong className="text-gray-900">"{selectedFeature?.name}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-3 p-3 bg-danger-50 rounded-lg border border-danger-100 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-danger-500 flex-shrink-0 mt-0.5" />
                        This action will soft delete the feature. Test cases linked to this feature will remain but will need to be reassigned.
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
                    <Button variant="danger" onClick={handleDeleteFeature} className="flex-1 rounded-xl shadow-lg shadow-danger-500/10">
                        Delete Feature
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
