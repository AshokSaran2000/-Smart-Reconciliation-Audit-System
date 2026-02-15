# Smart Reconciliation & Audit (SRA) System - Setup Guide

## Prerequisites
- **Node.js** v16+ (with npm)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or configure `MONGO_URI` in `.env`)

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Seed Database with Test Data
```bash
cd backend
node scripts/seed.js
```

**This creates 3 test users:**
- **Admin:** admin@example.com / Admin123!
- **Analyst:** analyst@example.com / Analyst123!
- **Viewer:** viewer@example.com / Viewer123!

### 3. Start the Backend Server
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

### 4. Start the Frontend Dev Server (in another terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 5. Open Browser
Navigate to: **`http://localhost:5173`**

Login with test credentials above.

---

## What's Included

### Backend Features
- **Authentication:** JWT-based login/register with role-based access
- **File Upload:** CSV/XLSX upload with background processing
- **Reconciliation:** Automatic matching against system records
- **Audit Trail:** Complete change history for records
- **Dashboard API:** Real-time summary stats and recent jobs

### Frontend Features  
- **Modern UI & Design:** Responsive Bootstrap + custom theme
- **Dashboard:** Real-time metrics, charts, recent jobs
- **File Upload:** Drag-and-drop, preview, field mapping
- **Records:** Searchable reconciliation status table
- **Audit Trail:** Timeline view for record changes
- **Role-based Views:** Admin/Analyst/Viewer restrictions

---

## Troubleshooting

**Issue:** MongoDB connection error
- Ensure MongoDB daemon is running: `mongod`
- Or update `MONGO_URI` in `backend/uploads/.env`

**Issue:** Port 5000 or 5173 already in use
- Change `PORT` in `backend/uploads/.env`
- Vite port can be changed in `frontend/vite.config.js`

**Issue:** API 404 errors
- Ensure backend is running on port 5000
- Check `AuthContext.jsx` has `baseURL = 'http://localhost:5000'`

**Issue:** Login not working
- Run `node scripts/seed.js` to create test users
- Check MongoDB is running and seeding completed

---

## Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```
Output in `frontend/dist/`

**Backend:** Use `npm start` or process manager (PM2)

---

## API Endpoints

All require `Authorization: Bearer <token>` header except `/api/auth/*`

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/dashboard/summary` - Dashboard stats
- `GET /api/dashboard/recent` - Recent uploads
- `GET /api/records` - List records
- `GET /api/records/:id` - Record detail + audit
- `PATCH /api/records/:id/correct` - Manual correction (Admin/Analyst)
- `POST /api/upload` - Upload file
- `GET /api/upload/status/:id` - Upload job status

---

## Database Models

- **User** - Auth users (Admin/Analyst/Viewer roles)
- **UploadJob** - File upload metadata
- **Record** - Parsed transaction records
- **SystemRecord** - Reference system records for matching
- **ReconciliationResult** - Matching status per record
- **AuditLog** - Immutable change log

---

## Configuration

**Backend `.env`** (`backend/uploads/.env`):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/reconciliation
JWT_SECRET=supersecretkey
```

---

## File Structure

```
Interview/
├── backend/
│   ├── config/          # DB & matching rules
│   ├── middleware/      # Auth & role checks
│   ├── models/          # Mongoose schemas
│   ├── scripts/         # Seed script
│   ├── uploads/
│   │   ├── routes/      # API endpoints
│   │   ├── processor.js # Background job processor
│   │   └── server.js    # Express app
│   └── uploads_files/   # Uploaded files storage
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # AuthContext
│   │   ├── styles/      # Theme & global CSS
│   │   └── App.jsx      # Main app
│   └── package.json
└── README.md
```

---

## Support Domains

- Backend API: `localhost:5000`
- Frontend UI: `localhost:5173`
- Both configured to work together locally
