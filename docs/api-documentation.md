# AICTE Institution Complaint Monitoring Dashboard — REST API Documentation

Base URL: `http://localhost:5000/api` (Development) / Production URL
All authenticated endpoints require the HTTP Header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### POST `/api/auth/login`
- **Description**: Authenticate user and obtain JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@aicte.gov.in",
    "password": "Password@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Authentication successful.",
    "data": {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "_id": "64a...",
        "name": "Dr. Ramesh Sharma",
        "email": "admin@aicte.gov.in",
        "role": "super_admin",
        "bureau": "All",
        "region": "All"
      }
    }
  }
  ```

### GET `/api/auth/me`
- **Description**: Fetch current logged-in user profile.
- **Response (200 OK)**: Returns user document.

### POST `/api/auth/logout`
- **Description**: Logs logout audit event and clears session.

---

## 2. Dashboard Endpoints

### GET `/api/dashboard/summary`
- **Description**: Returns 9 key executive counts: `total`, `pending`, `underProcess`, `disposed`, `transferred`, `escalated`, `overdue`, `activeOverlaps`, and `disposalRate`.

### GET `/api/dashboard/trends`
- **Description**: Monthly received vs disposed trends over the past 6 months.

### GET `/api/dashboard/bureau-workload`
- **Description**: Total, active, and disposed complaints grouped by Bureau.

### GET `/api/dashboard/region-distribution`
- **Description**: Complaint count grouped across the 7 AICTE regions.

### GET `/api/dashboard/ageing`
- **Description**: Buckets complaints into `<15 Days`, `15-30 Days`, `31-60 Days`, `>60 Days`.

### GET `/api/dashboard/recent-activity`
- **Description**: Latest 8 complaints with assigned officer and active overlap flags.

---

## 3. Institution Endpoints

### GET `/api/institutions`
- **Query Params**: `page`, `limit`, `search`, `region`, `state`, `status`
- **Description**: Paginated list of institutions with dynamically aggregated complaint counts.

### POST `/api/institutions`
- **Permissions**: Super Admin, Senior Management, Bureau Officer, Regional Officer
- **Request Body**:
  ```json
  {
    "aictePermanentId": "1-109723499",
    "name": "National Technical Institute",
    "institutionType": "Engineering & Technology",
    "address": "Knowledge Park III",
    "state": "Uttar Pradesh",
    "district": "Gautam Buddha Nagar",
    "region": "Northern"
  }
  ```

### GET `/api/institutions/:id`
- **Description**: Institution dossier with total, active, and disposed metrics.

### GET `/api/institutions/:id/complaints`
- **Description**: Complete chronological complaint list for this institution.

---

## 4. Complaint & Case Management Endpoints

### GET `/api/complaints`
- **Query Params**: `page`, `limit`, `search`, `status`, `priority`, `bureau`, `category`, `institutionId`, `isOverdue`
- **Description**: Paginated list of complaints.

### POST `/api/complaints`
- **Permissions**: Super Admin, Bureau Officer, Regional Officer
- **Request Body**:
  ```json
  {
    "institutionId": "64a...",
    "category": "Infrastructure",
    "subject": "Inadequate Computer Labs",
    "description": "Evidence of insufficient computing equipment for technical curriculum...",
    "priority": "High",
    "assignedBureau": "Public Grievance Redressal Cell (PGRC)",
    "expectedDisposalDate": "2026-11-25"
  }
  ```
- **Response (201 Created)**: Returns created complaint with generated Case ID (`AICTE-2026-XXXXX`) and number of overlaps detected.

### GET `/api/complaints/:id`
- **Description**: Full complaint details, populated institution, complete timeline history, and active overlaps.

### PATCH `/api/complaints/:id/assign`
- **Request Body**: `{ "officerId": "...", "remarks": "Assigned for physical inspection" }`

### PATCH `/api/complaints/:id/transfer`
- **Request Body**: `{ "newBureau": "Regulation Bureau (RB)", "remarks": "Regulatory violation found" }`

### PATCH `/api/complaints/:id/status`
- **Request Body**: `{ "status": "Under Process", "remarks": "Committee formed" }`

### POST `/api/complaints/:id/escalate`
- **Request Body**: `{ "remarks": "Delay exceeds statutory limits" }`

### POST `/api/complaints/:id/remarks`
- **Request Body**: `{ "remarks": "Stakeholder meeting concluded" }`

### POST `/api/complaints/:id/documents`
- **Request**: Multipart form-data with field `document` (Max 10MB; PDF, JPG, PNG, DOCX).

---

## 5. Overlap Engine Endpoints

### GET `/api/overlaps`
- **Query Params**: `page`, `limit`, `search`, `severity`, `reviewStatus`, `bureau`
- **Description**: Paginated overlap alerts.

### GET `/api/overlaps/:id`
- **Description**: Populated overlap details with parallel complaints compared side-by-side.

### POST `/api/overlaps/:id/link-cases`
- **Request Body**: `{ "remarks": "Joint committee coordination established" }`

### POST `/api/overlaps/:id/review`
- **Request Body**: `{ "coordinatingOfficerId": "...", "reviewStatus": "Under Review", "reviewRemarks": "..." }`

### POST `/api/overlaps/:id/resolve`
- **Request Body**: `{ "remarks": "Consolidated order issued; proceedings closed" }`

### POST `/api/overlaps/:id/dismiss`
- **Request Body**: `{ "dismissalReason": "Complaints concern unrelated departments with no jurisdictional conflict" }`

### POST `/api/overlaps/scan`
- **Permissions**: Super Admin, Senior Management
- **Description**: Runs full-registry overlap detection across all institutions.

---

## 6. Report Endpoints

- `GET /api/reports/bureau`: Bureau-wise workload and disposal rates.
- `GET /api/reports/region`: Region-wise breakdown.
- `GET /api/reports/institution`: Top institution complaint aggregations.
- `GET /api/reports/status`: Lifecycle status distributions.
- `GET /api/reports/overdue`: Overdue cases with days past deadline.
- `GET /api/reports/overlaps`: Complete overlap audit ledger.
- `GET /api/reports/officer-workload`: Officer assignment ledger.
- `GET /api/reports/export.csv?type=complaints`: Direct CSV export of all complaints.
- `GET /api/reports/export.csv?type=overlaps`: Direct CSV export of all overlap alerts.

---

## 7. Administrative Endpoints

- `GET /api/admin/users`: User management list (Super Admin only).
- `POST /api/admin/users`: Provision officer account (Super Admin only).
- `PATCH /api/admin/users/:id`: Edit user permissions or activate/deactivate (Super Admin only).
- `GET /api/admin/audit-logs`: Query immutable regulatory audit ledger.
