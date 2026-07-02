import { Mail, Phone, Building2, CalendarDays } from 'lucide-react';
import Card from './Card.jsx';
import { resolveAvatar } from '../../utils/avatar.js';
import { IMAGE_BASE_URL } from '../../config/axiosInstance.jsx';

export default function ProfileCard({ profile }) {
  if (!profile) return null;

  const joined = profile.joining_date
    ? new Date(profile.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-3">
        <img
        src={`${IMAGE_BASE_URL}${profile?.avatar}`}
          // src={resolveAvatar(profile.avatar, profile.name)}
          alt={profile.name}
          className="w-14 h-14 rounded-2xl object-cover ring-fuchsia-600 ring-2 ring-brand-teal/10"
        />
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate">{profile.name}</p>
          <p className="text-xs text-ink-500 truncate">{profile.designation || profile.role_name || 'Employee'}</p>
          <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
            {profile.employment_status || 'Active'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 text-xs text-ink-700">
        <div className="flex items-center gap-2">
          <Phone size={13} className="text-ink-300 shrink-0" />
          <span className="truncate">{profile.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={13} className="text-ink-300 shrink-0" />
          <span className="truncate">{profile.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-ink-300 shrink-0" />
          <span className="truncate">{profile.department_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-ink-300 shrink-0" />
          <span className="truncate">Joined {joined}</span>
        </div>
      </div>
    </Card>
  );
}
