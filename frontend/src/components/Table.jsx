export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-outline-variant/30">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="table-th">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-td text-center text-on-surface-variant py-12">
                No records found
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors duration-150 hover:bg-surface-container-high/50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map(col => (
                <td key={col.key} className="table-td">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
