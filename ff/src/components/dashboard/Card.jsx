export default function Card({ title, icon: Icon, action, className = '', children, dense = false, dark = false }) {
  return (
    <div
      className={`rounded-xl2 shadow-card border rounded-4xl border-black/[0.03] shadow-md bg-white ${dense ? 'p-4' : 'p-5'} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center   bg-brand-teal/10 text-brand-teal`}
              >
                <Icon size={15} />
              </span>
            )}
            <h3 className={`text-[15px] font-semibold  text-ink-900`}>{title}</h3>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function ViewAll({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium text-brand-orange hover:text-brand-orange/80 transition-colors"
    >
      View All
    </button>
  );
}
