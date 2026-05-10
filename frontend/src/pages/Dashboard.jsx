import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : n; }
function fmtCurrency(n) { return '₹' + fmt(n); }

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>;
  if (!data) return <div className="text-red-500">Failed to load dashboard</div>;

  const { kpis, lowStock, recentOrders, recentPayments } = data;

  return (
    <div>
      <Header title="Dashboard" subtitle="Business overview at a glance" />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Revenue" value={fmtCurrency(kpis.totalRevenue)} icon="💰" color="green" />
        <KPICard label="Outstanding" value={fmtCurrency(kpis.outstandingAmount)} icon="⏳" color="orange" />
        <KPICard label="Total Orders" value={kpis.totalOrders} sub={`${kpis.pendingOrders} pending`} icon="🛒" color="blue" />
        <KPICard label="Total Invoices" value={kpis.totalInvoices} sub={`${kpis.overdueInvoices} overdue`} icon="🧾" color="purple" />
        <KPICard label="Customers" value={kpis.totalCustomers} icon="👥" color="blue" />
        <KPICard label="Products" value={kpis.totalProducts} icon="📦" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o => (
                  <tr key={o.order_number}>
                    <td className="py-2.5 text-sm font-medium text-brand-600">{o.order_number}</td>
                    <td className="py-2.5 text-sm text-gray-700">{o.customer_name || '—'}</td>
                    <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-sm text-gray-900 text-right font-medium">{fmtCurrency(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock + Recent Payments */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm">All stock levels are healthy</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{s.name}</span>
                    <span className="text-xs font-medium text-red-600 ml-2">{s.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Payments</h3>
            {recentPayments.length === 0 ? (
              <p className="text-gray-400 text-sm">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {recentPayments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-700">{p.customer_name || '—'}</div>
                      <div className="text-xs text-gray-400 capitalize">{p.payment_method}</div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{fmtCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
