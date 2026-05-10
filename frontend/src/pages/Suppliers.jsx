import { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import Table from '../components/Table';
import Modal from '../components/Modal';

const empty = { name: '', email: '', phone: '', address: '', contact_person: '', notes: '' };

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/suppliers').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  function openNew() { setForm(empty); setModal(true); }
  function openEdit(s) { setForm(s); setModal(true); }
  function closeModal() { setModal(false); setForm(empty); }

  async function save() {
    setSaving(true);
    try {
      if (form.id) await api.put(`/suppliers/${form.id}`, form);
      else await api.post('/suppliers', form);
      await load(); closeModal();
    } finally { setSaving(false); }
  }

  async function remove(s) {
    if (!confirm(`Delete supplier "${s.name}"?`)) return;
    await api.delete(`/suppliers/${s.id}`); load();
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Supplier Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'actions', label: '', render: row => (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button className="text-xs text-brand-600 hover:underline" onClick={() => openEdit(row)}>Edit</button>
        <button className="text-xs text-red-500 hover:underline" onClick={() => remove(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Suppliers" subtitle={`${items.length} total`}
        actions={<button className="btn-primary" onClick={openNew}>+ Add Supplier</button>} />
      <div className="card">
        <Table columns={columns} data={items} />
      </div>
      <Modal open={modal} onClose={closeModal} title={form.id ? 'Edit Supplier' : 'New Supplier'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Name *</label><input className="input" value={form.name} onChange={f('name')} /></div>
          <div><label className="label">Contact Person</label><input className="input" value={form.contact_person||''} onChange={f('contact_person')} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email||''} onChange={f('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone||''} onChange={f('phone')} /></div>
          <div><label className="label">Address</label><input className="input" value={form.address||''} onChange={f('address')} /></div>
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
