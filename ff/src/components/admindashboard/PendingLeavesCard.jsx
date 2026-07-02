import React from 'react';
import { CalendarClock, Check, X } from 'lucide-react';

import { IMAGE_BASE_URL } from '../../config/axiosInstance.jsx';
import Card, { ViewAll } from './Card.jsx';

export default function PendingLeavesCard({ requests = [] }) {
  return (
    <Card title="Pending Leave Approvals" icon={CalendarClock} action={<ViewAll />}>
      {!requests.length && (
        <p className="text-xs text-ink-500 py-6 text-center">No pending leave requests.</p>
      )}
      <ul className="space-y-4 mt-2">
        {requests.map((req) => (
          <li key={req.id} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={`${IMAGE_BASE_URL}${req.employee_avatar}`}
                alt={req.employee_name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-900">{req.employee_name}</p>
                <p className="text-[10px] text-ink-500">
                  {new Date(req.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - 
                  {new Date(req.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </p>
                <span className="inline-block mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange">
                  {req.leave_type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button className="w-7 h-7 rounded bg-brand-green/10 text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-colors">
                <Check size={14} />
              </button>
              <button className="w-7 h-7 rounded bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}