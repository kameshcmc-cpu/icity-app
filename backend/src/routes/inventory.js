const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const items = db.prepare(`
    SELECT i.*, p.name as product_name, p.sku, p.unit, p.category,
           CASE WHEN i.quantity <= i.reorder_level AND i.reorder_level > 0 THEN 1 ELSE 0 END as low_stock
    FROM inventory i JOIN products p ON i.product_id = p.id
    ORDER BY p.name
  `).all();
  res.json(items);
});

router.get('/movements', (req, res) => {
  const movements = db.prepare(`
    SELECT m.*, p.name as product_name
    FROM inventory_movements m JOIN products p ON m.product_id = p.id
    ORDER BY m.created_at DESC LIMIT 100
  `).all();
  res.json(movements);
});

router.post('/adjust', (req, res) => {
  const { product_id, movement_type, quantity, reference, notes } = req.body;
  if (!product_id || !movement_type || !quantity) {
    return res.status(400).json({ error: 'product_id, movement_type, and quantity are required' });
  }

  db.exec('BEGIN');
  try {
    db.prepare(
      'INSERT INTO inventory_movements (product_id, movement_type, quantity, reference, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(product_id, movement_type, quantity, reference || null, notes || null, req.user.id);

    const delta = ['purchase', 'adjustment_in'].includes(movement_type) ? quantity : -quantity;
    db.prepare(
      'UPDATE inventory SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?'
    ).run(delta, product_id);

    db.exec('COMMIT');
    const updated = db.prepare('SELECT quantity FROM inventory WHERE product_id = ?').get(product_id);
    res.json({ success: true, new_quantity: updated?.quantity });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.put('/:productId', (req, res) => {
  const { reorder_level, location } = req.body;
  db.prepare('UPDATE inventory SET reorder_level=?, location=?, last_updated=CURRENT_TIMESTAMP WHERE product_id=?')
    .run(reorder_level, location || null, req.params.productId);
  res.json({ success: true });
});

module.exports = router;
