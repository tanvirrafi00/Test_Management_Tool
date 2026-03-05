'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardAPI, projectsAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import QuickActionPanel from '../../components/dashboard/QuickActionPanel';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import QALeadDashboard from '../../components/dashboard/QALeadDashboard';
import QAEngineerDashboard from '../../components/dashboard/QAEngineerDashboard';
import QAAutomationDashboard from '../../components/dashboard/QAAutomationDashboard';
import DeveloperDashboard from '../../components/dashboard/DeveloperDashboard';
import ProductManagerDashboard from '../../components/dashboard/ProductManagerDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectStats, setProjectStats] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [user]);

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

  // Render role-specific dashboard
  const renderRoleSpecificDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <AdminDashboard 
            stats={currentStats} 
            projects={projects}
            loading={loading}
          />
        );
      case 'qa_lead':
        return (
          <QALeadDashboard 
            stats={currentStats}
            features={currentStats?.features}
            defects={currentStats?.defectStats}
            testers={currentStats?.testers}
            loading={loading}
          />
        );
      case 'qa_engineer':
        return (
          <QAEngineerDashboard 
            assignedTestCases={currentStats?.assignedTestCases}
            executionTasks={currentStats?.executionTasks}
            reportedDefects={currentStats?.reportedDefects}
            recentExecutions={currentStats?.recentExecutions}
            loading={loading}
          />
        );
      case 'qa_automation':
        return (
          <QAAutomationDashboard 
            automatedTests={currentStats?.automatedTests}
            executionResults={currentStats?.executionResults}
            automationRuns={currentStats?.automationRuns}
            loading={loading}
          />
        );
      case 'developer':
        return (
          <DeveloperDashboard 
            assignedDefects={currentStats?.assignedDefects}
            defectSeverity={currentStats?.defectSeverity}
            fixedBugs={currentStats?.fixedBugs}
            loading={loading}
          />
        );
      case 'product_manager':
        return (
          <ProductManagerDashboard 
            executionProgress={currentStats?.executionProgress}
            criticalDefects={currentStats?.criticalDefects}
            features={currentStats?.features}
            loading={loading}
          />
        );
      default:
        return (
          <AdminDashboard 
            stats={currentStats} 
            projects={projects}
            loading={loading}
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
        {/* Quick Action Panel */}
        <QuickActionPanel userRole={user?.role} />

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedProjectId && (
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium">← Back to Overview</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProjectId ? currentProject?.name : `${user?.role?.replace('_', ' ').charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProjectId ? 'Project Dashboard' : `Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!selectedProjectId && (user?.role === 'admin' || user?.role === 'qa_lead' || user?.role === 'product_manager') && (
                <button 
                  onClick={() => window.location.href = '/projects?create=true'}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <span className="text-sm font-medium">+ New Project</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Role-Specific Dashboard Content */}
        {selectedProjectId ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Project View</p>
                  <p className="text-xs text-gray-600">Showing detailed information for <span className="font-semibold">{currentProject?.name}</span></p>
                </div>
              </div>
            </div>
            {renderRoleSpecificDashboard()}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {renderRoleSpecificDashboard()}
            
            {/* Projects Grid for overview */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => handleProjectClick(project._id)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{project.description || 'No description'}</p>
                      </div>
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📁</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Test Cases:</span>
                        <span className="font-semibold text-gray-900">{project.totalTestCases || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full" 
                              style={{ width: `${project.executionProgress || 0}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900">{project.executionProgress || 0}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Open Defects:</span>
                        <span className="font-semibold text-rose-600">{project.openDefects || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
