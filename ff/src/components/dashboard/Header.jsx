import { Download } from 'lucide-react';

export default function Header({ name }) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        {/* <h1 className="text-xl font-bold text-ink-900">Employee Dashboard</h1> */}
        <p className="text-xs text-ink-500 mt-0.5">
          {/* Dashboard <span className="mx-1">/</span>{' '} */}
          {/* <span className="text-ink-700">Employee Dashboard</span> */}
          {name ? <span className="text-ink-300"> · Welcome back, {name.split(' ')[0]}</span> : null}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* <button className="flex items-center gap-2 text-xs font-medium text-ink-700 bg-white border border-black/5 shadow-card px-3 py-2 rounded-lg hover:bg-surface transition-colors">
          <Download size={14} /> Export
        </button> */}
        <span className="text-xs text-ink-500 bg-white border border-black/5 shadow-card px-3 py-2 rounded-lg">
          {today}
        </span>
      </div>
    </div>
  );
}
