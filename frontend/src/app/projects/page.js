'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { projectsAPI, authAPI } from '../../lib/api';
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
    Users,
    Search,
    Filter,
    X,
    UserPlus,
    UserMinus,
    Folder,
    AlertTriangle,
    Calendar
} from 'lucide-react';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
    const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
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

    // Fetch projects
    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAll();
            setProjects(response.data.data || []);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
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

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Check if user can edit/delete project
    const canEditProject = (project) => {
        if (!currentUser) return false;
        // Admin and QA Lead have full project management rights
        return currentUser.role === 'admin' || currentUser.role === 'qa_lead' || project.createdBy === currentUser._id;
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
            errors.name = 'Project name is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create project
    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await projectsAPI.create(formData);
            setShowCreateModal(false);
            setFormData({ name: '', description: '' });
            fetchProjects();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to create project' });
        }
    };

    // Edit project
    const handleEditProject = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await projectsAPI.update(selectedProject._id, formData);
            setShowEditModal(false);
            setFormData({ name: '', description: '' });
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            setFormErrors({ submit: error.response?.data?.message || 'Failed to update project' });
        }
    };

    // Delete project
    const handleDeleteProject = async () => {
        try {
            await projectsAPI.delete(selectedProject._id);
            setShowDeleteModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete project');
        }
    };

    // Open edit modal
    const openEditModal = (project) => {
        setSelectedProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
        });
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (project) => {
        setSelectedProject(project);
        setShowDeleteModal(true);
    };

    // Open member modal
    const openMemberModal = (project) => {
        setSelectedProject(project);
        setMemberSearchTerm('');
        setSelectedUsersToAdd([]);
        setShowMemberModal(true);
    };

    // Add member to project
    const handleAddMember = async (userId) => {
        setIsUpdatingMembers(true);
        try {
            const response = await projectsAPI.addMember(selectedProject._id, { userId });
            // Update selected project with new data
            setSelectedProject(response.data.data);
            // Also update projects list
            setProjects(prev => prev.map(p =>
                p._id === selectedProject._id ? response.data.data : p
            ));
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add member');
        } finally {
            setIsUpdatingMembers(false);
        }
    };

    // Bulk add members to project
    const handleBulkAddMembers = async () => {
        if (selectedUsersToAdd.length === 0) return;

        setIsUpdatingMembers(true);
        try {
            // Add all members sequentially to get updated project data
            let updatedProject = selectedProject;
            for (const userId of selectedUsersToAdd) {
                const response = await projectsAPI.addMember(selectedProject._id, { userId });
                updatedProject = response.data.data;
            }

            // Update selected project with final data
            setSelectedProject(updatedProject);
            // Also update projects list
            setProjects(prev => prev.map(p =>
                p._id === selectedProject._id ? updatedProject : p
            ));

            // Clear selection
            setSelectedUsersToAdd([]);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add members');
        } finally {
            setIsUpdatingMembers(false);
        }
    };

    // Remove member from project
    const handleRemoveMember = async (userId) => {
        setIsUpdatingMembers(true);
        try {
            const response = await projectsAPI.removeMember(selectedProject._id, userId);
            // Update selected project with new data
            setSelectedProject(response.data.data);
            // Also update projects list
            setProjects(prev => prev.map(p =>
                p._id === selectedProject._id ? response.data.data : p
            ));
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to remove member');
        } finally {
            setIsUpdatingMembers(false);
        }
    };

    // Check if user is a member
    const isMember = (project, userId) => {
        return project?.teamMembers?.some(member => member._id === userId);
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
                        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-600 mt-1">Manage your testing projects</p>
                    </div>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') && (
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-5 w-5 mr-2" />
                            New Project
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
                                placeholder="Search projects by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Archived', value: 'archived' },
                                ]}
                                containerClassName="mb-0"
                                className="rounded-xl py-2.5"
                            />
                        </div>
                    </div>
                </Card>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <Card className="p-12 text-center bg-gray-50/50 border-dashed border-2">
                        <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No projects match your search criteria'
                                : 'No projects yet. Create your first project to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <Card key={project._id} className="p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-gray-200/60">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                                            {project.description || 'No description provided for this project.'}
                                        </p>
                                    </div>
                                    <Badge variant={project.status === 'active' ? 'success' : 'default'} className="mt-1">
                                        {project.status || 'active'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-auto">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-4 w-4 mr-2 text-primary-500" />
                                        <span className="font-medium text-gray-900">{project.teamMembers?.length || 0}</span>
                                        <span className="ml-1 text-gray-500 text-xs">member{project.teamMembers?.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                                        <span className="text-xs">{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    {(currentUser?.role === 'admin' || currentUser?.role === 'qa_lead') ? (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openMemberModal(project)}
                                                className="flex-1 text-xs py-1.5"
                                            >
                                                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                                Members
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(project)}
                                                className="px-2"
                                                title="Edit Project"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            {currentUser?.role === 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteModal(project)}
                                                    className="px-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                                    title="Delete Project"
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
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Project"
                size="md"
            >
                <form onSubmit={handleCreateProject}>
                    <Input
                        label="Project Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="e.g. Mobile App Redesign"
                    />
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Briefly describe the purpose of this project..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.description}</p>
                        )}
                    </div>
                    {formErrors.submit && (
                        <div className="mb-4 text-sm text-danger-600 font-bold bg-danger-50 p-3 rounded-lg border border-danger-100">{formErrors.submit}</div>
                    )}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary-500/20">
                            Create Project
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                isOpen={showEditModal && !!selectedProject}
                onClose={() => setShowEditModal(false)}
                title="Edit Project"
                size="md"
            >
                <form onSubmit={handleEditProject}>
                    <Input
                        label="Project Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={formErrors.name}
                        placeholder="Enter project name"
                    />
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter project description"
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm resize-none placeholder:text-gray-400"
                        />
                        {formErrors.description && (
                            <p className="mt-1.5 text-sm text-danger-600 font-medium animate-in fade-in slide-in-from-top-1 duration-200">{formErrors.description}</p>
                        )}
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
                isOpen={showDeleteModal && !!selectedProject}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Project"
                size="sm"
            >
                <div className="mb-6 mt-2">
                    <p className="text-gray-700 leading-relaxed">
                        Are you sure you want to delete the project <strong className="text-gray-900">"{selectedProject?.name}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-3 p-3 bg-danger-50 rounded-lg border border-danger-100 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-danger-500 flex-shrink-0 mt-0.5" />
                        This action will soft delete the project and all associated data.
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
                    <Button variant="danger" onClick={handleDeleteProject} className="flex-1 rounded-xl shadow-lg shadow-danger-500/10">
                        Delete Project
                    </Button>
                </div>
            </Modal>

            {/* Member Management Modal */}
            <Modal
                isOpen={showMemberModal && !!selectedProject}
                onClose={() => setShowMemberModal(false)}
                title="Manage Project Members"
                size="lg"
            >
                <div className="space-y-6">
                    {/* Project Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <Folder className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-semibold text-gray-900">{selectedProject?.name}</p>
                                <p className="text-xs text-gray-600">
                                    {selectedProject?.teamMembers?.length || 0} member{selectedProject?.teamMembers?.length !== 1 ? 's' : ''} assigned
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Members */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary-600" />
                            Current Team Members
                        </h3>
                        {selectedProject?.teamMembers?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {selectedProject.teamMembers.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-200 hover:shadow-sm transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 text-sm font-bold shadow-sm">
                                                {member.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500">{member.email}</p>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                                        {member.role || 'member'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member._id)}
                                            disabled={isUpdatingMembers}
                                            className="text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Remove member"
                                        >
                                            {isUpdatingMembers ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger-600"></div>
                                            ) : (
                                                <UserMinus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-medium">No team members yet</p>
                                <p className="text-xs text-gray-400 mt-1">Add members from the list below</p>
                            </div>
                        )}
                    </div>

                    {/* Add New Members */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-success-600" />
                            Add Team Members
                        </h3>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={memberSearchTerm}
                                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    disabled={isUpdatingMembers}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Bulk Selection Indicator */}
                        {selectedUsersToAdd.length > 0 && (
                            <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-primary-700">
                                            {selectedUsersToAdd.length} user{selectedUsersToAdd.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleBulkAddMembers}
                                        disabled={isUpdatingMembers}
                                        className="bg-primary-600 hover:bg-primary-700 text-white text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdatingMembers ? (
                                            <span className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                Adding...
                                            </span>
                                        ) : (
                                            'Add Selected'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Available Users List */}
                        <div className="grid grid-cols-1 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                            {users
                                .filter(user => !isMember(selectedProject, user._id))
                                .filter(user =>
                                    user.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                                    user.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
                                )
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${isUpdatingMembers ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedUsersToAdd.includes(user._id)
                                            ? 'bg-primary-50 border-primary-300 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-primary-200 hover:shadow-sm'
                                            }`}
                                        onClick={() => {
                                            if (isUpdatingMembers) return;
                                            setSelectedUsersToAdd(prev =>
                                                prev.includes(user._id)
                                                    ? prev.filter(id => id !== user._id)
                                                    : [...prev, user._id]
                                            );
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedUsersToAdd.includes(user._id)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                                                        {user.role || 'member'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedUsersToAdd.includes(user._id)
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'border-gray-300 hover:border-primary-400'
                                            }`}>
                                            {selectedUsersToAdd.includes(user._id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {users
                                .filter(user => !isMember(selectedProject, user._id))
                                .filter(user =>
                                    user.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                                    user.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
                                ).length === 0 && (
                                    <div className="p-6 text-center">
                                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">
                                            {memberSearchTerm ? 'No users match your search' : 'No more users available to add'}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 pt-6 mt-2 border-t border-gray-200">
                    <Button
                        variant="secondary"
                        onClick={() => setShowMemberModal(false)}
                        className="flex-1 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            // Add selected members but keep modal open
                            if (selectedUsersToAdd.length > 0) {
                                await handleBulkAddMembers();
                            }
                        }}
                        disabled={isUpdatingMembers}
                        className="flex-1 rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdatingMembers ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Adding...
                            </span>
                        ) : (
                            'Done'
                        )}
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
