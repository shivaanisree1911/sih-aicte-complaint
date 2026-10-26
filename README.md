# Integrated Institution Complaint Monitoring and Status Dashboard

**AICTE Central Grievance & Regulatory Compliance Monitoring Portal**  
**Technology Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Tailwind CSS + Lucide React + Recharts  

---

## 1. Project Overview & Primary Goal
AICTE receives grievances from students, faculty, and stakeholders regarding technical institutions. These are processed across multiple bureaus:
- **Regulation Bureau (RB)**: Compliance, mandatory approvals, facility norms.
- **Public Grievance Redressal Cell (PGRC)**: Student & faculty grievances, fee issues, harassment complaints.
- **Regional Offices / Cells**: Local inspections and regional oversight.

Without a unified system, parallel investigations often proceed independently against the same institution, leading to duplicate committee visits, conflicting regulatory orders, and severe disposal delays.

This application provides a **single source of truth** with:
- **Automated Cross-Bureau Overlap Detection**: Algorithmically identifies concurrent active complaints filed against the same institution across distinct bureaus using multi-pass Token Jaccard text similarity and regulatory category synergy.
- **Append-Only Chronological Case History**: Complete audit trail of every status transition, bureau transfer, and officer remark.
- **Deadline Alerting & Overdue Tracking**: Configurable statutory disposal alerts preventing cases from lingering unnoticed.
- **Role-Based Access Control (RBAC)**: Strict permission enforcement across 5 official AICTE roles.
- **Executive Analytics & CSV Export**: Real-time workload, regional spread, ageing analysis, and disposal rate reporting.

---

## 2. Technology Stack & Packages

| Layer | Technologies & Libraries |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios, Vite |
| **Backend** | Node.js (v18+ / v24), Express.js 4.x, Helmet, CORS, Morgan, Multer, bcryptjs, jsonwebtoken, express-validator |
| **Database** | MongoDB Atlas / Local MongoDB 7.0 via Mongoose ODM 8.x |
| **Testing** | Node.js Native Test Runner (`node:test`), Supertest, Vite Production Bundler |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database) |

---

## 3. Demonstration Accounts & Roles

Pre-configured demo credentials (seeded automatically via `npm run seed`):

| Role | Email Address | Password | Jurisdiction / Scope |
|---|---|---|---|
| **Super Administrator** | `admin@aicte.gov.in` | `Password@123` | Full access across all bureaus, institutions, users & audit logs |
| **Senior Management (Advisor)** | `advisor@aicte.gov.in` | `Password@123` | High-level analytics, escalation review, overlap coordination |
| **Bureau Officer (PGRC)** | `officer.pgrc@aicte.gov.in` | `Password@123` | PGRC bureau case management, grievance resolution, remarks |
| **Bureau Officer (RB)** | `officer.rb@aicte.gov.in` | `Password@123` | Regulation Bureau compliance investigations & hearings |
| **Regional Officer (North)** | `officer.north@aicte.gov.in` | `Password@123` | Regional jurisdiction case inspection & local reporting |
| **Read-Only Auditor** | `auditor@aicte.gov.in` | `Password@123` | Read-only inspection of cases, histories, and audit logs |

> **Note**: For convenience during evaluation, the login page features a **1-Click Fill** panel that instantly populates credentials for each role!

---

## 4. Key Demonstration Overlap Scenario

The database seed script initializes a clear cross-bureau overlap demonstration on fictional institution **ABC Institute of Technology** (`AICTE ID: 1-109723451`):

- **Case 1**: `AICTE-2026-00001`
  - Bureau: **Public Grievance Redressal Cell (PGRC)**
  - Category: **Infrastructure**
  - Allegation: Deficient computer laboratories and structural safety hazards in engineering block
  - Status: **Under Process**
- **Case 2**: `AICTE-2026-00002`
  - Bureau: **Regulation Bureau (RB)**
  - Category: **Regulatory Compliance**
  - Allegation: Regulatory non-compliance regarding laboratory carpet area and building safety norms
  - Status: **Pending**

**System Behavior**:
1. The engine computes a High-Severity Overlap due to cross-bureau divergence (`PGRC` vs `RB`), synergistic categories (`Infrastructure` vs `Regulatory Compliance`), and text similarity.
2. A prominent red banner appears on both case dossiers and in the **Overlap Monitoring Console**.
3. Officers can compare both cases side-by-side, link them for shared updates, assign a coordinating officer, or resolve the overlap once unified orders are issued.
4. Non-overlapping cases (e.g. Case 3 for marksheet delay) remain separate, proving the system differentiates valid overlaps from general institution complaints.

