const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function nextOrderNumber() {
  const last = db.prepare("SELECT order_number FROM orders ORDER BY id DESC LIMIT 1").get();
  if (!last) return 'ORD-0001';
  const num = parseInt(last.order_number.split('-')[1]) + 1;
  return `ORD-${String(num).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, c.name as customer_name
    FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `).all();
  res.json(orders);
});

router.get('/:id', (req, res) => {
  const order = db.prepare(`SELECT o.*, c.name as customer_name FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`).get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare(`SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`).all(req.params.id);
  res.json({ ...order, items });
});

router.post('/', (req, res) => {
  const { customer_id, quotation_id, delivery_date, delivery_address, notes, items } = req.body;
  const order_number = nextOrderNumber();

  let subtotal = 0;
  (items || []).forEach(i => { subtotal += i.total; });

  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO orders (order_number, quotation_id, customer_id, status, delivery_date, delivery_address, notes, subtotal, total, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(order_number, quotation_id || null, customer_id || null, 'pending', delivery_date || null, delivery_address || null, notes || null, subtotal, subtotal, req.user.id);
    const oid = Number(result.lastInsertRowid);

    (items || []).forEach(i => {
      db.prepare('INSERT INTO order_items (order_id, product_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)')
        .run(oid, i.product_id || null, i.description || null, i.quantity, i.unit_price, i.total);
    });

    db.exec('COMMIT');
    res.status(201).json({ id: oid, order_number });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'in-progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
