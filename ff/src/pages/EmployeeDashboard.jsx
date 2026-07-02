import { Loader2, AlertCircle, RotateCw } from 'lucide-react';
import useDashboard from '../hooks/useDashboard.js';

import Header from '../components/dashboard/Header.jsx';
import ProfileCard from '../components/dashboard/ProfileCard.jsx';
import LeaveDonutCard from '../components/dashboard/LeaveDonutCard.jsx';
import WorkSummaryCard from '../components/dashboard/WorkSummaryCard.jsx';
import AttendanceCard from '../components/dashboard/AttendanceCard.jsx';
import ProjectsCard from '../components/dashboard/ProjectsCard.jsx';
import TasksCard from '../components/dashboard/TasksCard.jsx';
import PerformanceCard from '../components/dashboard/PerformanceCard.jsx';
import SkillsCard from '../components/dashboard/SkillsCard.jsx';
import AnniversaryCard from '../components/dashboard/AnniversaryCard.jsx';
import TeamMembersCard from '../components/dashboard/TeamMembersCard.jsx';
import NotificationsCard from '../components/dashboard/NotificationsCard.jsx';
import DeadlinesCard from '../components/dashboard/DeadlinesCard.jsx';

export default function EmployeeDashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-2 text-ink-500">
          <Loader2 className="animate-spin" size={22} />
          <p className="text-xs">Loading your dashboard…</p>
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

  return (
    <div className="min-h-screen bg-surface px-4 py-5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header name={data.profile?.name} />

        {/* Row 1 — profile, leave, work summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ProfileCard profile={data.profile} />
          <LeaveDonutCard leave={data.leave} />
          <WorkSummaryCard workSummary={data.workSummary} />
        </div>

        {/* Row 2 — attendance clock/weekly hours full width */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <AttendanceCard attendance={data.attendance} />
        </div>

        {/* Row 3 — projects + tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ProjectsCard projects={data.projects} />
          <TasksCard tasks={data.tasks} />
        </div>

        {/* Row 4 — performance, skills, anniversaries */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"> */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          <PerformanceCard performance={data.performance} />
          {/* <SkillsCard skills={data.skills} /> */}
          {/* <AnniversaryCard anniversaries={data.anniversaries} /> */}
        </div>

        {/* Row 5 — team, notifications, deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeamMembersCard team={data.team} />
          <NotificationsCard notifications={data.notifications} />
          <DeadlinesCard tasks={data.tasks} />
        </div>
      </div>
    </div>
  );
}
