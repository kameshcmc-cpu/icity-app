const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, COALESCE(i.quantity, 0) as stock_qty, COALESCE(i.reorder_level, 0) as reorder_level
    FROM products p LEFT JOIN inventory i ON i.product_id = p.id
    ORDER BY p.name
  `).all();
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

router.post('/', (req, res) => {
  const { name, sku, category, unit, price, tax_rate, description, initial_stock, reorder_level } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO products (name, sku, category, unit, price, tax_rate, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, sku || null, category || null, unit || 'pcs', price || 0, tax_rate || 0, description || null);
    const productId = Number(result.lastInsertRowid);

    db.prepare(
      'INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, ?, ?)'
    ).run(productId, initial_stock || 0, reorder_level || 0);

    db.exec('COMMIT');
    res.status(201).json({ id: productId });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const { name, sku, category, unit, price, tax_rate, description } = req.body;
  db.prepare(
    'UPDATE products SET name=?, sku=?, category=?, unit=?, price=?, tax_rate=?, description=? WHERE id=?'
  ).run(name, sku || null, category || null, unit, price, tax_rate, description || null, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
