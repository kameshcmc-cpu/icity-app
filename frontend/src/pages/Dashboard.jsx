import { useState, useEffect } from 'react';
import api from '../api';
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

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin">refresh</span>
      Loading dashboard...
    </div>
  );
  if (!data) return (
    <div className="flex items-center gap-2 text-error">
      <span className="material-symbols-outlined">error</span>
      Failed to load dashboard
    </div>
  );

  const { kpis, lowStock, recentOrders, recentPayments } = data;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time business performance overview</p>
        </div>
        <button className="btn-primary">
          <span className="material-symbols-outlined text-lg">download</span>
          Export Report
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-gutter mb-8">
        <div className="xl:col-span-2">
          <KPICard label="Total Revenue" value={fmtCurrency(kpis.totalRevenue)} icon="payments" subColor="green" />
        </div>
        <div className="xl:col-span-2">
          <KPICard label="Outstanding" value={fmtCurrency(kpis.outstandingAmount)} icon="schedule" subColor="orange" />
        </div>
        <div className="xl:col-span-1">
          <KPICard label="Orders" value={kpis.totalOrders} sub={`${kpis.pendingOrders} pending`} icon="shopping_cart" subColor="orange" />
        </div>
        <div className="xl:col-span-1">
          <KPICard label="Invoices" value={kpis.totalInvoices} sub={`${kpis.overdueInvoices} overdue`} icon="receipt_long" subColor="red" />
        </div>
        <div className="xl:col-span-1">
          <KPICard label="Customers" value={kpis.totalCustomers} icon="group" />
        </div>
        <div className="xl:col-span-1">
          <KPICard label="Products" value={kpis.totalProducts} icon="inventory_2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-card-padding py-5 border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Recent Orders</h3>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-card-padding py-10 text-center text-on-surface-variant text-sm">No orders yet</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-outline-variant/20">
                <tr>
                  <th className="table-th">Order</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentOrders.map(o => (
                  <tr key={o.order_number} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="table-td font-semibold text-secondary">{o.order_number}</td>
                    <td className="table-td text-on-surface-variant">{o.customer_name || '—'}</td>
                    <td className="table-td"><StatusBadge status={o.status} /></td>
                    <td className="table-td text-right font-semibold">{fmtCurrency(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-gutter">

          {/* Low Stock */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-error text-xl">warning</span>
              <h3 className="font-semibold text-on-surface">Low Stock Alerts</h3>
            </div>
            {lowStock.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                All stock levels healthy
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-on-surface truncate">{s.name}</span>
                    <span className="text-xs font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full ml-2">{s.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-tertiary text-xl">payments</span>
              <h3 className="font-semibold text-on-surface">Recent Payments</h3>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-on-surface font-medium">{p.customer_name || '—'}</div>
                      <div className="text-xs text-on-surface-variant capitalize">{p.payment_method}</div>
                    </div>
                    <span className="text-sm font-bold text-tertiary">{fmtCurrency(p.amount)}</span>
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
