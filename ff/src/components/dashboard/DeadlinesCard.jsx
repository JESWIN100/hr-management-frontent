import { CalendarDays } from 'lucide-react';
import Card from './Card.jsx';

export default function DeadlinesCard({ tasks }) {
  const list = (tasks?.list || []).filter((t) => t.end_date).slice(0, 5);

  const dayMonth = (d) => {
    const date = new Date(d);
    return {
      day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
    };
  };

  return (
    <Card title="Upcoming Deadlines" icon={CalendarDays}>
      {!list.length && <p className="text-xs text-ink-500 py-6 text-center">Nothing due soon.</p>}
      <ul className="space-y-3">
        {list.map((t) => {
          const { day, month } = dayMonth(t.end_date);
          return (
            <li key={t.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface border border-black/5 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold text-ink-900 leading-none">{day}</span>
                <span className="text-[9px] text-ink-500 leading-none mt-0.5">{month}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-900 truncate">{t.title}</p>
                <p className="text-[10px] text-ink-500 truncate">{t.project_name || 'No project'}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
