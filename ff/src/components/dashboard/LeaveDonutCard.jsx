import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalendarClock } from 'lucide-react';
import Card from './Card.jsx';

export default function LeaveDonutCard({ leave }) {
  const types = leave?.types?.filter((t) => t.total > 0) || [];
  const chartData = types.length
    ? types.map((t) => ({ name: t.name, value: t.used || 0.0001, color: t.color }))
    : [{ name: 'No data', value: 1, color: '#e5e7eb' }];

  return (
    <Card title="Leave Details" icon={CalendarClock}>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={30}
                outerRadius={44}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${Math.round(v)} days`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-ink-900">{leave?.totalAvailable ?? 0}</span>
            <span className="text-[9px] text-ink-500">Available</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 text-[11px] text-ink-700">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <span className="truncate">{t.name}</span>
              <span className="ml-auto font-medium text-ink-900">{t.used}/{t.total}</span>
            </div>
          ))}
          {!types.length && <p className="text-xs text-ink-500 col-span-2">No leave types configured yet.</p>}
        </div>
      </div>
    </Card>
  );
}
