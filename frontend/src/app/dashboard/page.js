'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardAPI } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import {
  FolderKanban,
  FileText,
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
    },
    {
      title: 'Test Cases',
      value: stats?.totalTestCases || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Test Plans',
      value: stats?.totalTestPlans || 0,
      icon: ClipboardList,
      color: 'bg-purple-500',
    },
    {
      title: 'Executions',
      value: stats?.totalExecutions || 0,
      icon: PlayCircle,
      color: 'bg-orange-500',
    },
  ];

  const executionStats = [
    {
      title: 'Pass Rate',
      value: `${stats?.executionStats?.passRate || 0}%`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Fail Rate',
      value: `${stats?.executionStats?.failRate || 0}%`,
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      title: 'Test Coverage',
      value: `${stats?.testCoverage || 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to TestFlow - Your Test Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Execution Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {executionStats.map((stat) => (
            <Card
              key={stat.title}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Defect Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Defect Overview</h2>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-2xl font-bold text-red-600">{stats?.defectStats?.open || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Open</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-2xl font-bold text-yellow-600">{stats?.defectStats?.inProgress || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">In Progress</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-2xl font-bold text-blue-600">{stats?.defectStats?.fixed || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Fixed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-2xl font-bold text-purple-600">{stats?.defectStats?.retest || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Retest</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-2xl font-bold text-green-600">{stats?.defectStats?.closed || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">Closed</p>
            </div>
          </div>
        </Card>

        {/* Execution Progress */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Execution Progress</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-700 bg-primary-50 border border-primary-200/60">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold inline-block text-primary-600">
                  {stats?.executionProgress || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-primary-100">
              <div
                style={{ width: `${stats?.executionProgress || 0}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-700 ease-in-out"
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
