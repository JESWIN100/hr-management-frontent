import React, { useState } from 'react';
import { Loader2, AlertCircle, RotateCw, Users, UserCheck, CalendarClock, FolderKanban } from 'lucide-react';
import StatCard from '../components/admindashboard/StatCard';
import CompanyAttendanceCard from '../components/admindashboard/CompanyAttendanceCard';
import ActiveProjectsCard from '../components/admindashboard/ActiveProjectsCard';
import PendingLeavesCard from '../components/admindashboard/PendingLeavesCard';
import Header from '../components/admindashboard/Header';
import adminDashboard from '../hooks/adminDashboard';




export default function Dashboard() {
  const { data, loading, error, refetch } = adminDashboard();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-2 text-ink-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-xs">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-center max-w-xs">
          <AlertCircle className="text-red-500" size={26} />
          <p className="text-sm text-ink-700">{error}</p>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-brand-teal px-3 py-2 rounded-lg hover:bg-brand-teal/90"
          >
            <RotateCw size={13} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Company Overview' },
    { id: 'departments', label: 'Departments' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <div className="min-h-screen bg-surface px-4 py-5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header name={data?.adminProfile?.name} />

        {/* Folder-Style Tab Navigation */}
        <div className="flex px-4 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors relative top-[1px] ${
                activeTab === tab.id
                  ? 'bg-white text-brand-teal border-t border-l border-r border-black/5 z-10'
                  : 'bg-black/[0.02] text-ink-500 hover:bg-black/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Folder Content Card */}
        <div className="bg-white border border-black/5 rounded-b-2xl rounded-tr-2xl shadow-card p-6 min-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Employees" 
                  value={data.overview.totalEmployees} 
                  icon={Users} 
                  tint="#3b82f6" 
                />
                <StatCard 
                  title="Present Today" 
                  value={data.overview.presentToday} 
                  subtitle={`${data.overview.lateToday} late`}
                  icon={UserCheck} 
                  tint="#22c07a" 
                />
                <StatCard 
                  title="On Leave" 
                  value={data.overview.onLeaveToday} 
                  icon={CalendarClock} 
                  tint="#f9762f" 
                />
                <StatCard 
                  title="Active Projects" 
                  value={data.overview.activeProjects} 
                  icon={FolderKanban} 
                  tint="#a855f7" 
                />
              </div>

              {/* Main Content Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Attendance & Leaves */}
                <div className="lg:col-span-2 space-y-6">
                  <CompanyAttendanceCard attendanceData={data.attendanceStats} />
                  <ActiveProjectsCard projects={data.projects} />
                </div>

                {/* Right Column: Actionable items */}
                <div className="space-y-6">
                  <PendingLeavesCard requests={data.pendingLeaves} />
                </div>

              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="flex items-center justify-center h-48 text-ink-500 text-sm">
              Department breakdown coming soon...
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="flex items-center justify-center h-48 text-ink-500 text-sm">
              Financial and performance reports coming soon...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}