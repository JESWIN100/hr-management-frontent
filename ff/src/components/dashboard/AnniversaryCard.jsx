import { PartyPopper } from 'lucide-react';
import Card from './Card.jsx';
import { resolveAvatar } from '../../utils/avatar.js';
import { IMAGE_BASE_URL } from '../../config/axiosInstance.jsx';

export default function AnniversaryCard({ anniversaries = [] }) {
  return (
    <Card title="Work Anniversaries" icon={PartyPopper} className="bg-brand-teal text-white" dense dark>
      <p className="text-[11px] text-white/60 -mt-2 mb-3">This month</p>
      {!anniversaries.length ? (
        <p className="text-xs text-white/70 py-6 text-center">No anniversaries this month.</p>
      ) : (
        <ul className="space-y-3">
          {anniversaries.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <img
              src={`${IMAGE_BASE_URL}${a?.avatar}`}
                // src={resolveAvatar(a.avatar, a.name)}
                alt={a.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{a.name}</p>
                <p className="text-[10px] text-white/60">
                  {a.years} {a.years === 1 ? 'year' : 'years'} with us
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
