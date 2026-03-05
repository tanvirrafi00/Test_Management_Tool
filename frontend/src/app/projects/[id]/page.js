'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { projectsAPI } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import {
    ArrowLeft,
    Users,
    Calendar,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    Settings,
    Search,
    Filter,
    Plus,
    Eye,
    Play,
    Bug,
    List,
    Target,
    Activity
} from 'lucide-react';

export default function ProjectView() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [featuresData, setFeaturesData] = useState([]);
    const [testCasesData, setTestCasesData] = useState([]);
    const [testPlansData, setTestPlansData] = useState([]);
    const [defectsData, setDefectsData] = useState([]);
    const [reportsData, setReportsData] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [filters, setFilters] = useState({
        feature: '',
        priority: '',
        status: '',
        assignedTo: '',
        severity: ''
    });

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setCurrentUser(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // Fetch project data
    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    // Fetch tab-specific data when tab changes
    useEffect(() => {
        if (projectId && !loading) {
            switch (activeTab) {
                case 'dashboard':
                    fetchDashboardData();
                    break;
                case 'features':
                    fetchFeaturesData();
                    break;
                case 'test-cases':
                    fetchTestCasesData();
                    break;
                case 'test-plans':
                    fetchTestPlansData();
                    break;
                case 'defects':
                    fetchDefectsData();
                    break;
                case 'reports':
                    fetchReportsData();
                    break;
                case 'team':
                    fetchTeamData();
                    break;
            }
        }
    }, [activeTab, projectId, loading]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(projectId);
            setProjectData(response.data.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch project');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchFeaturesData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/features`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setFeaturesData(data.data);
            }
        } catch (error) {
            console.error('Error fetching features data:', error);
        }
    };

    const fetchTestCasesData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.feature) queryParams.append('feature', filters.feature);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/test-cases?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTestCasesData(data.data);
            }
        } catch (error) {
            console.error('Error fetching test cases data:', error);
        }
    };

    const fetchTestPlansData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/test-plans`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTestPlansData(data.data);
            }
        } catch (error) {
            console.error('Error fetching test plans data:', error);
        }
    };

    const fetchDefectsData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.severity) queryParams.append('severity', filters.severity);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/defects?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setDefectsData(data.data);
            }
        } catch (error) {
            console.error('Error fetching defects data:', error);
        }
    };

    const fetchReportsData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/reports`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setReportsData(data.data);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
        }
    };

    const fetchTeamData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/team`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTeamData(data.data);
            }
        } catch (error) {
            console.error('Error fetching team data:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        // Refetch data when filters change
        setTimeout(() => {
            if (activeTab === 'test-cases') fetchTestCasesData();
            if (activeTab === 'defects') fetchDefectsData();
        }, 100);
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

    if (error) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </DashboardLayout>
        );
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'features', label: 'Features', icon: Target },
        { id: 'test-cases', label: 'Test Cases', icon: List },
        { id: 'test-plans', label: 'Test Plans', icon: FileText },
        { id: 'defects', label: 'Defects', icon: Bug },
        { id: 'reports', label: 'Reports', icon: TrendingUp },
        { id: 'team', label: 'Team', icon: Users }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Project Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{projectData?.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-blue-100">
                                    <Badge variant="success" className="bg-white/20 text-white border-white/30">
                                        {projectData?.status || 'Active'}
                                    </Badge>
                                    <span className="text-sm">•</span>
                                    <span className="text-sm flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {projectData?.teamMembers?.length || 0} members
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-sm text-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {projectData?.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'Not set'}
                                </span>
                            </div>
                            {projectData?.qaLead && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>QA Lead: {projectData.qaLead.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {projectData?.description && (
                        <p className="text-blue-100 text-sm mt-2">{projectData.description}</p>
                    )}
                </div>

                {/* Navigation Tabs */}
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className="bg-white rounded-xl shadow-sm border border-gray-200"
                />

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'dashboard' && (
                        <DashboardTab
                            data={dashboardData}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'features' && (
                        <FeaturesTab
                            features={featuresData}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'test-cases' && (
                        <TestCasesTab
                            testCases={testCasesData}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'test-plans' && (
                        <TestPlansTab
                            testPlans={testPlansData}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'defects' && (
                        <DefectsTab
                            defects={defectsData}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'reports' && (
                        <ReportsTab
                            data={reportsData}
                        />
                    )}
                    {activeTab === 'team' && (
                        <TeamTab
                            data={teamData}
                            currentUser={currentUser}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Dashboard Tab Component
function DashboardTab({ data, currentUser }) {
    if (!data) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            {/* My Assigned Tasks */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    My Assigned Tasks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.widgets.myAssignedTasks.testCases}</p>
                                <p className="text-sm text-gray-600">Test Cases</p>
                            </div>
                            <List className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.widgets.myAssignedTasks.testPlans}</p>
                                <p className="text-sm text-gray-600">Active Test Plans</p>
                            </div>
                            <FileText className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.widgets.myAssignedTasks.defects}</p>
                                <p className="text-sm text-gray-600">Assigned Defects</p>
                            </div>
                            <Bug className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features & Test Cases */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Project Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Target className="h-5 w-5 text-blue-500" />
                                <span className="text-gray-700">Total Features</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{data.widgets.totalFeatures}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <List className="h-5 w-5 text-purple-500" />
                                <span className="text-gray-700">Total Test Cases</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{data.widgets.totalTestCases}</span>
                        </div>
                    </div>
                </Card>

                {/* Test Execution Progress */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Test Execution Progress</h3>
                    <div className="space-y-4">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        {data.widgets.execution.progress}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {data.widgets.execution.passed + data.widgets.execution.failed} / {data.widgets.totalTestCases}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                <div
                                    style={{ width: `${data.widgets.execution.progress}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                                ></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-900">{data.widgets.execution.passed}</p>
                                <p className="text-xs text-gray-600">Passed</p>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-900">{data.widgets.execution.failed}</p>
                                <p className="text-xs text-gray-600">Failed</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <Clock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                                <p className="text-sm font-bold text-gray-900">{data.widgets.execution.notRun}</p>
                                <p className="text-xs text-gray-600">Not Run</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Defect Summary */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Defect Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-gray-900">{data.widgets.defects.total}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Defects</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-3xl font-bold text-red-600">{data.widgets.defects.open}</p>
                        <p className="text-sm text-gray-600 mt-1">Open</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-3xl font-bold text-yellow-600">{data.widgets.defects.inProgress}</p>
                        <p className="text-sm text-gray-600 mt-1">In Progress</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-3xl font-bold text-green-600">{data.widgets.defects.closed}</p>
                        <p className="text-sm text-gray-600 mt-1">Closed</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Features Tab Component
