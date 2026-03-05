'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardAPI, projectsAPI } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import ProjectCard from '../../components/dashboard/ProjectCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { TestCaseStatusChart, DefectSeverityChart } from '../../components/dashboard/DashboardCharts';
import { Select } from '../../components/ui/Select';
import {
  Folder,
  FileText,
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Zap,
  ChevronRight,
  Target,
  Plus,
  Activity,
  BarChart3,
  CheckCircle2 as CheckCircle,
  Clock,
  AlertCircle,
  LineChart as LineChartIcon,
  Search,
  Download,
  FileSpreadsheet,
  FileText as FileTextIcon,
  PieChart,
  Users,
  Settings,
  UserPlus,
  Shield,
  Code,
  GitBranch,
  Rocket,
  Calendar,
  Timer
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, projectsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        projectsAPI.getAll(),
        dashboardAPI.getRecentActivity()
      ]);
      setStats(statsRes.data.data);
      setProjects(projectsRes.data.data);
      setActivity(activityRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async (projectId) => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStats({ project: projectId });
      setProjectStats(response.data.data);
      setSelectedProjectId(projectId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOverview = () => {
    setSelectedProjectId(null);
    setProjectStats(null);
  };

  const handleExportReport = async (reportType, format = 'csv') => {
    try {
      const params = selectedProjectId ? { project: selectedProjectId } : {};
      await dashboardAPI.exportReport(reportType, format, params);
      console.log(`Exporting ${reportType} as ${format} for project: ${selectedProjectId || 'all'}`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600 mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Workspace</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStats = selectedProjectId ? projectStats : stats;
  const currentProject = projects.find(p => p._id === selectedProjectId);

  // Role-specific dashboard components
  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Admin-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-violet-50 border-violet-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <Folder className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Test Plans</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTestPlans || 0}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Open Defects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.open || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across all projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* Projects Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${Math.floor(Math.random() * 100)}ms` }}
            >
              <ProjectCard project={project} onClick={handleProjectClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQALeadDashboard = () => (
    <div className="space-y-8">
      {/* QA Lead-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">My Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-indigo-50 border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Test Plans</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTestPlans || 0}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.executionStats?.passRate || 0}%</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Open Defects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.open || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across your projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* Projects Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${Math.floor(Math.random() * 100)}ms` }}
            >
              <ProjectCard project={project} onClick={handleProjectClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQAEngineerDashboard = () => (
    <div className="space-y-8">
      {/* QA Engineer-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">My Test Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTestCases || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-indigo-50 border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Executions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalExecutions || 0}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <PlayCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Passed</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.executionStats?.pass || 0}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Defects Created</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.open || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across your projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* My Projects */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${Math.floor(Math.random() * 100)}ms` }}
            >
              <ProjectCard project={project} onClick={handleProjectClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDeveloperDashboard = () => (
    <div className="space-y-8">
      {/* Developer-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Assigned Defects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.open || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-amber-50 border-amber-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.inProgress || 0}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Fixed</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.fixed || 0}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across your projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* Projects Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onClick={handleProjectClick} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductManagerDashboard = () => (
    <div className="space-y-8">
      {/* Product Manager-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Test Coverage</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.testCoverage || 0}%</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-indigo-50 border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.executionStats?.passRate || 0}%</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Open Defects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.defectStats?.open || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across all projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* Projects Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onClick={handleProjectClick} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderQAAutomationDashboard = () => (
    <div className="space-y-8">
      {/* QA Automation-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Automated Tests</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTestCases || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-indigo-50 border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Executions</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalExecutions || 0}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <PlayCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.executionStats?.passRate || 0}%</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Failures</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.executionStats?.fail || 0}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* View Reports Button */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Reports</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed reports and export data across your projects</p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </Card>

      {/* Charts - Overall Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TestCaseStatusChart data={stats?.executionStats} title="Overall Test Status Distribution" />
        <DefectSeverityChart data={stats?.defectStats} title="Overall Defect Severity" />
      </div>

      {/* My Projects */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${Math.floor(Math.random() * 100)}ms` }}
            >
              <ProjectCard project={project} onClick={handleProjectClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render role-specific dashboard
  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'qa_lead':
        return renderQALeadDashboard();
      case 'qa_engineer':
        return renderQAEngineerDashboard();
      case 'developer':
        return renderDeveloperDashboard();
      case 'product_manager':
        return renderProductManagerDashboard();
      case 'qa_automation':
        return renderQAAutomationDashboard();
      default:
        return renderQAEngineerDashboard();
    }
  };

  // Data source indicator component
  const DataSourceIndicator = ({ source }) => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      <span>Source: {source}</span>
    </div>
  );

  // Reports section (common for all roles)
  const renderReportsSection = () => (
    <div className="space-y-8">
      {/* Project Selector for Reports */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedProjectId
                ? `Showing reports for: ${currentProject?.name}`
                : 'Select a project to view project-specific reports, or leave empty for all projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:flex-none sm:w-64">
              <Select
                value={selectedProjectId || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    setSelectedProjectId(null);
                    setProjectStats(null);
                  } else {
                    setSelectedProjectId(value);
                    handleProjectClick(value);
                  }
                }}
                options={[
                  { label: 'All Projects', value: 'all' },
                  ...projects.map(p => ({ label: p.name, value: p._id }))
                ]}
                containerClassName="mb-0"
                className="rounded-xl py-2.5"
              />
            </div>
            {selectedProjectId && (
              <button
                onClick={handleBackToOverview}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      </Card>

      {selectedProjectId && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Folder className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Project-Specific Reports</p>
              <p className="text-xs text-gray-600">Showing reports for: <span className="font-semibold">{currentProject?.name}</span></p>
            </div>
          </div>
        </Card>
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedProjectId ? `Reports for ${currentProject?.name}` : 'Available Reports'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Execution Summary Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Execution Summary</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Overview of all test executions</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('execution-summary', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('execution-summary', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tester-wise Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Tester-wise Report</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Performance by individual testers</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('tester-wise', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('tester-wise', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Release-wise Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Release-wise Report</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Test results by release version</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('release-wise', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('release-wise', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Defect Summary Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Defect Summary</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Overview of all defects</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('defect-summary', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('defect-summary', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Test Coverage Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Target className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Test Coverage</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Coverage analysis and metrics</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('test-coverage', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('test-coverage', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Report */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Activity Report</h3>
                  {selectedProjectId && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Project Specific</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Recent activities and changes</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportReport('activity', 'csv')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileSpreadsheet className="h-3 w-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportReport('activity', 'pdf')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <FileTextIcon className="h-3 w-3" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // Get role-specific title
  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'qa_lead':
        return 'QA Lead Dashboard';
      case 'qa_engineer':
        return 'QA Engineer Dashboard';
      case 'developer':
        return 'Developer Dashboard';
      case 'product_manager':
        return 'Product Manager Dashboard';
      case 'qa_automation':
        return 'QA Automation Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {selectedProjectId && (
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to Overview</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProjectId ? currentProject?.name : getRoleTitle()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProjectId ? 'Project Dashboard' : `Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search projects, reports, or activities..."
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 shadow-sm focus:shadow-md w-64"
                />
              </div>
              {!selectedProjectId && (user?.role === 'admin' || user?.role === 'qa_lead') && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">New Project</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-200">
            {['overview', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div>
            {selectedProjectId ? (
              <div className="space-y-8">
                {/* Project-specific view */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 bg-blue-50 border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Test Cases</p>
                        <p className="text-3xl font-bold text-gray-900">{currentStats?.totalTestCases || 0}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-emerald-50 border-emerald-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Test Plans</p>
                        <p className="text-3xl font-bold text-gray-900">{currentStats?.totalTestPlans || 0}</p>
                      </div>
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-indigo-50 border-indigo-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Executions</p>
                        <p className="text-3xl font-bold text-gray-900">{currentStats?.totalExecutions || 0}</p>
                      </div>
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <PlayCircle className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-rose-50 border-rose-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">Open Defects</p>
                        <p className="text-3xl font-bold text-gray-900">{currentStats?.defectStats?.open || 0}</p>
                      </div>
                      <div className="p-3 bg-rose-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-rose-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 bg-emerald-50 border-emerald-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Pass Rate</p>
                        <p className="text-xl font-bold text-gray-900">{currentStats?.executionStats?.passRate || 0}%</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-rose-50 border-rose-100">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Fail Rate</p>
                        <p className="text-xl font-bold text-gray-900">{currentStats?.executionStats?.failRate || 0}%</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-blue-50 border-blue-100">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Test Coverage</p>
                        <p className="text-xl font-bold text-gray-900">{currentStats?.testCoverage || 0}%</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-100">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">Execution Progress</p>
                        <p className="text-xl font-bold text-gray-900">{currentStats?.executionProgress || 0}%</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* View Reports Button */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Project Reports</h3>
                      <p className="text-sm text-gray-600 mt-1">View detailed reports and export data for this project</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-medium">View Reports</span>
                    </button>
                  </div>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TestCaseStatusChart data={currentStats?.executionStats} title="Test Status Distribution" />
                  <DefectSeverityChart data={currentStats?.defectStats} title="Defect Severity" />
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                {renderRoleSpecificDashboard()}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {renderReportsSection()}
          </div>
        )}

        {/* Activity Feed */}
        <div className="mt-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <ActivityFeed activities={activity} loading={loading} isSidebar={false} />
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
