import React, { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
  <div className="p-8 h-full overflow-y-auto font-bold tracking-tight">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what's happening today.</p>
      </header>

      {/* Main Folder-Style Content Card */}
      {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
       
        <div className="flex bg-gray-50/50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-4 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-brand-600 shadow-[0_2px_0_0_#0f172a_inset]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Key Metrics
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-8 py-4 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'activity'
                ? 'bg-white text-brand-600 shadow-[0_2px_0_0_#0f172a_inset]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            Recent Activity
          </button>
        </div>

       
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                <p className="text-sm font-medium text-blue-600 mb-2">Total Employees</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">142</h3>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">+4 this month</span>
                </div>
              </div>

          
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                <p className="text-sm font-medium text-orange-600 mb-2">On Leave Today</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">8</h3>
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-md">3 Pending</span>
                </div>
              </div>

           
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-6">
                <p className="text-sm font-medium text-purple-600 mb-2">Open Positions</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">5</h3>
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-md">12 Candidates</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {[
                { name: 'Sarah Jenkins', action: 'requested PTO for Dec 24-26', time: '2 hours ago' },
                { name: 'Marcus Ray', action: 'signed the new employee handbook', time: '4 hours ago' },
                { name: 'Payroll System', action: 'processed November salaries successfully', time: 'Yesterday' },
              ].map((log, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-brand-500"></div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{log.name}</span> {log.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}