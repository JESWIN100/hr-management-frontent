import { Bell, CalendarClock, ListChecks } from 'lucide-react';
import Card from './Card.jsx';

const iconFor = (type) => (type === 'leave' ? CalendarClock : ListChecks);
const tintFor = (type) => (type === 'leave' ? '#3b82f6' : '#f9762f');

const timeAgo = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export default function NotificationsCard({ notifications = [] }) {
  return (
    <Card title="Notifications" icon={Bell}>
      {!notifications.length && <p className="text-xs text-ink-500 py-6 text-center">You're all caught up.</p>}
      <ul className="space-y-3.5">
        {notifications.map((n) => {
          const Icon = iconFor(n.type);
          const tint = tintFor(n.type);
          return (
            <li key={n.id} className="flex items-start gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${tint}1a`, color: tint }}
              >
                <Icon size={13} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-ink-700 leading-snug">{n.message}</p>
                <p className="text-[10px] text-ink-300 mt-0.5">{timeAgo(n.time)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
