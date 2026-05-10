const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function nextQuoteNumber() {
  const last = db.prepare("SELECT quote_number FROM quotations ORDER BY id DESC LIMIT 1").get();
  if (!last) return 'QT-0001';
  const num = parseInt(last.quote_number.split('-')[1]) + 1;
  return `QT-${String(num).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const quotations = db.prepare(`
    SELECT q.*, c.name as customer_name
    FROM quotations q LEFT JOIN customers c ON q.customer_id = c.id
    ORDER BY q.created_at DESC
  `).all();
  res.json(quotations);
});

router.get('/:id', (req, res) => {
  const q = db.prepare(`SELECT q.*, c.name as customer_name FROM quotations q LEFT JOIN customers c ON q.customer_id = c.id WHERE q.id = ?`).get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare(`SELECT qi.*, p.name as product_name FROM quotation_items qi LEFT JOIN products p ON qi.product_id = p.id WHERE qi.quotation_id = ?`).all(req.params.id);
  res.json({ ...q, items });
});

router.post('/', (req, res) => {
  const { customer_id, validity_date, notes, items } = req.body;
  const quote_number = nextQuoteNumber();

  let subtotal = 0, tax_amount = 0;
  (items || []).forEach(i => { subtotal += i.total; tax_amount += (i.total * (i.tax_rate || 0)) / 100; });
  const total = subtotal + tax_amount;

  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO quotations (quote_number, customer_id, status, validity_date, notes, subtotal, tax_amount, total, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(quote_number, customer_id || null, 'draft', validity_date || null, notes || null, subtotal, tax_amount, total, req.user.id);
    const qid = Number(result.lastInsertRowid);

    (items || []).forEach(i => {
      db.prepare('INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount, tax_rate, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(qid, i.product_id || null, i.description || null, i.quantity, i.unit_price, i.discount || 0, i.tax_rate || 0, i.total);
    });

    db.exec('COMMIT');
    res.status(201).json({ id: qid, quote_number });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'submitted', 'approved', 'rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE quotations SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM quotations WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
