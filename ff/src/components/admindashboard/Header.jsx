import React from 'react';
// import { Download } from 'lucide-react';

export default function Header({ name, title }) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        {/* Uncomment below if you want the dynamic title to show */}
        {/* {title && <h1 className="text-xl font-bold text-ink-900">{title}</h1>} */}
        
        <p className="text-xs text-ink-500 mt-0.5">
          {title && <span className="font-medium text-ink-700">{title}</span>}
          {title && name && <span className="mx-1">·</span>}
          {name ? <span className="text-ink-500">Welcome back, {name.split(' ')[0]}</span> : null}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* <button className="flex items-center gap-2 text-xs font-medium text-ink-700 bg-white border border-black/5 shadow-card px-3 py-2 rounded-lg hover:bg-surface transition-colors">
          <Download size={14} /> Export
        </button> */}
        <span className="text-xs font-medium text-ink-700 bg-white border border-black/5 shadow-sm px-3 py-2 rounded-lg">
          {today}
        </span>
      </div>
    </div>
  );
}