import { ListChecks } from 'lucide-react';
import Card, { ViewAll } from './Card.jsx';

const statusStyle = {
  new: 'bg-ink-300/10 text-ink-500',
  'in progress': 'bg-brand-amber/10 text-brand-amber',
  completed: 'bg-brand-green/10 text-brand-green',
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—');

export default function TasksCard({ tasks }) {
  const { counts, list } = tasks || { counts: {}, list: [] };

  return (
    <Card title="My Tasks" icon={ListChecks} action={<ViewAll />}>
      <div className="flex items-center gap-4 mb-4 text-[11px]">
        <span className="text-ink-500">Pending <b className="text-ink-900">{counts.pending || 0}</b></span>
        <span className="text-ink-500">In progress <b className="text-ink-900">{counts.inProgress || 0}</b></span>
        <span className="text-ink-500">Overdue <b className="text-red-500">{counts.overdue || 0}</b></span>
      </div>

      {!list?.length && <p className="text-xs text-ink-500 py-6 text-center">You're all caught up — no open tasks.</p>}

      <ul className="space-y-2.5">
        {list?.map((t) => {
          const key = String(t.status || 'new').toLowerCase();
          return (
            <li key={t.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-900 truncate">{t.title}</p>
                <p className="text-[10px] text-ink-500 truncate">
                  {t.project_name || 'No project'} · Due {fmt(t.end_date)}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyle[key] || statusStyle.new}`}>
                {t.status || 'New'}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
