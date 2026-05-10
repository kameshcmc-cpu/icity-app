import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyLine = () => ({ product_id: '', description: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 });

export default function Invoices() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', due_date: '', notes: '', items: [emptyLine()] });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/invoices').then(r => setItems(r.data));
  useEffect(() => {
    load();
    api.get('/customers').then(r => setCustomers(r.data));
    api.get('/products').then(r => setProducts(r.data));
  }, []);

  function updateLine(i, key, val) {
    setForm(prev => {
      const lines = [...prev.items];
      lines[i] = { ...lines[i], [key]: val };
      if (key === 'product_id') {
        const p = products.find(p => String(p.id) === String(val));
        if (p) { lines[i].unit_price = p.price; lines[i].tax_rate = p.tax_rate || 0; }
      }
      const l = lines[i];
      lines[i].total = l.quantity * l.unit_price;
      return { ...prev, items: lines };
    });
  }

  const lineTotal = form.items.reduce((s, l) => s + (l.total || 0), 0);

  async function save() {
    setSaving(true);
    try {
      await api.post('/invoices', form);
      await load(); setModal(false);
      setForm({ customer_id: '', due_date: '', notes: '', items: [emptyLine()] });
    } finally { setSaving(false); }
  }

  async function updateStatus(id, status) {
    await api.put(`/invoices/${id}/status`, { status }); load();
  }

  async function remove(inv) {
    if (!confirm(`Delete ${inv.invoice_number}?`)) return;
    await api.delete(`/invoices/${inv.id}`); load();
  }

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', render: r => <span className="font-medium text-brand-600">{r.invoice_number}</span> },
    { key: 'customer_name', label: 'Customer' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'total', label: 'Total', render: r => `₹${Number(r.total).toFixed(2)}` },
    { key: 'paid_amount', label: 'Paid', render: r => <span className="text-green-600">₹{Number(r.paid_amount).toFixed(2)}</span> },
    { key: 'balance', label: 'Balance', render: r => {
      const bal = Number(r.total) - Number(r.paid_amount);
      return <span className={bal > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>₹{bal.toFixed(2)}</span>;
    }},
    { key: 'due_date', label: 'Due Date', render: r => r.due_date || '—' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        {row.status === 'draft' && <button className="text-xs text-blue-600 hover:underline" onClick={() => updateStatus(row.id, 'sent')}>Send</button>}
        {['sent','partial'].includes(row.status) && <button className="text-xs text-orange-600 hover:underline" onClick={() => updateStatus(row.id, 'overdue')}>Mark Overdue</button>}
        <button className="text-xs text-red-500 hover:underline" onClick={() => remove(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Invoices & Billing" subtitle={`${items.length} total`}
        actions={<button className="btn-primary" onClick={() => setModal(true)}>+ New Invoice</button>} />
      <div className="card">
        <Table columns={columns} data={items} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="New Invoice" size="lg">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Due Date</label><input className="input" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
          <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Product</th>
                <th className="table-th w-20">Qty</th>
                <th className="table-th w-28">Unit Price</th>
                <th className="table-th w-20">Tax %</th>
                <th className="table-th w-28">Total</th>
                <th className="table-th w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.items.map((line, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <select className="input text-xs" value={line.product_id} onChange={e => updateLine(i, 'product_id', e.target.value)}>
                      <option value="">Select...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input className="input text-xs" type="number" min="0" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} /></td>
                  <td className="px-3 py-2"><input className="input text-xs" type="number" min="0" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', Number(e.target.value))} /></td>
                  <td className="px-3 py-2"><input className="input text-xs" type="number" min="0" value={line.tax_rate} onChange={e => updateLine(i, 'tax_rate', Number(e.target.value))} /></td>
                  <td className="px-3 py-2 font-medium">₹{(line.total || 0).toFixed(2)}</td>
                  <td className="px-3 py-2"><button onClick={() => setForm(p => ({ ...p, items: p.items.filter((_,idx)=>idx!==i) }))} className="text-red-400 hover:text-red-600">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between">
          <button className="btn-secondary text-xs" onClick={() => setForm(p => ({ ...p, items: [...p.items, emptyLine()] }))}>+ Add Line</button>
          <div className="text-right">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="text-lg font-bold text-gray-900">₹{lineTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.customer_id}>{saving ? 'Saving…' : 'Create Invoice'}</button>
        </div>
      </Modal>
    </div>
  );
}
