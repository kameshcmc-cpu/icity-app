const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function nextInvoiceNumber() {
  const last = db.prepare("SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1").get();
  if (!last) return 'INV-0001';
  const num = parseInt(last.invoice_number.split('-')[1]) + 1;
  return `INV-${String(num).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  const invoices = db.prepare(`
    SELECT i.*, c.name as customer_name
    FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.created_at DESC
  `).all();
  res.json(invoices);
});

router.get('/:id', (req, res) => {
  const invoice = db.prepare(`SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE i.id = ?`).get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  const items = db.prepare(`SELECT ii.*, p.name as product_name FROM invoice_items ii LEFT JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = ?`).all(req.params.id);
  res.json({ ...invoice, items });
});

router.post('/', (req, res) => {
  const { customer_id, order_id, issue_date, due_date, notes, items } = req.body;
  const invoice_number = nextInvoiceNumber();

  let subtotal = 0, tax_amount = 0;
  (items || []).forEach(i => {
    subtotal += i.total;
    tax_amount += (i.total * (i.tax_rate || 0)) / 100;
  });
  const total = subtotal + tax_amount;

  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO invoices (invoice_number, order_id, customer_id, status, issue_date, due_date, notes, subtotal, tax_amount, total, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(invoice_number, order_id || null, customer_id || null, 'draft', issue_date || new Date().toISOString().split('T')[0], due_date || null, notes || null, subtotal, tax_amount, total, req.user.id);
    const iid = Number(result.lastInsertRowid);

    (items || []).forEach(i => {
      db.prepare('INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, total) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(iid, i.product_id || null, i.description || null, i.quantity, i.unit_price, i.tax_rate || 0, i.total);
    });

    db.exec('COMMIT');
    res.status(201).json({ id: iid, invoice_number });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
