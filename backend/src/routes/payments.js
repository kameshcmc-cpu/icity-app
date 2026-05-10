const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, c.name as customer_name, i.invoice_number
    FROM payments p
    LEFT JOIN customers c ON p.customer_id = c.id
    LEFT JOIN invoices i ON p.invoice_id = i.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(payments);
});

router.post('/', (req, res) => {
  const { invoice_id, customer_id, amount, payment_method, reference, notes, payment_date } = req.body;
  if (!amount || !customer_id) return res.status(400).json({ error: 'Amount and customer are required' });

  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO payments (invoice_id, customer_id, amount, payment_method, reference, notes, payment_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(invoice_id || null, customer_id, amount, payment_method || 'cash', reference || null, notes || null, payment_date || new Date().toISOString().split('T')[0], req.user.id);

    if (invoice_id) {
      db.prepare('UPDATE invoices SET paid_amount = paid_amount + ? WHERE id = ?').run(amount, invoice_id);
      const invoice = db.prepare('SELECT total, paid_amount FROM invoices WHERE id = ?').get(invoice_id);
      if (invoice) {
        const status = invoice.paid_amount >= invoice.total ? 'paid' : 'partial';
        db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(status, invoice_id);
      }
    }

    db.exec('COMMIT');
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
