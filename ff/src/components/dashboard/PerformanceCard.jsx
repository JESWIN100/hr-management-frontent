import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import Card from './Card.jsx';

export default function PerformanceCard({ performance = [] }) {
  const latest = performance.length ? performance[performance.length - 1].score : null;

  return (
    <Card
      title="Performance"
      icon={TrendingUp}
      action={
        latest !== null && (
          <span className="text-xs font-semibold text-brand-green">{latest}%</span>
        )
      }
    >
      {!performance.length ? (
        <p className="text-xs text-ink-500 py-10 text-center">No completed tasks yet to chart performance.</p>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#f0f2f4" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a6afb6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a6afb6' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip formatter={(v) => [`${v}%`, 'Task completion']} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22c07a"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22c07a' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-[10px] text-ink-500 mt-1">Based on your on-time task completion rate over the last 6 months.</p>
    </Card>
  );
}
