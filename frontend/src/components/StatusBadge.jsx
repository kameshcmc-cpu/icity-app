const STATUS_COLORS = {
  draft:       'bg-gray-100 text-gray-700',
  submitted:   'bg-blue-100 text-blue-700',
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  pending:     'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  sent:        'bg-purple-100 text-purple-700',
  paid:        'bg-green-100 text-green-700',
  partial:     'bg-orange-100 text-orange-700',
  overdue:     'bg-red-100 text-red-700',
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-gray-100 text-gray-600',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status?.replace('-', ' ')}
    </span>
  );
}