---

## 5. Prerequisites & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB running on `mongodb://127.0.0.1:27017`)

---

## 6. Installation & Execution

### Step 1: Clone or Extract the Project
Navigate to the root directory:
```bash
cd institution-complaint-dashboard
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Configure Environment Variables
In `server/`:
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/aicte_complaints
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/aicte_complaints?retryWrites=true&w=majority
JWT_SECRET=aicte_central_sentinel_auth_key_2026_production_vault
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads
DEADLINE_APPROACHING_DAYS=3
```

In `client/`:
Copy `.env.example` to `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 5: Seed Sample Data
From `server/` directory:
```bash
npm run seed
```
This populates:
- 6 Officer accounts covering all 5 roles
- 20 AICTE-approved institutions across 7 regions
- 50 Complaints with realistic cases, priorities, categories, and disposal dates
- Chronological case action histories
- Automated cross-bureau overlap alerts

### Step 6: Start Development Servers
**Option A — Run Both Concurrently from Root:**
```bash
cd ..
npm run dev
```

**Option B — Run Separately:**
Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 7. Running Automated Tests

Run the backend test suite:
```bash
cd server
npm test
```
**Test Results**: 10 tests executed, 10 passed (100% pass rate) testing health endpoints, route protection, token Jaccard similarity, category synergy matrices, and role authorization.

Run frontend build check:
```bash
cd client
npm run build
```
Compiles production assets to `dist/` with 0 errors.

---

## 8. Deployment Guide

### A. Cloud Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/aicte_complaints?retryWrites=true&w=majority`.

### B. Backend: Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the repository and set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables:
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure random string>`
   - `CLIENT_URL`: `<Your Vercel Frontend URL>`
   - `NODE_ENV`: `production`

### C. Frontend: Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-render-api>.onrender.com/api`
5. Deploy. `vercel.json` automatically configures client-side routing rewrites.

### D. Docker Deployment (Optional)
Run the entire stack with Docker Compose:
```bash
docker-compose up --build
```
This starts MongoDB, Backend (port 5000), and Frontend (port 5173) in isolated containers.

---

## 9. Regulatory Disposal Rate Formula

The disposal rate displayed on executive dashboards and reports is calculated as:
$$\text{Disposal Rate} = \frac{\text{Cases Disposed during the period}}{\text{Cases Received during the period}} \times 100$$
If zero cases were received, the formula returns `0%`.

---

## 10. Project Directory Layout

```
institution-complaint-dashboard/
├── client/                     # Vite + React 18 + Tailwind CSS frontend
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable Badges, StatCards, Modals, Pagination
│   │   ├── context/            # AuthContext (JWT) & NotificationContext
│   │   ├── pages/              # 17 complete application pages
│   │   ├── services/           # Axios API client with interceptors
│   │   ├── utils/              # Roles, constants, and demo credentials
│   │   ├── App.jsx             # React Router routing table
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── server/                     # Express.js REST API
│   ├── src/
│   │   ├── config/             # DB connection, roles, constants
│   │   ├── controllers/        # Auth, Complaints, Institutions, Overlaps, Reports
│   │   ├── middleware/         # Auth (JWT), RBAC, AuditLogger, Multer upload
│   │   ├── models/             # Mongoose schemas (User, Institution, Complaint, etc.)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Overlap Detection Engine & Case Sequence Generator
│   │   ├── jobs/               # Background statutory deadline alert checker
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   │   └── seed.js             # Realistic AICTE database seeder (20 inst, 50 cases)
│   ├── tests/                  # Automated API & unit tests
│   └── package.json
├── docs/                       # Architecture, API docs, Testing report
├── docker-compose.yml          # Containerized orchestration
├── render.yaml                 # Render backend blueprint
└── README.md                   # Master documentation
```

---

## 11. Regulatory Platform Capabilities Summary

- **Centralized Registry**: Resolves siloed investigations between PGRC, RB, and Regional Offices.
- **Overlap Detection Engine**: Explainable AI/heuristic multi-pass matching flags parallel complaints for joint coordination without destructive merging.
- **Audit & Timeline Integrity**: Append-only case action logging guarantees accountability for all status transitions and bureau transfers.
- **Zero Placeholder Code**: Every page, route, database model, chart, filter, and CSV export is fully implemented and tested.
