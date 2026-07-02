import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Fingerprint, Circle } from 'lucide-react';
import Card from './Card.jsx';

export default function AttendanceCard({ attendance }) {
  console.log("attendance",attendance);
  
  const today = attendance?.today;
  const weekly = attendance?.weekly || [];

  const checkInLabel = today?.checkInTime
    ? new Date(today.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const barColor = (h) => (h >= 8 ? '#22c07a' : h >= 4 ? '#f9762f' : '#e5e7eb');

  return (
    <Card title="Attendance" icon={Fingerprint}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold text-ink-900 tabular-nums">{checkInLabel}</p>
          <p className="text-[11px] text-ink-500 mt-0.5 flex items-center gap-1">
            <Circle
              size={7}
              className={today?.isCheckedIn ? 'fill-brand-green text-brand-green' : 'fill-ink-300 text-ink-300'}
            />
            {today?.isCheckedIn ? 'Punched in' : today?.checkInTime ? 'Punched out' : 'Not punched in'}
          </p>
          <p className="text-[11px] text-ink-500 mt-2">
            Worked today: <span className="font-semibold text-ink-900">{today?.workedHoursToday ?? 0}h</span>
          </p>
        </div>

        <button
          disabled={!today?.isCheckedIn}
          className="px-4 py-2 rounded-xl bg-brand-orange text-black text-xs font-semibold shadow-sm disabled:opacity-40 hover:bg-brand-orange/90 transition-colors"
        >
          Punch Out
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium text-ink-500 mb-2">This week</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} barSize={14}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#a6afb6' }}
              />
              <Tooltip formatter={(v) => [`${v}h`, 'Hours']} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="hours" radius={[5, 5, 5, 5]}>
                {weekly.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.hours)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
