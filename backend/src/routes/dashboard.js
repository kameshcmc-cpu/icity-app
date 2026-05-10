const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/stats', (req, res) => {
  const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get().count;
  const totalInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get().count;
  const overdueInvoices = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'overdue'").get().count;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments").get().total;
  const outstandingAmount = db.prepare("SELECT COALESCE(SUM(total - paid_amount), 0) as total FROM invoices WHERE status NOT IN ('paid','cancelled')").get().total;

  const lowStock = db.prepare(`
    SELECT p.name, i.quantity, i.reorder_level
    FROM inventory i JOIN products p ON i.product_id = p.id
    WHERE i.quantity <= i.reorder_level AND i.reorder_level > 0
    LIMIT 5
  `).all();

  const recentOrders = db.prepare(`
    SELECT o.order_number, o.status, o.total, o.created_at, c.name as customer_name
    FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC LIMIT 5
  `).all();

  const recentPayments = db.prepare(`
    SELECT p.amount, p.payment_method, p.payment_date, c.name as customer_name
    FROM payments p LEFT JOIN customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC LIMIT 5
  `).all();

  res.json({
    kpis: { totalCustomers, totalProducts, totalOrders, pendingOrders, totalInvoices, overdueInvoices, totalRevenue, outstandingAmount },
    lowStock,
    recentOrders,
    recentPayments,
  });
});

module.exports = router;
