import { Clock3, TimerReset, AlarmClockCheck, AlertTriangle } from 'lucide-react';
import Card from './Card.jsx';

const Stat = ({ icon: Icon, label, value, tint }) => (
  <div className="flex items-center gap-2.5">
    <span
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${tint}1a`, color: tint }}
    >
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-bold text-ink-900 truncate">{value}</p>
      <p className="text-[10px] text-ink-500 truncate">{label}</p>
    </div>
  </div>
);

export default function WorkSummaryCard({ workSummary }) {
  const w = workSummary || {};
  return (
    <Card title="Work Summary" icon={Clock3}>
      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        <Stat icon={AlarmClockCheck} label="Avg. check-in" value={w.avgCheckIn || '—'} tint="#0f4c4a" />
        <Stat icon={TimerReset} label="Avg. hrs / day" value={`${w.avgWorkHours ?? 0}h`} tint="#3b82f6" />
        <Stat icon={Clock3} label="Overtime (mo.)" value={`${w.overtimeHours ?? 0}h`} tint="#22c07a" />
        <Stat icon={AlertTriangle} label="Late check-ins" value={w.lateCheckIns ?? 0} tint="#f9762f" />
      </div>
    </Card>
  );
}
