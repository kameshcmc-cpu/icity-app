# ICity Business Manager — Setup Guide

## Prerequisites

- Node.js 18+ — download from https://nodejs.org/en/download (LTS version)
- A Google account for Google OAuth setup

---

## Step 1 — Install Node.js

Download and install Node.js LTS from https://nodejs.org  
After installing, open a new PowerShell window and verify:

```
node --version   # should show v18.x or higher
npm --version    # should show 9.x or higher
```

---

## Step 2 — Set up Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project (or select an existing one)
3. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Set **Application type** to "Web application"
5. Add **Authorised JavaScript origins**: `http://localhost:3000`
6. Add **Authorised redirect URIs**: `http://localhost:3000`
7. Click **Create** — copy the **Client ID**

---

## Step 3 — Configure Environment Files

**Backend** — create `backend/.env`:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=any-long-random-string-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Step 4 — Install Dependencies

Open PowerShell in the `icity-app` folder and run:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

---

## Step 5 — Start the Application

**Option A — Use the startup script:**
```powershell
.\start.ps1
```

**Option B — Start manually (two separate terminals):**

Terminal 1 (backend):
```powershell
cd backend
node src/index.js
```

Terminal 2 (frontend):
```powershell
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## Features

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

## Authentication

Users sign in with **Google SSO**. On first sign-in, an account is automatically created. All user sessions are secured with JWT tokens (7-day expiry).

## Data Storage

SQLite database stored at `backend/data/icity.db` — no external database setup required.
