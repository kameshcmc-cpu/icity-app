const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
  res.json(suppliers);
});

router.get('/:id', (req, res) => {
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) return res.status(404).json({ error: 'Not found' });
  res.json(supplier);
});

router.post('/', (req, res) => {
  const { name, email, phone, address, contact_person, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(
    'INSERT INTO suppliers (name, email, phone, address, contact_person, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email, phone, address, contact_person, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, email, phone, address, contact_person, notes } = req.body;
  db.prepare(
    'UPDATE suppliers SET name=?, email=?, phone=?, address=?, contact_person=?, notes=? WHERE id=?'
  ).run(name, email, phone, address, contact_person, notes, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
