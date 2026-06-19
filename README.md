# Ruai Tech Solutions — Integrated Platform

**Author:** Thoth of Codes · `codeofthoth@outlook.com`  
**Stack:** MongoDB · Express · React · Node.js (MERN) · Socket.io  
**Location:** Ruai Town Centre, Nairobi County, Kenya  

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Environment Setup](#3-environment-setup)
4. [Database Setup](#4-database-setup)
5. [Seed the Database](#5-seed-the-database)
6. [Boot the Application](#6-boot-the-application)
7. [Access the Platform](#7-access-the-platform)
8. [Department URLs](#8-department-urls)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Production Build](#10-production-build)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Ensure the following are installed before proceeding:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |
| MongoDB | Atlas (cloud) **or** local 6.x+ | `mongod --version` |
| Git | Any recent | `git --version` |

> **Kenya network note:** If you are on a slow connection, use `npm install --prefer-offline` after the first install to avoid re-downloading packages.

---

## 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/3mutua/ruaitech_solutions.git
cd ruaitech_solutions

# Install root dev tools (concurrently)
npm install

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

Or using the single convenience command:

```bash
npm run install:all
```

---

## 3. Environment Setup

### Backend

```bash
cd backend
cp .env.example .env
nano .env        # or use any text editor
```

Fill in every variable in `.env`. The critical ones to set before first boot:

```env
# 1 — Your MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ruaitech

# 2 — A strong random secret (generate with: openssl rand -base64 32)
JWT_SECRET=<min-32-character-random-string>

# 3 — Must exactly match the Super Admin account email
SUPER_ADMIN_EMAIL=codeofthoth@outlook.com

# 4 — M-Pesa Daraja credentials (get from developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=<your_consumer_key>
MPESA_CONSUMER_SECRET=<your_consumer_secret>
MPESA_SHORTCODE=<your_shortcode>
MPESA_PASSKEY=<your_passkey>
MPESA_CALLBACK_URL=https://<your-domain>/api/payments/mpesa/callback

# 5 — Africa's Talking (get from account.africastalking.com)
AT_USERNAME=sandbox          # use 'sandbox' for testing
AT_API_KEY=<your_api_key>

# 6 — Passwords for the seed script (used ONCE, then remove from .env)
SEED_SUPER_ADMIN_PASSWORD=<strong-unique-password>
SEED_ADMIN_PASSWORD=<strong-unique-password>
```

### Frontend

The frontend `.env` is optional in development (the proxy handles API routing automatically).

For production only:

```bash
cd frontend
# Edit .env and set your production API URL
VITE_API_URL=https://<your-production-domain>/api
```

---

## 4. Database Setup

### Option A — MongoDB Atlas (recommended for Nairobi)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist your IP (or use `0.0.0.0/0` for development)
4. Copy the connection string into `MONGO_URI` in your `.env`

### Option B — Local MongoDB

```bash
# Start local MongoDB
mongod --dbpath /var/data/db

# Connection string in .env:
MONGO_URI=mongodb://127.0.0.1:27017/ruaitech
```

---

## 5. Seed the Database

> **Run this once** on a fresh database. It creates the Super Admin account, department records, pricing rules, and service catalogue.

```bash
cd backend
node seed.js
```

**Expected output:**

```
✅ Connected to MongoDB
✅ Super Admin created  — codeofthoth@outlook.com
✅ Department heads created (6 departments)
✅ Departments seeded
✅ Pricing rules seeded
✅ Services seeded
✅ Database seeded successfully
   Super Admin Email:    codeofthoth@outlook.com
   Super Admin Password: (the value you set in SEED_SUPER_ADMIN_PASSWORD)
```

> After seeding, you may remove `SEED_SUPER_ADMIN_PASSWORD` and `SEED_ADMIN_PASSWORD` from your `.env` for security.

---

## 6. Boot the Application

### Development (both services together)

```bash
# From the project root
npm run dev
```

This starts:
- **Backend API** on `http://localhost:5001` (with nodemon auto-reload)
- **Frontend** on `http://localhost:3000` (Vite HMR — hot module replacement)
- **Socket.io** on the same port as the backend (`5001`)
- **Vite proxy** forwards `/api` and `/socket.io` requests to `localhost:5001` automatically

### Start services separately

```bash
# Terminal 1 — Backend
npm run start:backend
# or: cd backend && npm run dev

# Terminal 2 — Frontend
npm run start:frontend
# or: cd frontend && npm start
```

---

## 7. Access the Platform

| Portal | URL | Who |
|--------|-----|-----|
| **Super Admin Dashboard** | `http://localhost:3000/admin/super` | Thoth of Codes only |
| **Login Page** | `http://localhost:3000/login` | All admin users |
| **Public Store** | `http://localhost:3000` | Unauthenticated visitors |

**First login:**

```
Email:    codeofthoth@outlook.com
Password: (your SEED_SUPER_ADMIN_PASSWORD value)
```

---

## 8. Department URLs

Each department has its own admin panel. Log in as the respective department head:

| Department | Admin Panel URL |
|------------|----------------|
| Internet Distribution | `/admin/internet` |
| Web Development | `/admin/webdev` |
| PlayStation Arena | `/admin/playstation` |
| Hardware Repair | `/admin/repair` |
| Cybersecurity | `/admin/cybersecurity` |
| Gov Admin Assistance | `/admin/govadmin` |

**Staff portals** (login with company email `firstname.dept@ruaitechsolutions.co.ke`):

```
/staff/<dept-slug>/dashboard
```

**Client portals** (OTP login via SMS):

```
/client/<dept-slug>
```

---

## 9. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | API server port (default `5001`) |
| `MONGO_URI` | ✅ | Full MongoDB connection string |
| `JWT_SECRET` | ✅ | Min 32-char secret for signing tokens |
| `JWT_EXPIRE` | ✅ | Token lifetime e.g. `8h` |
| `SUPER_ADMIN_EMAIL` | ✅ | Identity-locked Super Admin email |
| `CLIENT_URL` | ✅ | Frontend origin for CORS e.g. `http://localhost:3000` |
| `MPESA_CONSUMER_KEY` | ✅ | Safaricom Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | ✅ | Safaricom Daraja consumer secret |
| `MPESA_SHORTCODE` | ✅ | Business till/paybill number |
| `MPESA_PASSKEY` | ✅ | Safaricom passkey |
| `MPESA_CALLBACK_URL` | ✅ | Public HTTPS URL Safaricom calls |
| `AT_USERNAME` | ✅ | Africa's Talking username (`sandbox` for testing) |
| `AT_API_KEY` | ✅ | Africa's Talking API key |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `EMAIL_HOST` | ✅ | SMTP host e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | ✅ | SMTP port e.g. `587` |
| `EMAIL_USER` | ✅ | Sender email address |
| `EMAIL_PASS` | ✅ | Gmail App Password or SMTP password |
| `SEED_SUPER_ADMIN_PASSWORD` | Seed only | Used by `node seed.js` once |
| `SEED_ADMIN_PASSWORD` | Seed only | Used by `node seed.js` once |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production only | Full API base URL. Leave blank in development (Vite proxy handles it). |

---

## 10. Production Build

```bash
# 1. Build the React frontend (Vite — fast production build)
npm run build:frontend
# Output: frontend/build/   (7 optimised chunks, ~255 kB gzipped total)

# 2. Serve the build folder from your backend (or a CDN)
#    In backend/server.js, static files are served from frontend/build/
#    in production mode automatically.

# 3. Set NODE_ENV=production in your backend .env

# 4. Start the backend
npm run start:backend
```

> For PythonAnywhere deployment, upload the `backend/` directory and point the WSGI config to `server.js` via a Node.js task runner.

---

## 11. Troubleshooting

### `npm install` fails

```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps --prefix backend
npm install --legacy-peer-deps --prefix frontend
```

### Backend crashes on startup

```bash
# Check your .env is complete
cat backend/.env | grep -v "^#"

# Run with verbose logging
NODE_ENV=development node backend/server.js
```

### `DB: disconnected` on health check

- Verify `MONGO_URI` in `backend/.env` is correct
- Check your MongoDB Atlas IP whitelist includes your current IP
- Run: `curl http://localhost:5001/api/health`

### M-Pesa STK push not arriving

- `MPESA_CALLBACK_URL` must be a publicly reachable HTTPS URL
- For local development use [ngrok](https://ngrok.com): `ngrok http 5001`
- Set `MPESA_CALLBACK_URL=https://<ngrok-id>.ngrok.io/api/billing/mpesa-callback`
- Use `AT_USERNAME=sandbox` and the sandbox API key for testing

### Socket.io not connecting

- Ensure the browser is pointing to `http://localhost:3000` (not `5001` directly)
- The frontend proxy forwards `/socket.io` requests to port `5001` automatically
- Check that `CLIENT_URL=http://localhost:3000` is set in `backend/.env`

### "Too many requests" error

- The API rate limit is **100 requests per 15 minutes per IP** in production
- The auth endpoint limit is **10 attempts per 15 minutes per IP**
- In development these limits are relaxed

### Staff portal login fails

- Company email addresses must be provisioned by the Super Admin first
- Go to `/admin/super/email` → approve the email request → staff receives a setup link

---

## Project Structure

```
ruaitech_solutions/
├── backend/
│   ├── config/          # DB, Cloudinary, AT, mailer
│   ├── controllers/     # 21 route controllers
│   ├── middleware/       # auth, errorHandler, mpesa, upload
│   ├── models/          # 24 Mongoose schemas
│   ├── routes/          # 20 Express route files
│   ├── socket.js        # Socket.io server + emitters
│   ├── server.js        # Express app entry point
│   └── seed.js          # Database seed script
├── frontend/
│   └── src/
│       ├── admin/       # Dept admin panels + Super Admin
│       ├── components/  # Shared UI components
│       ├── hooks/       # useSocket, custom hooks
│       ├── pages/       # Public + staff + client portals
│       └── utils/       # api.js axios instance
├── package.json         # Root scripts (npm run dev)
└── README.md            # This file
```

---

© 2026 Ruai Tech Solutions · Ruai Town Centre, Nairobi County, Kenya  
Super Administrator: **Thoth of Codes** · `codeofthoth@outlook.com` · [github.com/3mutua](https://github.com/3mutua)
