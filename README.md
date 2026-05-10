# ICity Business Manager

A full-stack business management app with Google SSO, built with Node.js + Express (backend) and React + Vite (frontend).

## Modules

| Module | Description |
|--------|-------------|
| Dashboard | KPI overview, low stock alerts, recent orders & payments |
| Customers | Full CRUD, contact details |
| Suppliers | Full CRUD, contact management |
| Products | Product catalogue with SKU, pricing, tax rates |
| Inventory | Real-time stock levels, movement history, reorder alerts |
| Quotations | Create quotes, approval workflow (Draft → Submitted → Approved/Rejected) |
| Orders | Order management, delivery status tracking |
| Invoices | Invoice generation, partial payment tracking |
| Payments | Record cash/bank/UPI/cheque payments, auto-reconciles invoices |
| Reports | Business performance summary, low stock report |

## Stack

- **Backend:** Node.js, Express, SQLite, JWT
- **Frontend:** React, Vite, Tailwind CSS
- **Auth:** Google OAuth 2.0 (SSO)

## Quick Start

See [setup.md](setup.md) for full setup instructions including Google OAuth configuration.

**TL;DR** — after configuring your `.env` files:

```powershell
# Install dependencies
cd backend && npm install
cd ..\frontend && npm install

# Start both servers
.\start.ps1
```

Then open http://localhost:3000.

## Auth & Storage

- Sign in with Google — account is created automatically on first login
- Sessions secured with JWT (7-day expiry)
- SQLite database at `backend/data/icity.db` — no external DB needed
