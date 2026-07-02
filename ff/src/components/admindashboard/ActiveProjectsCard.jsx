import React from 'react';
import { FolderKanban } from 'lucide-react';
import Card, { ViewAll } from './Card.jsx';

const statusStyle = {
  active: 'bg-brand-blue/10 text-brand-blue',
  'on hold': 'bg-brand-amber/10 text-brand-amber',
  delayed: 'bg-red-500/10 text-red-500',
  default: 'bg-ink-300/10 text-ink-500',
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—');

export default function ActiveProjectsCard({ projects = [] }) {
  return (
    <Card title="Active Projects" icon={FolderKanban} action={<ViewAll />}>
      {!projects.length && (
        <p className="text-xs text-ink-500 py-6 text-center">No active projects currently.</p>
      )}

      <div className="space-y-3 mt-2">
        {projects.map((p) => {
          const statusKey = String(p.status || 'active').toLowerCase();
          const badgeStyle = statusStyle[statusKey] || statusStyle.default;

          return (
            <div key={p.id} className="p-3.5 rounded-xl border border-black/5 hover:bg-surface transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-semibold text-ink-900 truncate">{p.name}</h4>
                  <p className="text-[10px] text-ink-500 mt-0.5">
                    {fmt(p.start_date)} – {fmt(p.end_date)}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${badgeStyle}`}>
                  {p.status || 'Active'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                  <div 
                    className="h-full bg-brand-teal transition-all duration-500" 
                    style={{ width: `${p.progress || 0}%` }} 
                  />
                </div>
                <span className="text-[10px] font-medium text-ink-700 tabular-nums w-8 text-right">
                  {p.progress || 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}