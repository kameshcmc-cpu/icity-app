import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';

const empty = { name: '', sku: '', category: '', unit: 'pcs', price: '', tax_rate: '', description: '', initial_stock: '0', reorder_level: '0' };

export default function Products() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/products').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  function openNew() { setForm(empty); setModal(true); }
  function openEdit(p) { setForm({ ...p, initial_stock: p.stock_qty }); setModal(true); }
  function closeModal() { setModal(false); setForm(empty); }

  async function save() {
    setSaving(true);
    try {
      if (form.id) await api.put(`/products/${form.id}`, form);
      else await api.post('/products', form);
      await load(); closeModal();
    } finally { setSaving(false); }
  }

  async function remove(p) {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    await api.delete(`/products/${p.id}`); load();
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'price', label: 'Price', render: r => r.price != null ? `₹${Number(r.price).toFixed(2)}` : '—' },
    { key: 'stock_qty', label: 'Stock', render: r => (
      <span className={r.stock_qty <= r.reorder_level && r.reorder_level > 0 ? 'text-red-600 font-medium' : ''}>
        {r.stock_qty} {r.unit}
      </span>
    )},
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button className="text-xs text-brand-600 hover:underline" onClick={() => openEdit(row)}>Edit</button>
        <button className="text-xs text-red-500 hover:underline" onClick={() => remove(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Products & Services" subtitle={`${items.length} products`}
        actions={<button className="btn-primary" onClick={openNew}>+ Add Product</button>} />
      <div className="card">
        <Table columns={columns} data={items} />
      </div>
      <Modal open={modal} onClose={closeModal} title={form.id ? 'Edit Product' : 'New Product'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Name *</label><input className="input" value={form.name} onChange={f('name')} /></div>
          <div><label className="label">SKU</label><input className="input" value={form.sku||''} onChange={f('sku')} /></div>
          <div><label className="label">Category</label><input className="input" value={form.category||''} onChange={f('category')} /></div>
          <div><label className="label">Unit</label><input className="input" value={form.unit||'pcs'} onChange={f('unit')} /></div>
          <div><label className="label">Selling Price (₹)</label><input className="input" type="number" value={form.price||''} onChange={f('price')} /></div>
          <div><label className="label">Tax Rate (%)</label><input className="input" type="number" value={form.tax_rate||''} onChange={f('tax_rate')} /></div>
          {!form.id && <div><label className="label">Initial Stock</label><input className="input" type="number" value={form.initial_stock||'0'} onChange={f('initial_stock')} /></div>}
          <div><label className="label">Reorder Level</label><input className="input" type="number" value={form.reorder_level||'0'} onChange={f('reorder_level')} /></div>
          <div className="col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description||''} onChange={f('description')} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
