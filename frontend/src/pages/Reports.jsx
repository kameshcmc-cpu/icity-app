import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data));
  }, []);

  const fmtCur = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <Header title="Reports & Analytics" subtitle="Business performance summary" />

      {data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: fmtCur(data.kpis.totalRevenue), color: 'text-green-600' },
              { label: 'Outstanding Amount', value: fmtCur(data.kpis.outstandingAmount), color: 'text-orange-600' },
              { label: 'Total Orders', value: data.kpis.totalOrders, color: 'text-blue-600' },
              { label: 'Total Customers', value: data.kpis.totalCustomers, color: 'text-purple-600' },
            ].map(k => (
              <div key={k.label} className="card text-center">
                <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                <div className="text-sm text-gray-500 mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
              <div className="space-y-2">
                {[
                  { status: 'pending', count: data.kpis.pendingOrders },
                  { status: 'completed', count: data.kpis.totalOrders - data.kpis.pendingOrders },
                ].map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <StatusBadge status={s.status} />
                    <span className="text-sm font-medium text-gray-700">{s.count} orders</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Status */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
              <div className="space-y-2">
                {[
                  { status: 'overdue', count: data.kpis.overdueInvoices },
                  { status: 'paid', count: data.kpis.totalInvoices - data.kpis.overdueInvoices },
                ].map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <StatusBadge status={s.status} />
                    <span className="text-sm font-medium text-gray-700">{s.count} invoices</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock */}
            <div className="card lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Low Stock Report</h3>
              {data.lowStock.length === 0 ? (
                <p className="text-gray-400 text-sm">All products are adequately stocked.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Current Stock</th>
                      <th className="pb-2">Reorder Level</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.lowStock.map(s => (
                      <tr key={s.name}>
                        <td className="py-2">{s.name}</td>
                        <td className="py-2 text-red-600 font-medium">{s.quantity}</td>
                        <td className="py-2">{s.reorder_level}</td>
                        <td className="py-2"><StatusBadge status="pending" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="card text-center text-gray-400 py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">Detailed reports with PDF/Excel export coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