function FeaturesTab({ features, currentUser }) {
    return (
        <div className="space-y-4">
            {features.length === 0 ? (
                <Card className="p-12 text-center">
                    <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No features found in this project</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {features.map((feature) => (
                        <Card key={feature._id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                                        <Badge variant={feature.status === 'Active' ? 'success' : 'info'}>
                                            {feature.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <List className="h-4 w-4" />
                                            {feature.totalTestCases} test cases
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" />
                                            {feature.executionProgress}% progress
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bug className="h-4 w-4" />
                                            {feature.defectCount} defects
                                        </span>
                                    </div>
                                    {feature.owner && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Owner: {feature.owner.name}
                                        </p>
                                    )}
                                </div>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// Test Cases Tab Component
function TestCasesTab({ testCases, filters, onFilterChange, currentUser }) {
    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => onFilterChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">All Priorities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="ready">Ready</option>
                            <option value="deprecated">Deprecated</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Test Cases List */}
            {testCases.length === 0 ? (
                <Card className="p-12 text-center">
                    <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No test cases found</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {testCases.map((testCase) => (
                        <Card
                            key={testCase._id}
                            className={`p-4 hover:shadow-md transition-shadow ${testCase.isAssignedToMe ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-gray-500">{testCase.testCaseId}</span>
                                        {testCase.isAssignedToMe && (
                                            <Badge variant="success" className="text-xs">
                                                Assigned to me
                                            </Badge>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{testCase.title}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Badge
                                            variant={
                                                testCase.priority === 'critical' ? 'danger' :
                                                    testCase.priority === 'high' ? 'warning' :
                                                        testCase.priority === 'medium' ? 'info' : 'default'
                                            }
                                            className="text-xs"
                                        >
                                            {testCase.priority}
                                        </Badge>
                                        {testCase.feature && (
                                            <span className="text-xs">{testCase.feature.name}</span>
                                        )}
                                        {testCase.assignedTo && (
                                            <span className="text-xs flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {testCase.assignedTo.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button variant="primary" size="sm">
                                        <Play className="h-4 w-4 mr-1" />
                                        Execute
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// Test Plans Tab Component
function TestPlansTab({ testPlans, currentUser }) {
    return (
        <div className="space-y-4">
            {testPlans.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No test plans found in this project</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {testPlans.map((plan) => (
                        <Card key={plan._id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                        <Badge variant={plan.status === 'active' ? 'success' : 'info'}>
                                            {plan.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            {plan.testCases.length} test cases
                                        </span>
                                        {plan.releaseVersion && (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {plan.releaseVersion}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${plan.executionProgress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                                            {plan.executionProgress}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span>Passed: {plan.executionStats.passed}</span>
                                        <span>Failed: {plan.executionStats.failed}</span>
                                        <span>Not Run: {plan.executionStats.notRun}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// Defects Tab Component
function DefectsTab({ defects, filters, onFilterChange, currentUser }) {
    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                        <select
                            value={filters.severity}
                            onChange={(e) => onFilterChange('severity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="major">Major</option>
                            <option value="minor">Minor</option>
                            <option value="trivial">Trivial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="fixed">Fixed</option>
                            <option value="retest">Retest</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Defects List */}
            {defects.length === 0 ? (
                <Card className="p-12 text-center">
                    <Bug className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No defects found</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {defects.map((defect) => (
                        <Card key={defect._id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-gray-500">{defect.defectId}</span>
                                        <Badge
                                            variant={
                                                defect.severity === 'critical' ? 'danger' :
                                                    defect.severity === 'major' ? 'warning' :
                                                        defect.severity === 'minor' ? 'info' : 'default'
                                            }
                                            className="text-xs"
                                        >
                                            {defect.severity}
                                        </Badge>
                                        <Badge
                                            variant={
                                                defect.status === 'open' ? 'danger' :
                                                    defect.status === 'in_progress' ? 'warning' :
                                                        defect.status === 'fixed' ? 'info' : 'success'
                                            }
                                            className="text-xs"
                                        >
                                            {defect.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{defect.title}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        {defect.assignedTo && (
                                            <span className="text-xs flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {defect.assignedTo.name}
                                            </span>
                                        )}
                                        {defect.linkedTestCase && (
                                            <span className="text-xs">
                                                TC: {defect.linkedTestCase.testCaseId}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// Reports Tab Component
function ReportsTab({ data }) {
    if (!data) return <div className="text-center py-12 text-gray-500">Loading reports...</div>;

    return (
        <div className="space-y-6">
            {/* Test Execution Report */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Test Execution Progress
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{data.testExecution.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{data.testExecution.passed}</p>
                        <p className="text-xs text-gray-600">Passed</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{data.testExecution.failed}</p>
                        <p className="text-xs text-gray-600">Failed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{data.testExecution.skipped}</p>
                        <p className="text-xs text-gray-600">Skipped</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{data.testExecution.notRun}</p>
                        <p className="text-xs text-gray-600">Not Run</p>
                    </div>
                </div>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                {data.testExecution.progress}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                        <div
                            style={{ width: `${(data.testExecution.passed / data.testExecution.total) * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                        <div
                            style={{ width: `${(data.testExecution.failed / data.testExecution.total) * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                        ></div>
                    </div>
                </div>
            </Card>

            {/* Defect Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Defects by Severity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Critical</span>
                            <Badge variant="danger">{data.defectDistribution.bySeverity.critical}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Major</span>
                            <Badge variant="warning">{data.defectDistribution.bySeverity.major}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Minor</span>
                            <Badge variant="info">{data.defectDistribution.bySeverity.minor}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Trivial</span>
                            <Badge variant="default">{data.defectDistribution.bySeverity.trivial}</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Defects by Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Open</span>
                            <Badge variant="danger">{data.defectDistribution.byStatus.open}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">In Progress</span>
                            <Badge variant="warning">{data.defectDistribution.byStatus.inProgress}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Fixed</span>
                            <Badge variant="info">{data.defectDistribution.byStatus.fixed}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Retest</span>
                            <Badge variant="info">{data.defectDistribution.byStatus.retest}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Closed</span>
                            <Badge variant="success">{data.defectDistribution.byStatus.closed}</Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Feature Coverage */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Feature Coverage</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Feature</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Test Cases</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Executed</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Progress</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Defects</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.featureCoverage.map((feature, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-3">
                                        <div className="font-medium text-gray-900">{feature.name}</div>
                                        <div className="text-xs text-gray-500">{feature.featureId}</div>
                                    </td>
                                    <td className="text-center py-3 px-3">{feature.testCases}</td>
                                    <td className="text-center py-3 px-3">{feature.executed}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${feature.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium w-10 text-right">{feature.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="text-center py-3 px-3">
                                        <Badge variant={feature.defects > 0 ? 'danger' : 'success'}>
                                            {feature.defects}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Tester Performance */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tester Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Name</th>
                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Role</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Assigned</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Executed</th>
                                <th className="text-center py-2 px-3 font-semibold text-gray-700">Defects Found</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.testerPerformance.map((tester, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-3 font-medium text-gray-900">{tester.name}</td>
                                    <td className="py-3 px-3">
                                        <Badge variant="outline" className="text-xs">{tester.role}</Badge>
                                    </td>
                                    <td className="text-center py-3 px-3">{tester.assignedTestCases}</td>
                                    <td className="text-center py-3 px-3">{tester.executedTestCases}</td>
                                    <td className="text-center py-3 px-3">
                                        <Badge variant={tester.reportedDefects > 0 ? 'info' : 'default'}>
                                            {tester.reportedDefects}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// Team Tab Component
function TeamTab({ data, currentUser }) {
    if (!data) return <div className="text-center py-12 text-gray-500">Loading team data...</div>;

    return (
        <div className="space-y-6">
            {/* QA Lead */}
            {data.qaLead && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        QA Lead
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                            {data.qaLead.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{data.qaLead.name}</p>
                            <p className="text-sm text-gray-600">{data.qaLead.email}</p>
                            <Badge variant="outline" className="mt-1 text-xs">{data.qaLead.role}</Badge>
                        </div>
                    </div>
                </Card>
            )}

            {/* Team Members */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Team Members</h3>
                {data.teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No team members assigned</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.teamMembers.map((member) => (
                            <Card key={member._id} className="p-4 bg-gray-50 border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {member.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <List className="h-3 w-3" />
                                                {member.assignedTasks.testCases} cases
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Bug className="h-3 w-3" />
                                                {member.assignedTasks.defects} defects
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {member.assignedTasks.testPlans} plans
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
