import React from 'react';

export default function Card({ 
  title, 
  icon: Icon, 
  action, 
  className = '', 
  children, 
  dense = false 
}) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.03] shadow-sm bg-white flex flex-col ${
        dense ? 'p-4' : 'p-5'
      } ${className}`}
    >
      {/* Card Header (Only renders if title or action is passed) */}
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-teal/10 text-brand-teal shrink-0">
                <Icon size={16} strokeWidth={2.5} />
              </span>
            )}
            {title && (
              <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
            )}
          </div>
          {action && <div className="shrink-0 pl-3">{action}</div>}
        </div>
      )}
      
      {/* Card Body */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

export function ViewAll({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold text-brand-orange hover:text-brand-orange/80 transition-colors"
    >
      View All
    </button>
  );
}