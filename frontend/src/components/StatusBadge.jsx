const STATUS = {
  draft:        'bg-surface-container-highest text-on-surface-variant',
  submitted:    'bg-primary/20 text-primary',
  approved:     'bg-tertiary/20 text-tertiary',
  rejected:     'bg-error/20 text-error',
  pending:      'bg-secondary/20 text-secondary',
  'in-progress':'bg-primary/20 text-primary',
  completed:    'bg-tertiary/20 text-tertiary',
  cancelled:    'bg-error/20 text-error',
  sent:         'bg-primary/20 text-primary',
  paid:         'bg-tertiary/20 text-tertiary',
  partial:      'bg-secondary/20 text-secondary',
  overdue:      'bg-error/20 text-error',
  active:       'bg-tertiary/20 text-tertiary',
  inactive:     'bg-surface-container-highest text-on-surface-variant',
};

export default function StatusBadge({ status }) {
  const cls = STATUS[status] || 'bg-surface-container-highest text-on-surface-variant';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status?.replace('-', ' ')}
    </span>
  );
}
