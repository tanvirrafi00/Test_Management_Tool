'use client';

import DashboardLayout from '../../components/DashboardLayout';

export default function TestCases() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
                        <p className="text-gray-600 mt-1">Manage your test cases</p>
                    </div>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        + New Test Case
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
                    <p className="text-gray-600">Test cases module coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
