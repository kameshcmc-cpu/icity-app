import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState('stock');
  const [modal, setModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', movement_type: 'purchase', quantity: '', reference: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    api.get('/inventory').then(r => setItems(r.data)),
    api.get('/inventory/movements').then(r => setMovements(r.data)),
    api.get('/products').then(r => setProducts(r.data)),
  ]);
  useEffect(() => { load(); }, []);

  async function saveAdjustment() {
    setSaving(true);
    try {
      await api.post('/inventory/adjust', form);
      await load(); setModal(false);
      setForm({ product_id: '', movement_type: 'purchase', quantity: '', reference: '', notes: '' });
    } finally { setSaving(false); }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const stockColumns = [
    { key: 'product_name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Qty on Hand', render: r => (
      <span className={r.low_stock ? 'text-red-600 font-semibold' : 'text-gray-900'}>
        {r.quantity} {r.unit}
      </span>
    )},
    { key: 'reorder_level', label: 'Reorder At', render: r => `${r.reorder_level} ${r.unit}` },
    { key: 'status', label: 'Status', render: r => r.low_stock ? <StatusBadge status="pending" /> : <StatusBadge status="active" /> },
    { key: 'location', label: 'Location' },
    { key: 'last_updated', label: 'Last Updated', render: r => r.last_updated ? new Date(r.last_updated).toLocaleDateString() : '—' },
  ];

  const movementColumns = [
    { key: 'created_at', label: 'Date', render: r => new Date(r.created_at).toLocaleDateString() },
    { key: 'product_name', label: 'Product' },
    { key: 'movement_type', label: 'Type', render: r => <span className="capitalize">{r.movement_type.replace('_', ' ')}</span> },
    { key: 'quantity', label: 'Qty' },
    { key: 'reference', label: 'Reference' },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div>
      <Header title="Inventory" subtitle="Stock levels and movements"
        actions={<button className="btn-primary" onClick={() => setModal(true)}>+ Stock Adjustment</button>} />

      <div className="flex gap-2 mb-4">
        {['stock', 'movements'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {t === 'stock' ? 'Stock Levels' : 'Movement History'}
          </button>
        ))}
      </div>

      <div className="card">
        <Table columns={tab === 'stock' ? stockColumns : movementColumns} data={tab === 'stock' ? items : movements} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Stock Adjustment">
        <div className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select className="input" value={form.product_id} onChange={f('product_id')}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Movement Type *</label>
            <select className="input" value={form.movement_type} onChange={f('movement_type')}>
              <option value="purchase">Purchase (Stock In)</option>
              <option value="sale">Sale (Stock Out)</option>
              <option value="adjustment_in">Adjustment In</option>
              <option value="adjustment_out">Adjustment Out</option>
            </select>
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input className="input" type="number" min="0" value={form.quantity} onChange={f('quantity')} />
          </div>
          <div>
            <label className="label">Reference</label>
            <input className="input" value={form.reference} onChange={f('reference')} placeholder="PO number, order ref, etc." />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={f('notes')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={saveAdjustment}
            disabled={saving || !form.product_id || !form.quantity}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
