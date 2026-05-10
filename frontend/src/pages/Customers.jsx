import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';

const empty = { name: '', email: '', phone: '', address: '', city: '', state: '', notes: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  function openNew() { setForm(empty); setModal(true); }
  function openEdit(c) { setForm(c); setModal(true); }
  function closeModal() { setModal(false); setForm(empty); }

  async function save() {
    setSaving(true);
    try {
      if (form.id) await api.put(`/customers/${form.id}`, form);
      else await api.post('/customers', form);
      await load();
      closeModal();
    } finally { setSaving(false); }
  }

  async function remove(c) {
    if (!confirm(`Delete customer "${c.name}"?`)) return;
    await api.delete(`/customers/${c.id}`);
    load();
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button className="text-xs text-brand-600 hover:underline" onClick={() => openEdit(row)}>Edit</button>
        <button className="text-xs text-red-500 hover:underline" onClick={() => remove(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Customers" subtitle={`${customers.length} total`}
        actions={<button className="btn-primary" onClick={openNew}>+ Add Customer</button>} />
      <div className="card">
        <Table columns={columns} data={customers} />
      </div>

      <Modal open={modal} onClose={closeModal} title={form.id ? 'Edit Customer' : 'New Customer'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Name *</label><input className="input" value={form.name} onChange={f('name')} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email||''} onChange={f('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone||''} onChange={f('phone')} /></div>
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address||''} onChange={f('address')} /></div>
          <div><label className="label">City</label><input className="input" value={form.city||''} onChange={f('city')} /></div>
          <div><label className="label">State</label><input className="input" value={form.state||''} onChange={f('state')} /></div>
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={f('notes')} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  );
}
