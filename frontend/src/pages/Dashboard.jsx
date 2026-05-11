import { useState, useEffect } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : n; }
function fmtCurrency(n) { return '₹' + fmt(n); }

function MetricCard({ label, value, sub, subColor, icon, accent = 'primary' }) {
  const accents = {
    primary:   { icon: 'bg-primary/10 text-primary',   border: 'border-primary/20'   },
    secondary: { icon: 'bg-secondary/10 text-secondary', border: 'border-secondary/20' },
    tertiary:  { icon: 'bg-tertiary/10 text-tertiary',  border: 'border-tertiary/20'  },
    error:     { icon: 'bg-error/10 text-error',        border: 'border-error/20'     },
  };
  const a = accents[accent] || accents.primary;
  const subColors = { green: 'text-tertiary', red: 'text-error', orange: 'text-secondary', muted: 'text-on-surface-variant' };
  return (
    <div className={`glass-card-hover p-6 flex items-center gap-4 border ${a.border}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${a.icon}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-bold text-on-surface truncate">{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${subColors[subColor] || subColors.muted}`}>{sub}</p>}
      </div>
    </div>
  );
}

function StatPill({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 bg-surface-container-high/60 rounded-xl px-4 py-3 border border-outline-variant/20">
      <span className="material-symbols-outlined text-lg text-on-surface-variant">{icon}</span>
      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="text-sm font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

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
    <div className="flex items-center gap-2 text-error p-4">
      <span className="material-symbols-outlined">error</span>
      Failed to load dashboard
    </div>
  );

  const { kpis, lowStock, recentOrders, recentPayments } = data;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time business performance overview</p>
        </div>
        <button className="btn-primary">
          <span className="material-symbols-outlined text-lg">download</span>
          Export Report
        </button>
      </div>

      {/* Bento Row 1 — Revenue hero + 4 metric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Revenue hero card */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between min-h-[180px] border border-secondary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl font-extrabold text-secondary">{fmtCurrency(kpis.totalRevenue)}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: kpis.totalRevenue > 0 ? '72%' : '0%' }} />
            </div>
            <span className="text-xs text-on-surface-variant whitespace-nowrap">vs target</span>
          </div>
        </div>

        {/* Outstanding */}
        <div className="lg:col-span-3">
          <MetricCard
            label="Outstanding"
            value={fmtCurrency(kpis.outstandingAmount)}
            sub="Awaiting collection"
            subColor="orange"
            icon="schedule"
            accent="secondary"
          />
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <MetricCard
            label="Orders"
            value={kpis.totalOrders}
            sub={`${kpis.pendingOrders} pending`}
            subColor="orange"
            icon="shopping_cart"
            accent="primary"
          />
        </div>

        {/* Invoices */}
        <div className="lg:col-span-2">
          <MetricCard
            label="Invoices"
            value={kpis.totalInvoices}
            sub={`${kpis.overdueInvoices} overdue`}
            subColor="red"
            icon="receipt_long"
            accent="error"
          />
        </div>
      </div>

      {/* Stat pills row */}
      <div className="flex flex-wrap gap-3">
        <StatPill label="Customers" value={kpis.totalCustomers} icon="group" />
        <StatPill label="Products" value={kpis.totalProducts} icon="inventory_2" />
        <StatPill label="Suppliers" value={kpis.totalSuppliers ?? '—'} icon="local_shipping" />
      </div>

      {/* Bento Row 2 — Recent Orders + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Orders table */}
        <div className="lg:col-span-8 glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">shopping_cart</span>
              <h3 className="font-semibold text-on-surface">Recent Orders</h3>
            </div>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant text-sm">No orders yet</div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-outline-variant/20">
                <tr>
                  <th className="table-th">Order #</th>
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

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Low Stock */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error text-xl">warning</span>
              <h3 className="font-semibold text-on-surface">Low Stock</h3>
            </div>
            {lowStock.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                All stock levels healthy
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map(s => (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-on-surface truncate">{s.name}</span>
                    <span className="text-xs font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full shrink-0">{s.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-tertiary text-xl">payments</span>
              <h3 className="font-semibold text-on-surface">Recent Payments</h3>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-on-surface font-medium truncate">{p.customer_name || '—'}</div>
                      <div className="text-xs text-on-surface-variant capitalize">{p.payment_method}</div>
                    </div>
                    <span className="text-sm font-bold text-tertiary shrink-0">{fmtCurrency(p.amount)}</span>
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
