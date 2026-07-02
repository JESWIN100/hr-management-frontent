import { Users } from 'lucide-react';
import Card, { ViewAll } from './Card.jsx';
import { resolveAvatar } from '../../utils/avatar.js';
import { IMAGE_BASE_URL } from '../../config/axiosInstance.jsx';

export default function TeamMembersCard({ team = [] }) {
  console.log("team",team);
  
  return (
    <Card title="Team Members" icon={Users} action={<ViewAll />}>
      {!team.length && <p className="text-xs text-ink-500 py-6 text-center">No other members in your department yet.</p>}
      <ul className="space-y-3">
        {team.map((m) => (
          <li key={m.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
              src={`${IMAGE_BASE_URL}${m?.avatar}`}
              //  src={resolveAvatar(m.avatar, m.name)} 
               alt={m.name} className="w-9 h-9 rounded-full object-cover" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  m.isonline ? 'bg-brand-green' : 'bg-ink-300'
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-900 truncate">{m.name}</p>
              <p className="text-[10px] text-ink-500 truncate">{m.designation || 'Team member'}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
