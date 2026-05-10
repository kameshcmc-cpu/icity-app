import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';

const empty = { customer_id: '', invoice_id: '', amount: '', payment_method: 'cash', reference: '', notes: '', payment_date: new Date().toISOString().split('T')[0] };

export default function Payments() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/payments').then(r => setItems(r.data));
  useEffect(() => {
    load();
    api.get('/customers').then(r => setCustomers(r.data));
    api.get('/invoices').then(r => setInvoices(r.data));
  }, []);

  const filteredInvoices = form.customer_id
    ? invoices.filter(i => String(i.customer_id) === String(form.customer_id) && ['sent','partial','overdue'].includes(i.status))
    : [];

  function openNew() { setForm({ ...empty, payment_date: new Date().toISOString().split('T')[0] }); setModal(true); }

  async function save() {
    setSaving(true);
    try {
      await api.post('/payments', form);
      await load(); setModal(false);
    } finally { setSaving(false); }
  }

  async function remove(p) {
    if (!confirm('Delete this payment record?')) return;
    await api.delete(`/payments/${p.id}`); load();
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const totalCollected = items.reduce((s, p) => s + Number(p.amount), 0);

  const columns = [
    { key: 'payment_date', label: 'Date', render: r => new Date(r.payment_date).toLocaleDateString() },
    { key: 'customer_name', label: 'Customer' },
    { key: 'invoice_number', label: 'Invoice' },
    { key: 'amount', label: 'Amount', render: r => <span className="font-semibold text-green-600">₹{Number(r.amount).toFixed(2)}</span> },
    { key: 'payment_method', label: 'Method', render: r => <span className="capitalize">{r.payment_method}</span> },
    { key: 'reference', label: 'Reference' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button className="text-xs text-red-500 hover:underline" onClick={() => remove(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Payments & Collection"
        subtitle={`Total collected: ₹${totalCollected.toLocaleString()}`}
        actions={<button className="btn-primary" onClick={openNew}>+ Record Payment</button>} />
      <div className="card">
        <Table columns={columns} data={items} />
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Record Payment">
        <div className="space-y-4">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value, invoice_id: '' }))}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Invoice (optional)</label>
            <select className="input" value={form.invoice_id} onChange={f('invoice_id')} disabled={!form.customer_id}>
              <option value="">No invoice (general payment)</option>
              {filteredInvoices.map(i => (
                <option key={i.id} value={i.id}>{i.invoice_number} — ₹{(Number(i.total) - Number(i.paid_amount)).toFixed(2)} outstanding</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <input className="input" type="number" min="0" value={form.amount} onChange={f('amount')} />
          </div>
          <div>
            <label className="label">Payment Method *</label>
            <select className="input" value={form.payment_method} onChange={f('payment_method')}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI / Digital</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input className="input" type="date" value={form.payment_date} onChange={f('payment_date')} />
          </div>
          <div>
            <label className="label">Reference / Transaction ID</label>
            <input className="input" value={form.reference} onChange={f('reference')} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={f('notes')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.customer_id || !form.amount}>{saving ? 'Saving…' : 'Record Payment'}</button>
        </div>
      </Modal>
    </div>
  );
}
