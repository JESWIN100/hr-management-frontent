import { FolderKanban } from 'lucide-react';
import Card, { ViewAll } from './Card.jsx';
import { resolveAvatar } from '../../utils/avatar.js';
import { IMAGE_BASE_URL } from '../../config/axiosInstance.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—');

export default function ProjectsCard({ projects = [] }) {
  return (
    <Card title="Ongoing Projects" icon={FolderKanban} action={<ViewAll />}>
      {!projects.length && (
        <p className="text-xs text-ink-500 py-6 text-center">You're not assigned to any active projects.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl border border-black/5 p-3.5 hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue capitalize shrink-0 ml-2">
                {p.status || 'active'}
              </span>
            </div>
            <p className="text-[11px] text-ink-500 mt-1">
              {fmt(p.startDate)} – {fmt(p.endDate)}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {p.members.slice(0, 4).map((m) => (
                  <img
                    key={m.id}
                    src={`${IMAGE_BASE_URL}${m?.avatar}`}
                    // src={resolveAvatar(m.avatar, m.name)}
                    alt={m.name}
                    title={m.name}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                  />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1.5 w-24">
                <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                  <div className="h-full bg-brand-green" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-[10px] text-ink-500 tabular-nums">{p.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
