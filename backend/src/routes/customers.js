const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(customers);
});

router.get('/:id', (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
});

router.post('/', (req, res) => {
  const { name, email, phone, address, city, state, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(
    'INSERT INTO customers (name, email, phone, address, city, state, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, email, phone, address, city, state, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, email, phone, address, city, state, notes } = req.body;
  db.prepare(
    'UPDATE customers SET name=?, email=?, phone=?, address=?, city=?, state=?, notes=? WHERE id=?'
  ).run(name, email, phone, address, city, state, notes, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
