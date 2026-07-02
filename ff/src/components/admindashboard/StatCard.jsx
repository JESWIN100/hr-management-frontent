import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, tint }) {
  return (
    <div className="rounded-2xl border border-black/[0.03] shadow-sm bg-white p-5 flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${tint}15`, color: tint }}
      >
        <Icon size={22} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-ink-500">{title}</h4>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-2xl font-bold text-ink-900">{value}</p>
          {subtitle && <span className="text-[10px] text-brand-orange font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}