'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { projectsAPI, authAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
    Calendar,
    FolderKanban
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
        return currentUser.role === 'Admin' || project.createdBy === currentUser._id;
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
        setShowMemberModal(true);
    };

    // Add member to project
    const handleAddMember = async (userId) => {
        try {
            await projectsAPI.addMember(selectedProject._id, { userId });
            fetchProjects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add member');
        }
    };

    // Remove member from project
    const handleRemoveMember = async (userId) => {
        try {
            await projectsAPI.removeMember(selectedProject._id, userId);
            fetchProjects();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to remove member');
        }
    };

    // Check if user is a member
    const isMember = (project, userId) => {
        return project.members?.some(member => member._id === userId);
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
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        New Project
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
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </Card>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No projects match your search criteria'
                                : 'No projects yet. Create your first project to get started!'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <Card key={project._id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                                        {project.status || 'active'}
                                    </Badge>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span>{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                    {canEditProject(project) && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openMemberModal(project)}
                                                className="flex-1"
                                            >
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Members
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(project)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(project)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <Input
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={formErrors.name}
                                placeholder="Enter project name"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter project description"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Project</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleEditProject}>
                            <Input
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={formErrors.name}
                                placeholder="Enter project name"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter project description"
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-danger-600">{formErrors.description}</p>
                                )}
                            </div>
                            {formErrors.submit && (
                                <div className="mb-4 text-sm text-danger-600">{formErrors.submit}</div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowEditModal(false)}
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
            {showDeleteModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Delete Project</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-700">
                                Are you sure you want to delete the project <strong>"{selectedProject.name}"</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action will soft delete the project and all associated data.
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
                            <Button variant="danger" onClick={handleDeleteProject} className="flex-1">
                                Delete Project
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Member Management Modal */}
            {showMemberModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6 p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Manage Members</h2>
                            <button
                                onClick={() => setShowMemberModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Members</h3>
                            {selectedProject.members?.length > 0 ? (
                                <div className="space-y-2 mb-6">
                                    {selectedProject.members.map((member) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveMember(member._id)}
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6">No members yet</p>
                            )}

                            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Members</h3>
                            <div className="space-y-2">
                                {users
                                    .filter(user => !isMember(selectedProject, user._id))
                                    .map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleAddMember(user._id)}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
