export default function KPICard({ label, value, sub, subColor = 'muted', icon }) {
  const subColors = {
    muted:  'text-on-surface-variant',
    green:  'text-tertiary',
    red:    'text-error',
    orange: 'text-secondary',
  };
  return (
    <div className="glass-card-hover p-card-padding flex items-center gap-5">
      <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-primary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${subColors[subColor]}`}>{sub}</p>}
      </div>
    </div>
  );
}
